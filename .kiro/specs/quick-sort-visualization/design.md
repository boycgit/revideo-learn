# 设计文档

## 概述

本设计文档描述了基于 revideo 框架的快速排序算法可视化系统的技术架构和实现细节。该系统将通过动画展示快速排序的完整执行过程，包括基准选择、分区操作和递归处理。设计遵循 revideo 的最佳实践，参考了现有的 `euclidean-algorithm.tsx` 示例的代码风格和结构。

### 核心目标

1. 创建直观、易懂的快速排序算法可视化
2. 使用彩色条形图表示数组元素
3. 通过动画展示算法的每个关键步骤
4. 提供高度可配置的参数系统
5. 保持代码的可维护性和可扩展性

## 架构

### 技术栈

- **框架**: revideo (基于 Motion Canvas)
- **语言**: TypeScript
- **UI 组件**: @revideo/2d (Rect, Txt, Line 等)
- **动画系统**: @revideo/core (yield*, all(), waitFor() 等)

### 文件结构

```
packages/examples/src/scenes/
└── quick-sort.tsx          # 主场景文件
```

### 高层架构

```
┌─────────────────────────────────────────┐
│         makeScene2D 场景函数             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    配置系统 (Config Interface)     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    数据初始化                      │  │
│  │  - 生成随机数组                    │  │
│  │  - 创建条形图引用                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    UI 组件渲染                     │  │
│  │  - 条形图 (Rect)                   │  │
│  │  - 数值标签 (Txt)                  │  │
│  │  - 说明文本 (Txt)                  │  │
│  │  - 指针标记 (Line/Txt)             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    快速排序算法实现                 │  │
│  │  - quickSortGenerator()            │  │
│  │  - partitionGenerator()            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    动画控制器                      │  │
│  │  - 高亮动画                        │  │
│  │  - 交换动画                        │  │
│  │  - 颜色变化动画                    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 组件和接口

### 1. 配置接口

```typescript
interface QuickSortConfig {
  // 数组配置
  arraySize: number;           // 数组元素数量 (20-50)
  minValue: number;            // 最小值
  maxValue: number;            // 最大值
  
  // 视觉配置
  barWidth: number;            // 条形宽度
  barSpacing: number;          // 条形间距
  baselineY: number;           // 基准线 Y 坐标
  
  // 颜色配置
  defaultColor: string;        // 默认颜色 (灰色)
  pivotColor: string;          // 基准颜色 (红色)
  compareColor: string;        // 比较颜色 (蓝色)
  swapColor: string;           // 交换颜色 (黄色)
  sortedColor: string;         // 已排序颜色 (绿色)
  leftPartitionColor: string;  // 左分区颜色 (浅绿)
  rightPartitionColor: string; // 右分区颜色 (浅紫)
  
  // 动画配置
  highlightDuration: number;   // 高亮动画时长
  swapDuration: number;        // 交换动画时长
  colorChangeDuration: number; // 颜色变化时长
  pauseDuration: number;       // 步骤间暂停时长
  
  // 算法配置
  pivotStrategy: 'right' | 'left' | 'random';  // 基准选择策略
}
```

### 2. 条形图数据结构

```typescript
interface BarData {
  value: number;              // 数值
  ref: Reference<Rect>;       // 条形引用
  labelRef: Reference<Txt>;   // 标签引用
  index: number;              // 当前索引
  isSorted: boolean;          // 是否已排序
}
```

### 3. 核心组件

#### 3.1 条形图组件 (Bar)

使用 revideo 的 `Rect` 组件创建竖直条形图：

```typescript
<Rect
  ref={barRef}
  x={calculateX(index)}
  y={baselineY - (value * scale) / 2}
  width={barWidth}
  height={value * scale}
  fill={defaultColor}
  stroke={'#ffffff'}
  lineWidth={2}
  opacity={0}
/>
```

#### 3.2 数值标签组件 (Label)

使用 `Txt` 组件显示数值：

```typescript
<Txt
  ref={labelRef}
  x={calculateX(index)}
  y={baselineY + 40}
  text={value.toString()}
  fontSize={20}
  fill={'#ffffff'}
  fontWeight={600}
  opacity={0}
