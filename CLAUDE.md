# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Revideo is an open source framework for programmatic video editing, forked from Motion Canvas. It transforms Motion Canvas from a standalone application into a library for building video editing applications. Key differentiators include headless rendering, parallelized rendering for speed, and robust audio support.

## Build & Development Commands

### Monorepo Management
This is a Lerna-managed monorepo using pnpm workspaces. Always build after making changes:

```bash
# Install dependencies
npm install

# Build entire project (required after code changes)
npx lerna run build

# Build without cache (use when console.logs are ignored)
npx lerna run build --skip-nx-cache
```

### Package-Specific Commands
Work with individual packages using workspace-scoped commands:

```bash
# Core package
npm run core:dev      # Watch mode for development
npm run core:build    # Build core package
npm run core:test     # Run core tests

# 2D renderer package
npm run 2d:dev        # Watch mode
npm run 2d:build      # Build 2D package
npm run 2d:test       # Run 2D tests

# UI package
npm run ui:dev        # Start UI dev server
npm run ui:build      # Build UI package

# Renderer package
npm run renderer:build

# Template (test project)
npm run template:dev    # Start template project for testing
npm run template:render # Render video from template

# Other packages
npm run player:dev
npm run player:build
npm run vite-plugin:dev
npm run vite-plugin:build
npm run examples:dev
npm run examples:build
```

### Testing
```bash
# Run tests for specific package
npm run core:test
npm run 2d:test
npm run e2e:test

# Individual package tests use vitest
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

### Development Workflow
Use `packages/template` as your test project when developing:
- Navigate to `packages/template` and run `npm run dev` or `npm run render`
- Or use `npm run template:dev` / `npm run template:render` from root

## Architecture

### Package Structure & Responsibilities

**Core Packages:**
- `@revideo/core` - Animation engine, scenes, tweening, signals, flow control, media handling, threading. The foundation that powers all animations.
- `@revideo/2d` - 2D rendering system with components (Node, Shape, Layout, Txt, Img, Video, Audio, Code, Latex, Curve, Spline, etc.). Built on top of core.

**Rendering & Output:**
- `@revideo/renderer` - Headless video renderer using Puppeteer. Split into client (browser-based) and server (Node.js) components. Entry point: `renderVideo()`.
- `@revideo/ffmpeg` - FFmpeg utilities and video export logic. Handles frame stitching and audio encoding.

**Developer Experience:**
- `@revideo/vite-plugin` - Vite plugin that acts as a quasi-backend. Contains partials for different server responsibilities (ffmpeg export via WebSocket, .meta file I/O). Located in `vite-plugin/src/partials/`.
- `@revideo/ui` - Visual editor interface built with Preact. For editing animations in the browser.
- `@revideo/cli` - Command-line interface for rendering and server operations.

**Integration:**
- `@revideo/player` - Non-React player for browser playback.
- `@revideo/player-react` - React component wrapper for embedding Revideo projects.
- `@revideo/create` - Project bootstrapping (`npm init @revideo@latest`).

**Support:**
- `@revideo/telemetry` - Anonymous usage tracking (disable with `DISABLE_TELEMETRY=true`).
- `@revideo/template` - Example project for testing during development.
- `@revideo/examples` - Animation examples for documentation.
- `@revideo/e2e` - End-to-end tests.

### Key Architecture Patterns

**Vite Plugin as Backend:**
Revideo doesn't have a traditional backend server. Instead, functionality that doesn't run in the browser is implemented as Vite plugins in `@revideo/vite-plugin`. Check `vite-plugin/src/partials/` for different server-side features:
- `ffmpegExporter.ts` - Manages browser-to-FFmpegExporterServer communication via WebSocket
- Other partials handle .meta file operations and project management

**Scene System:**
Scenes are generator functions that use `yield*` to control animation flow. The core scene types are in `packages/core/src/scenes/`.

**Component Hierarchy (2D):**
All 2D visual elements inherit from `Node` → `Shape` → specific components (Rect, Circle, Txt, etc.). See `packages/2d/src/lib/components/`.

**Signal-Based Reactivity:**
Revideo uses a signals system (from `@revideo/core`) for reactive properties. Animation properties are signals that can be tweened over time.

## Common Patterns

### TypeScript Configuration
- Root-level `tsconfig.json` doesn't exist (monorepo pattern)
- Each package has its own `tsconfig.json` and `tsconfig.build.json`
- Core exports: signals, tweening, scenes, flow control, decorators, threading, transitions

### Creating Scenes
```typescript
import {makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';

export default makeScene2D('sceneName', function* (view) {
  // Generator function using yield* for timing
  yield* waitFor(1);
});
```

### Component System
2D components available in `@revideo/2d/lib/components`:
- Layout: Node, Layout, View2D
- Shapes: Rect, Circle, Line, Polygon, Path
- Media: Img, Video, Audio
- Text: Txt, TxtLeaf, Code, CodeBlock, Latex
- Curves: Curve, Bezier, CubicBezier, QuadBezier, Spline
- Other: Grid, Icon, SVG, Rive

## Contributing Guidelines

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `feat(ffmpeg):` - Feature for specific package
- `fix:` - Bug fix
- `chore:` - Maintenance
- `docs:` - Documentation

### Pre-PR Checklist
1. Run `npx lerna run build` to verify build succeeds
2. Run `npm run prettier:fix` to fix formatting
3. Run `npm run eslint:fix` to fix lint issues
4. Ensure commit messages follow Conventional Commits

### Build Caching
The build process caches changes. If console.logs aren't appearing:
```bash
npx lerna run build --skip-nx-cache
```

## Requirements
- Node.js >= 20.0.0
- npm (uses pnpm for workspace management, configured in lerna.json)


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