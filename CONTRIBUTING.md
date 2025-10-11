# 贡献指南

非常感谢你关注并贡献 Revideo！下面的内容将帮助你快速了解如何参与项目的开发与维护。

## 如何参与

- **提交议题（Issue）**：在 GitHub 的 [Issues](https://github.com/redotvideo/revideo/issues) 区反馈 Bug、提出需求或分享想法。
- **提交拉取请求（Pull Request）**：实现修复或特性后，可直接发起 PR。较大的改动最好先通过 Issue 或 Discord 与维护者沟通。
- **社区交流**：加入我们的 [Discord 服务器](https://discord.com/invite/JDjbfp6q2G)，与其他开发者讨论实现思路、获取反馈或寻找协作伙伴。
- **宣传项目**：向更多开发者分享 Revideo，也是在为社区做贡献。

## 开发环境准备

1. **Fork 并克隆仓库**：先 fork 项目到自己的账户，随后在本地克隆。
2. **安装依赖**：项目使用 `pnpm` 管理依赖，执行：
   ```bash
   pnpm install
   ```
3. **本地示例项目**：`packages/template` 内含一个示例项目，便于验证改动：
   ```bash
   pnpm run template:dev     # 启动开发预览
   pnpm run template:render  # 渲染示例视频
   ```
   也可进入 `packages/template` 目录，直接运行对应脚本。

## 常用工作流

Revideo 是基于 Lerna 与 pnpm 的多包仓库，位于 `packages` 目录下的包彼此联动。在修改任意包的代码后，请执行全量构建以确保所有依赖包正常工作：

```bash
pnpm -r run build
```

> 如果调试时发现终端日志被缓存忽略，可追加 `--skip-nx-cache` 参数强制全量构建。

### 代码结构速览

以下为主要包及职责，可帮助你快速定位需要修改的模块：

- `@revideo/core`：动画运行时、信号系统、协程与调度逻辑。
- `@revideo/2d`：2D 渲染库，包含各类图形节点与编辑器支持。
- `@revideo/renderer`：基于 Puppeteer 的无头渲染服务。
- `@revideo/ffmpeg`：视频导出与音视频处理工具集。
- `@revideo/vite-plugin`：充当“伪后端”的 Vite 插件，处理 WebSocket、.meta 文件等服务端职责。
- `@revideo/ui`：基于 Preact 的可视化编辑器界面。
- `@revideo/player` / `@revideo/player-react`：播放器与 React 封装。
- `@revideo/cli` / `@revideo/create`：命令行工具与项目脚手架。
- `@revideo/examples` / `@revideo/template`：示例场景与本地开发模板。

目前项目仍以 Vite 插件的方式承载后端逻辑，相关实现位于 `packages/vite-plugin/src/partials/`。例如 `ffmpegExporter.ts` 负责与 `@revideo/ffmpeg` 中的 `FFmpegExporterServer` 进行 WebSocket 通信。未来可能迁移到更传统的服务端架构，但在此之前如需扩展“后端”能力，请参考这些部分。

## 提交前自检清单

在提交 PR 之前，请至少完成以下检查，以便通过 CI 并减轻维护者负担：

1. **构建验证**：
   ```bash
   pnpm -r run build
   ```
2. **格式化与 Lint**：
   ```bash
   pnpm run prettier:fix
   pnpm run eslint:fix
   ```
3. **遵循 Conventional Commits**：提交信息请使用类似 `fix: `、`feat(ffmpeg): `、`chore: ` 的格式，方便自动化工具与版本管理。

CI/CD 基于 GitHub Actions，配置位于 `.github/workflows/`。`verify.yml` 会在 PR 阶段执行上述检查流程，请确保本地验证通过后再提交。

## 寻求帮助

- **社区支持**：加入 [Discord 服务器](https://discord.com/invite/JDjbfp6q2G)，直接与维护团队和其他贡献者交流。
- **邮件联系**：如有其它问题，可发送邮件至 `hello@re.video`。

再次感谢你的参与，期待与你一起完善 Revideo！
