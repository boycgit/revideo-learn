# Render video 按钮工作流解析

## 全局流程图

```mermaid
flowchart TD
    A[用户点击 Viewport "Render video" 按钮] --> B[Viewport.tsx 调整导出设置]
    B --> C[@revideo/core Renderer.render 获取互斥锁]
    C --> D[Renderer.run 选择并实例化 @revideo/core/ffmpeg 导出器]
    D --> E[FFmpegExporterClient 通过 Vite HMR WS 调用服务器]
    E --> F[@revideo/vite-plugin ffmpegBridgePlugin 转发请求]
    F --> G[@revideo/ffmpeg FFmpegExporterServer 驱动 FFmpeg]
    G --> H[生成帧/音频并合并为 output/video.mp4]
    H --> I[openOutputPath() 打开导出目录]
```

## 核心功能与应用场景

Render 按钮为开发者提供一键导出当前项目视频的能力：在编辑器内即时将动画项目渲染成可播放的 `mp4` 文件。它解决了以下痛点：

- **快速验证**：无需切换到 CLI 或模板项目即可生成最终成片，便于迭代动画或素材。
- **一致性输出**：统一使用 FFmpeg 导出器保证编码兼容性，与 `pnpm run template:render` 的效果保持一致。
- **自动收尾**：导出完成后自动定位输出目录，减少手动查找步骤。

典型应用场景包括：调试单个场景动画、生成 Demo 视频、或在设计评审前快速导出最新画面。

## 源码解析与关键步骤

### 1. UI 事件触发（`packages/ui/src/components/viewport/Viewport.tsx`）

```tsx
const settings = getFullRenderingSettings(project);
const exporterOptions =
  'options' in settings.exporter && settings.exporter.options
    ? settings.exporter.options
    : {};
await renderer.render({
  ...settings,
  name: project.name,
  exporter: {
    ...settings.exporter,
    name: '@revideo/core/ffmpeg',
    options: {
      ...exporterOptions,
      format: 'mp4',
    },
  },
});
await openOutputPath();
```

- **第 1-3 行**：读取项目默认渲染配置，并兼容已有导出器自定义参数。
- **第 4-12 行**：覆写导出器为 `@revideo/core/ffmpeg`，强制输出标准 MP4，同时保留原始导出选项从而支持帧率、分辨率等自定义设置。
- **第 13 行**：等待渲染结束后调用 `openOutputPath()` 在文件系统中打开导出目录。

### 2. 渲染入口（`packages/core/src/app/Renderer.ts`）

```ts
public async render(settings: RendererSettings) {
  if (this.state.current !== RendererState.Initial) return;
  await this.lock.acquire();
  this.estimator.reset();
  this.state.current = RendererState.Working;
  try {
    this.abortController = new AbortController();
    await this.run(settings, this.abortController.signal);
  } catch (e: any) {
    this.project.logger.error(e);
    // 省略错误清理逻辑
  }
  this.estimator.update(1);
  this.state.current = RendererState.Initial;
  this.sharedWebGLContext.dispose();
  this.lock.release();
}
```

- **互斥控制**：通过 `Semaphore`（`this.lock`）防止并发渲染冲突。
- **状态管理**：`RendererState` 确保 UI 可以切换到进度视图并在结束后恢复。
- **中断支持**：`AbortController` 允许用户点击 Abort 按钮终止任务。
- **清理资源**：渲染结束后释放共享 WebGL 上下文并重置进度估计器。

### 3. 导出器选择与主循环（`Renderer.run` 摘要）

```ts
const exporters: ExporterClass[] = [
  FFmpegExporterClient,
  ImageExporter,
  WasmExporter,
];
const exporterClass = exporters.find(
  exporter => exporter.id === settings.exporter.name,
);
this.exporter = await exporterClass.create(this.project, settings);
await this.exporter.start?.();
// 循环调用 playback.progress() + exporter.handleFrame(...)
await this.exporter.stop?.(result);
if (result === RendererResult.Success && this.exporter.mergeMedia) {
  await generateAudioPromise;
  await this.exporter.mergeMedia();
}
```

- **策略模式**：根据 `settings.exporter.name` 动态选取导出器，当前配置命中 `FFmpegExporterClient`。
- **帧驱动循环**：渲染器推进 `PlaybackManager`，每帧调用导出器的 `handleFrame` 传递画面数据。
- **媒体合成**：成功导出后等待音频生成并调用 `mergeMedia` 合成音视频文件。

### 4. FFmpeg 导出器客户端（`packages/core/src/exporter/FFmpegExporter.ts`）

```ts
export class FFmpegExporterClient implements Exporter {
  public async start(): Promise<void> {
    await this.invoke('start', this.settings);
  }

  public async handleFrame(canvas: HTMLCanvasElement) {
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/png'),
    );
    const dataUrl = await this.blobToDataUrl(blob!);
    await this.invoke('handleFrame', {data: dataUrl});
  }

  public async mergeMedia() {
    await this.invoke('mergeMedia', {});
  }
}
```