/>
```

#### 3.3 说明文本组件 (Subtitle)

显示当前步骤说明：

```typescript
<Txt
  ref={subtitleRef}
  x={0}
  y={450}
  text={''}
  fontSize={32}
  fill={'#ffffff'}
  fontWeight={700}
  opacity={0}
/>
```

#### 3.4 指针标记组件 (Pointer)

使用 `Line` 和 `Txt` 组合表示 i 和 j 指针：

```typescript
<>
  <Line
    ref={pointerLineRef}
    points={[[x, y1], [x, y2]]}
    stroke={'#ffff00'}
    lineWidth={3}
    endArrow
    opacity={0}
  />
  <Txt
    ref={pointerLabelRef}
    x={x}
    y={y1 - 30}
    text={'i'}
    fontSize={28}
    fill={'#ffff00'}
    fontWeight={700}
    opacity={0}
  />
</>
```

## 数据模型

### 数组表示

数组使用 `BarData[]` 表示，每个元素包含：
- 数值
- 对应的 UI 组件引用
- 当前索引位置
- 排序状态

### 状态管理

使用局部变量和 revideo 的信号系统管理状态：

```typescript
// 数组数据
const bars: BarData[] = [];

// 当前处理的子数组范围
let currentLeft = 0;
let currentRight = arraySize - 1;

// 递归深度
let recursionDepth = 0;
```

## 算法实现

### 1. 快速排序主函数

```typescript
function* quickSortGenerator(
  bars: BarData[],
  left: number,
  right: number,
  depth: number
): Generator {
  if (left >= right) {
    // 单个元素，标记为已排序
    if (left === right) {
      yield* markAsSorted(bars[left]);
    }
    return;
  }
  
  // 显示当前处理范围
  yield* highlightPartition(bars, left, right, depth);
  
  // 选择基准
  const pivotIndex = yield* selectPivot(bars, left, right);
  
  // 分区
  const partitionIndex = yield* partitionGenerator(bars, left, right, pivotIndex);
  
  // 标记基准已就位
  yield* markAsSorted(bars[partitionIndex]);
  
  // 递归处理左子数组
  yield* quickSortGenerator(bars, left, partitionIndex - 1, depth + 1);
  
  // 递归处理右子数组
  yield* quickSortGenerator(bars, partitionIndex + 1, right, depth + 1);
}
```

### 2. 分区函数

```typescript
function* partitionGenerator(
  bars: BarData[],
  left: number,
  right: number,
  pivotIndex: number
): Generator<number> {
  // 将基准移到最右边
  if (pivotIndex !== right) {
    yield* swapBars(bars, pivotIndex, right);
  }
  
  const pivot = bars[right];
  yield* highlightPivot(pivot);
  
  let i = left - 1;
  
  // 显示指针
  const iPointer = yield* createPointer('i', i);
  const jPointer = yield* createPointer('j', left);
  
  for (let j = left; j < right; j++) {
    // 移动 j 指针
    yield* movePointer(jPointer, j);
    
    // 高亮比较元素
    yield* highlightCompare(bars[j], pivot);
    
    // 显示比较说明
    yield* showSubtitle(`比较 ${bars[j].value} 和基准 ${pivot.value}`);
    
    if (bars[j].value < pivot.value) {
      i++;
      yield* movePointer(iPointer, i);
      
      if (i !== j) {
        yield* showSubtitle(`交换 ${bars[i].value} 和 ${bars[j].value}`);
        yield* swapBars(bars, i, j);
      }
    }
    
    // 恢复颜色
    yield* resetColor(bars[j]);
  }
  
  // 将基准放到正确位置
  i++;
  yield* swapBars(bars, i, right);
  
  // 移除指针
  yield* removePointers(iPointer, jPointer);
  
  return i;
}
```

### 3. 基准选择

```typescript
function* selectPivot(
  bars: BarData[],
  left: number,
  right: number
): Generator<number> {
  let pivotIndex: number;
  
  switch (config.pivotStrategy) {
    case 'right':
      pivotIndex = right;
      break;
    case 'left':
      pivotIndex = left;
      break;
    case 'random':
      pivotIndex = Math.floor(Math.random() * (right - left + 1)) + left;
      break;
  }
  
  yield* highlightPivot(bars[pivotIndex]);
  yield* showSubtitle(`选择索引 ${pivotIndex} 的元素作为基准`);
  yield* waitFor(config.pauseDuration);
  
  return pivotIndex;
}
```

## 动画系统

### 1. 高亮动画

```typescript
function* highlightPivot(bar: BarData): Generator {
  yield* all(
    bar.ref().fill(config.pivotColor, config.highlightDuration),
    bar.ref().scale(1.1, config.highlightDuration, easeOutBack).to(1, 0.3)
  );
}

