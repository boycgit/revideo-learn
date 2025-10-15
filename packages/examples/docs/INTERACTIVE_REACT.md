# 🚀 React 交互式演示应用

## 快速启动

```bash
pnpm run interactive:react
```

浏览器将自动打开 http://localhost:3002

## 特性对比

### Canvas 版本 vs React 版本

| 特性 | Canvas 版本 | React 版本 |
|------|------------|-----------|
| 端口 | 3001 | 3002 |
| 技术栈 | 原生 TS + Canvas | React + Revideo Player |
| 代码复用 | ❌ 重新实现 | ✅ 使用现有场景 |
| 维护成本 | 高 | 低 |
| 功能完整性 | 部分 | 完整 |
| 启动命令 | `pnpm run interactive` | `pnpm run interactive:react` |

## 为什么选择 React 版本？

### ✅ 优势

1. **代码复用**
   - 直接使用 `src/scenes/euclidean-algorithm.tsx`
   - 无需重新实现动画逻辑
   - 场景更新自动同步

2. **功能完整**
   - 所有 Revideo 场景功能都可用
   - 内置播放控制
   - 支持所有动画效果

3. **易于维护**
   - 只需维护一份场景代码
   - React 组件化架构
   - TypeScript 类型安全

4. **易于扩展**
   - 添加新场景只需导入
   - 支持场景切换
   - 可以集成更多功能

### ⚠️ Canvas 版本的问题

1. **代码重复**
   - 需要重新实现所有动画逻辑
   - 与 Revideo 场景不同步
   - 维护两份代码

2. **功能受限**
   - 只能实现部分功能
   - 动画效果简化
   - 缺少高级特性

3. **维护成本高**
   - 场景更新需要同步修改
   - 容易出现不一致
   - 调试困难

## 使用方法

### 1. 启动应用

```bash
# 方式 1：从根目录
pnpm run interactive:react

# 方式 2：从 examples 目录
cd packages/examples
pnpm run interactive:react
```

### 2. 使用界面

1. 在左侧输入两个数字（1-1000）
2. 点击"开始演示"或按回车键
3. 观看 Revideo 场景动画
4. 使用播放器控制播放/暂停
5. 点击预设示例快速体验

### 3. 播放控制

- **播放/暂停**：点击播放器或按空格键
- **进度条**：拖动进度条跳转
- **音量控制**：调整音量滑块
- **全屏**：点击全屏按钮

## 技术架构

```
┌─────────────────────────────────────┐
│   React App (interactive-react)     │
│  ┌───────────────────────────────┐  │
│  │  App.tsx (主组件)              │  │
│  │  - 输入控制                    │  │
│  │  - 示例选择                    │  │
│  │  - 播放状态管理                │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  @revideo/player-react        │  │
│  │  - Player 组件                 │  │
│  │  - 播放控制                    │  │
│  │  - 进度显示                    │  │
│  └───────────┬───────────────────┘  │
└──────────────┼───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Revideo Project                     │
│  ┌────────────────────────────────┐  │
│  │  euclidean-algorithm.ts        │  │
│  │  - makeProject()               │  │
│  │  - variables: {a, b}           │  │
│  └────────────┬───────────────────┘  │
│               │                      │
│               ▼                      │
│  ┌────────────────────────────────┐  │
│  │  scenes/euclidean-algorithm.tsx│  │
│  │  - makeScene2D()               │  │
│  │  - 动画逻辑                     │  │
│  │  - 可视化效果                   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## 添加新场景

### 步骤 1：创建场景文件

```typescript
// src/scenes/sorting.tsx
import { makeScene2D } from '@revideo/2d';

export default makeScene2D('sorting', function* (view) {
  const array = view.project.variables?.array || [5, 2, 8, 1, 9];
  // 实现排序动画...
});
```

### 步骤 2：创建项目文件

```typescript
// src/sorting.ts
import { makeProject } from '@revideo/core';
import scene from './scenes/sorting';

export default makeProject({
  scenes: [scene],
  variables: {
    array: [5, 2, 8, 1, 9],
  },
});
```

### 步骤 3：在 App 中添加选择器

```typescript
// src/interactive-react/App.tsx
const [selectedScene, setSelectedScene] = useState('euclidean');

const loadProject = async (sceneName: string, variables: any) => {
  const projectModule = await import(`../${sceneName}`);
  const newProject = {
    ...projectModule.default,
    variables,
  };
  setProject(newProject);
};

// UI
<select onChange={(e) => setSelectedScene(e.target.value)}>
  <option value="euclidean">欧几里得算法</option>
  <option value="sorting">排序算法</option>
</select>
```

## 项目结构

```
packages/examples/
├── src/
│   ├── interactive-react/        # 🆕 React 应用
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── README.md
│   ├── interactive/              # Canvas 版本（旧）
│   ├── scenes/                   # Revideo 场景
│   │   └── euclidean-algorithm.tsx
│   └── euclidean-algorithm.ts    # 项目配置
├── vite.react.config.ts          # 🆕 React 配置
├── vite.interactive.config.ts    # Canvas 配置
└── package.json                  # 🔄 已更新
```

## 命令对比

| 功能 | Canvas 版本 | React 版本 |
|------|------------|-----------|
| 开发 | `pnpm run interactive` | `pnpm run interactive:react` |
| 构建 | `pnpm run interactive:build` | `pnpm run interactive:react:build` |
| 端口 | 3001 | 3002 |

## 依赖说明

### 新增依赖

```json
{
  "dependencies": {
    "@revideo/player-react": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### 安装依赖

```bash
pnpm install
```

## 常见问题

### Q: 为什么有两个版本？

A: Canvas 版本是早期实现，React 版本是改进版本。推荐使用 React 版本。

### Q: 可以删除 Canvas 版本吗？

A: 可以，但建议保留作为参考或备用方案。

### Q: 如何切换场景？

A: 在 App.tsx 中实现场景选择器，动态导入不同的项目文件。

### Q: 性能如何？

A: React 版本使用 Revideo 的优化渲染引擎，性能优于手动 Canvas 绘制。

### Q: 可以导出视频吗？

A: 可以，使用 Revideo CLI 的 render 命令导出视频。

## 下一步

- [ ] 添加场景选择器
- [ ] 实现场景切换动画
- [ ] 添加更多算法演示
- [ ] 支持自定义主题
- [ ] 添加分享功能
- [ ] 集成视频导出

## 文档

- 📖 [详细文档](packages/examples/src/interactive-react/README.md)
- 📚 [Revideo 文档](https://docs.re.video/)
- 🎬 [Player API](https://docs.re.video/api/player-react/player)

---

**推荐**: 使用 React 版本进行开发，它提供了更好的代码复用和维护性。