- **WebSocket RPC**：`invoke` 方法通过 Vite HMR WebSocket 发送 `revideo:ffmpeg-exporter` 消息，实现浏览器端与 Node 端通信。
- **逐帧传输**：将 Canvas 渲染结果转成 PNG DataURL，交由服务器编码。
- **统一收尾**：在 `mergeMedia` 中触发音视频合并，最终生成完整 MP4 文件。

### 5. Vite 插件桥接层（`packages/vite-plugin/src/partials/ffmpegBridge.ts`）

```ts
export function ffmpegBridgePlugin({output}: ExporterPluginConfig): Plugin {
  return {
    configureServer(server) {
      const ffmpegBridge = new FFmpegBridge(server.ws, {output});

      server.middlewares.use('/audio-processing/generate-audio', (req, res) =>
        handlePostRequest(req, res, data => generateAudio({...data, output})),
      );

      server.middlewares.use('/revideo-ffmpeg-decoder/finished', (req, res) =>
        handlePostRequest(req, res, () => ffmpegBridge.handleRenderFinished()),
      );
    },
  };
}
```

- **中间件路由**：注册多条 HTTP POST 接口供客户端上传音频参数、通知任务完成等。
- **WebSocket 桥接**：`FFmpegBridge` 监听 `revideo:ffmpeg-exporter` 消息，直接调用 `FFmpegExporterServer`。
- **资源回收**：`handleRenderFinished` 会清理下载的临时文件，避免磁盘堆积。

### 6. FFmpeg 服务端（`@revideo/ffmpeg` 摘要）

- **`generateAudio` / `mergeMedia`**：基于 fluent-ffmpeg 调用系统 FFmpeg/FFprobe，将缓存的音频片段与画面合并。
- **`VideoFrameExtractor`**：负责将源视频按需解码成单帧图像，供客户端重建时间轴。
- **临时目录管理**：所有中间产物存放在 `%TEMP%/revideo-*` 下，任务结束后清理。

## 技术要点

1. **信号与互斥**：通过 `Semaphore` 与 `RendererState` 实现渲染任务的原子性和 UI 状态同步。
2. **策略导出器**：`ExporterClass` 接口封装不同导出方式（FFmpeg、WASM、图像帧），便于扩展。
3. **WebSocket RPC**：复用 Vite HMR 通道进行浏览器与 Node 的双向通信，无需额外服务端部署。
4. **渐进式音视频合并**：先缓存图像帧，再异步生成音频并最终合并，降低实时编码压力。
5. **临时文件治理**：`FFmpegBridge.handleRenderFinished` 清理缓存文件，保持开发环境整洁。

## 执行流程详解

1. **输入阶段**
   - 用户点击 Render 按钮。
   - UI 读取项目默认渲染设置，覆写导出器为 FFmpeg。

2. **处理阶段**
   - `Renderer.render` 获取锁并初始化渲染态。
   - `Renderer.run` 重载场景、计算帧范围，并创建 `FFmpegExporterClient`。
   - 客户端通过 WebSocket 调用 `FFmpegExporterServer.start`，告知输出目录、帧率、分辨率等参数。
   - 渲染循环中将每帧 Canvas 图像序列化并上传，服务器暂存为序列帧。
   - 同时触发音频生成、外部视频片段下载等辅助任务。

3. **输出阶段**
   - 当所有帧上传完毕，客户端调用 `mergeMedia`，服务器使用 FFmpeg 合并音视频为 `output/video.mp4`。
   - 渲染器恢复初始状态，UI 切回预览界面。
   - `openOutputPath()` 打开导出目录供用户查看结果。

## 注意事项与最佳实践

- **FFmpeg 环境**：确保本机已安装 FFmpeg/FFprobe，并能被 `fluent-ffmpeg` 正确解析路径。
- **磁盘空间**：渲染过程中会在临时目录写入大量序列帧，需预留足够空间并关注清理。
- **导出器定制**：若需使用 WASM 导出，可在 UI 增加配置项切换导出器，同时确认播放兼容性。
- **Abort 行为**：中断任务后会触发 `AbortController`，但已生成的临时文件仍需等待 `handleRenderFinished` 清理。
- **性能调优**：可通过修改 `settings.range`、`fps`、`resolutionScale` 等参数控制导出质量与耗时。
- **多实例渲染**：渲染器采用锁机制，不可并行执行多次渲染；若需批量导出，请使用 CLI 或模板批处理脚本。

---

通过以上流程，开发者可以清晰了解 “Render video” 按钮背后的完整调用链路，并在需要时扩展或定制导出策略。