function* highlightCompare(bar: BarData, pivot: BarData): Generator {
  yield* bar.ref().fill(config.compareColor, config.highlightDuration);
}
```

### 2. 交换动画

```typescript
function* swapBars(bars: BarData[], i: number, j: number): Generator {
  const barI = bars[i];
  const barJ = bars[j];
  
  const xI = calculateX(i);
  const xJ = calculateX(j);
  
  // 高亮交换的元素
  yield* all(
    barI.ref().fill(config.swapColor, 0.2),
    barJ.ref().fill(config.swapColor, 0.2)
  );
  
  // 执行交换动画
  yield* all(
    barI.ref().x(xJ, config.swapDuration, easeInOutCubic),
    barJ.ref().x(xI, config.swapDuration, easeInOutCubic),
    barI.labelRef().x(xJ, config.swapDuration, easeInOutCubic),
    barJ.labelRef().x(xI, config.swapDuration, easeInOutCubic)
  );
  
  // 交换数组中的引用
  [bars[i], bars[j]] = [bars[j], bars[i]];
  bars[i].index = i;
  bars[j].index = j;
  
  // 恢复颜色
  yield* all(
    barI.ref().fill(config.defaultColor, 0.2),
    barJ.ref().fill(config.defaultColor, 0.2)
  );
}
```

### 3. 分区高亮

```typescript
function* highlightPartition(
  bars: BarData[],
  left: number,
  right: number,
  depth: number
): Generator {
  const color = depth % 2 === 0 
    ? config.leftPartitionColor 
    : config.rightPartitionColor;
  
  const animations = [];
  for (let i = left; i <= right; i++) {
    if (!bars[i].isSorted) {
      animations.push(
        bars[i].ref().stroke(color, config.colorChangeDuration)
      );
    }
  }
  
  yield* all(...animations);
  yield* showSubtitle(`第 ${depth + 1} 层递归：处理索引 ${left} 到 ${right}`);
  yield* waitFor(config.pauseDuration);
}
```

### 4. 标记已排序

```typescript
function* markAsSorted(bar: BarData): Generator {
  bar.isSorted = true;
  yield* all(
    bar.ref().fill(config.sortedColor, config.colorChangeDuration),
    bar.ref().stroke('#ffffff', config.colorChangeDuration)
  );
}
```

## 错误处理

### 输入验证

```typescript
function validateConfig(config: QuickSortConfig): void {
  if (config.arraySize < 5 || config.arraySize > 50) {
    throw new Error('数组大小必须在 5 到 50 之间');
  }
  
  if (config.minValue >= config.maxValue) {
    throw new Error('最小值必须小于最大值');
  }
  
  if (config.barWidth <= 0 || config.barSpacing < 0) {
    throw new Error('条形宽度和间距必须为正数');
  }
}
```

### 动画错误处理

```typescript
try {
  yield* quickSortGenerator(bars, 0, bars.length - 1, 0);
} catch (error) {
  console.error('排序动画执行失败:', error);
  yield* showSubtitle('动画执行出错，请刷新页面重试');
}
```

## 测试策略

### 1. 单元测试

虽然 revideo 场景主要是视觉的，但可以测试核心算法逻辑：

- 测试分区函数的正确性
- 测试基准选择策略
- 测试数组交换逻辑
- 测试配置验证函数

### 2. 视觉测试

- 手动测试不同数组大小 (5, 10, 20, 30, 50)
- 测试不同基准选择策略
- 测试边界情况（已排序数组、逆序数组、相同元素）
- 测试动画流畅性和时序

### 3. 性能测试

- 测试大数组 (50 个元素) 的渲染性能
- 确保帧率稳定在 30fps 以上
- 测试内存使用情况

## 性能优化

### 1. 渲染优化

- 使用 `opacity` 而非 `remove()` 来隐藏元素
- 批量执行动画使用 `all()`
- 避免不必要的重新渲染

### 2. 动画优化

- 使用适当的 easing 函数提升视觉效果
- 合理设置动画时长，避免过长或过短
- 在关键步骤添加暂停，提升可理解性

### 3. 内存优化

- 及时清理不再使用的引用
- 避免创建过多临时对象
- 复用动画函数

## 可扩展性设计

### 1. 支持其他排序算法

设计可以轻松扩展到其他排序算法：

```typescript
// 归并排序
function* mergeSortGenerator(bars: BarData[], left: number, right: number): Generator {
  // 实现归并排序可视化
}

