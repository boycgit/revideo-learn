# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Revideo is an open source framework for programmatic video editing, forked from Motion Canvas. It transforms Motion Canvas from a standalone application into a library for building video editing applications. Key differentiators include headless rendering, parallelized rendering for speed, and robust audio support.

## Development Commands

### Initial Setup
```bash
# Install dependencies (uses pnpm workspaces via Lerna)
npm install

# Build entire project (required after code changes)
npx lerna run build

# Build without cache (use when console.logs are ignored)
npx lerna run build --skip-nx-cache
```

### Core Development Workflow
This is a Lerna-managed monorepo. Always build after making changes:

```bash
# Core package (animation engine)
npm run core:dev      # Watch mode for development
npm run core:build    # Build core package
npm run core:test     # Run core tests

# 2D renderer package (visual components)
npm run 2d:dev        # Watch mode
npm run 2d:build      # Build 2D package
npm run 2d:test       # Run 2D tests

# UI package (visual editor)
npm run ui:dev        # Start UI dev server
npm run ui:build      # Build UI package

# Template project (for testing during development)
npm run template:dev    # Start template project for testing
npm run template:render # Render video from template
```

### Testing
```bash
# Run tests for specific packages
npm run core:test
npm run 2d:test
npm run e2e:test

# Individual package tests (uses vitest)
cd packages/core && npm run test
```

### Code Quality
```bash
# Linting
npm run eslint          # Check for lint issues
npm run eslint:fix      # Auto-fix lint issues

# Formatting
npm run prettier        # Check code formatting
npm run prettier:fix    # Auto-fix formatting
```

### Package-Specific Commands
```bash
# Other development commands
npm run player:dev
npm run vite-plugin:dev
npm run examples:dev
npm run renderer:build
npm run ffmpeg:build
```

## Architecture Overview

### Package Hierarchy & Responsibilities

**Foundation Layer:**
- `@revideo/core` - Animation engine, scenes, tweening, signals, flow control, media handling, threading. The foundation that powers all animations.

**Rendering Layer:**
- `@revideo/2d` - 2D rendering system with visual components built on top of core
- `@revideo/renderer` - Headless video renderer using Puppeteer (split into client/server components)
- `@revideo/ffmpeg` - FFmpeg utilities and video export logic

**Developer Experience:**
- `@revideo/vite-plugin` - Acts as quasi-backend via Vite plugins (contains server-side logic in `src/partials/`)
- `@revideo/ui` - Visual editor interface built with Preact
- `@revideo/cli` - Command-line interface for rendering and server operations

**Integration & Deployment:**
- `@revideo/player` / `@revideo/player-react` - Browser playback components
- `@revideo/create` - Project bootstrapping tool
- `@revideo/template` - Example project for development testing

### Key Architectural Patterns

**Vite Plugin as Backend:**
Revideo doesn't use a traditional backend server. Server-side functionality is implemented as Vite plugins in `@revideo/vite-plugin/src/partials/`:
- `ffmpegExporter.ts` - Browser-to-FFmpeg communication via WebSocket
- Other partials handle .meta file operations and project management

**Scene System:**
Scenes are generator functions that use `yield*` to control animation flow. Core scene types are in `packages/core/src/scenes/`.

**Component Hierarchy:**
All 2D visual elements inherit from `Node` → `Shape` → specific components. Available in `@revideo/2d/src/lib/components/`:
- **Layout:** Node, Layout, View2D
- **Shapes:** Rect, Circle, Line, Polygon, Path
- **Media:** Img, Video, Audio
- **Text:** Txt, TxtLeaf, Code, CodeBlock, Latex
- **Curves:** Curve, Bezier, CubicBezier, QuadBezier, Spline
- **Other:** Grid, Icon, SVG, Rive

**Signal-Based Reactivity:**
Uses a signals system from `@revideo/core` for reactive properties. Animation properties are signals that can be tweened over time.

### Development Testing Pattern
Use `packages/template` as your test project during development:
- Navigate to `packages/template` and run `npm run dev` or `npm run render`
- Or use root-level commands: `npm run template:dev` / `npm run template:render`

## Language and Communication Standards

### Output Language Rules (from CLAUDE.md)
- **AI Assistant Responses:** Use Chinese for user communication
- **User Interface Text:** All frontend content in Chinese
- **Code Comments:** Use Chinese for team understanding
- **Variable and Function Names:** Use English with camelCase

### Code Style Conventions
- TypeScript/React components use English naming
- Console logs and error messages use English
- Documentation strings and comments use Chinese
- Configuration file descriptions use Chinese

## Requirements
- Node.js >= 20.0.0
- npm (configured to use pnpm for workspace management via lerna.json)

## Build System Notes
- Uses Rollup for package bundling (see individual `rollup.config.mjs` files)
- Nx for build caching (configured in `nx.json`)
- Build cache can be bypassed with `--skip-nx-cache` flag if needed



## 语言和沟通规范

### 输出语言规则
- **AI助手响应**: 使用中文与用户沟通
- **用户界面文本**: 所有前端显示内容使用中文
- **代码注释**: 使用中文编写，便于团队理解
- **变量和函数命名**: 使用英文，遵循驼峰命名法

### 代码风格约定
- TypeScript/React组件使用英文命名
- 控制台日志和错误信息使用英文
- 文档字符串和注释使用中文
- 配置文件中的描述性字段使用中文

### Kiro 项目中使用的语言
 - 生成 Kiro 项目中的 Specs 等文档的时候优先使用中文

### 特殊情况处理
- 当需要在代码中包含用户可见的文本时，优先使用中文
- 对于需要与用户交流的场景，如用户反馈、问题排查等，优先使用中文
- API响应和数据结构保持英文
- 调试信息和开发者工具输出使用中文

## 其他
- 如无显式要求，不要输出 markdown 格式的说明、总结文档等。
- 本仓库使用 pnpm 管理安装 npm 包等依赖，尽可能不要使用 npm 或者 yarn 来安装依赖；