// 堆排序
function* heapSortGenerator(bars: BarData[]): Generator {
  // 实现堆排序可视化
}
```

### 2. 自定义动画效果

通过配置接口可以轻松自定义动画：

```typescript
interface AnimationConfig {
  easingFunction: (t: number) => number;
  customColors: Record<string, string>;
  customDurations: Record<string, number>;
}
```

### 3. 交互式控制

未来可以添加交互式控制：

- 暂停/继续动画
- 调整播放速度
- 单步执行
- 重置动画

## 实现注意事项

### 1. 代码风格

- 遵循 `euclidean-algorithm.tsx` 的代码风格
- 使用 TypeScript 严格模式
- 添加详细的中文注释
- 使用有意义的变量和函数名

### 2. 配置管理

- 将所有配置项集中在文件顶部
- 为每个配置项添加注释说明
- 提供合理的默认值
- 支持通过 `useScene().variables` 覆盖配置

### 3. 动画时序

- 确保动画之间的过渡流畅
- 在关键步骤添加适当的暂停
- 使用 `yield* waitFor()` 控制节奏
- 使用 `all()` 并行执行独立动画

### 4. 视觉设计

- 使用高对比度颜色确保可见性
- 条形图底部对齐，便于比较高度
- 字体大小适中，确保可读性
- 避免元素重叠和遮挡

## 技术依赖

### 核心依赖

- `@revideo/2d`: 提供 2D 组件 (Rect, Txt, Line 等)
- `@revideo/core`: 提供动画系统和工具函数

### 使用的 API

- `makeScene2D`: 创建 2D 场景
- `createRef`: 创建组件引用
- `yield*`: 执行生成器函数
- `all()`: 并行执行多个动画
- `waitFor()`: 等待指定时间
- `easeInOutCubic`, `easeOutBack`: 缓动函数
- `useScene().variables`: 访问项目变量

## 部署和集成

### 文件位置

```
packages/examples/src/scenes/quick-sort.tsx
```

### 导出

```typescript
export default makeScene2D('quick-sort', function* (view) {
  // 场景实现
});
```

### 使用方式

```typescript
// 在项目配置中引入
import quickSort from './scenes/quick-sort';

const project = makeProject({
  scenes: [quickSort],
  variables: {
    arraySize: 30,
    pivotStrategy: 'random'
  }
});
```

## 总结

本设计提供了一个完整的快速排序可视化系统，具有以下特点：

1. **清晰的架构**: 模块化设计，职责分明
2. **高度可配置**: 支持自定义数组大小、颜色、动画时长等
3. **流畅的动画**: 使用 revideo 的动画系统实现平滑过渡
4. **易于理解**: 通过颜色、标签和说明文本帮助学习者理解算法
5. **可扩展性**: 设计支持未来添加更多功能和排序算法
6. **代码质量**: 遵循最佳实践，易于维护

该设计完全满足需求文档中的所有验收标准，并为未来的扩展预留了空间。
