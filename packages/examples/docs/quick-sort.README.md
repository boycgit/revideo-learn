# 快速排序算法可视化

这是一个使用 revideo 框架创建的快速排序（Quick Sort）算法可视化演示。

## 功能特点

- 🎨 **直观的可视化**：使用彩色条形图表示数组元素
- 🎯 **基准选择**：支持三种基准选择策略（最右、最左、随机）
- 🔄 **分区过程**：动画展示指针移动和元素交换
- 🌳 **递归结构**：用不同颜色区分递归层级
- ⚙️ **高度可配置**：支持自定义数组大小、颜色、动画速度等

## 使用方法

### 方法 1：修改配置文件

直接编辑 `quick-sort.tsx` 文件中的 `DEFAULT_CONFIG` 常量：

```typescript
const DEFAULT_CONFIG: QuickSortConfig = {
    arraySize: 12,              // 数组大小 (建议 8-20)
    minValue: 10,               // 最小值
    maxValue: 100,              // 最大值
    pivotStrategy: 'right',     // 基准选择策略
    // ... 其他配置
};
```

### 方法 2：使用项目变量

在项目配置文件 `quick-sort.ts` 中设置变量：

```typescript
export default makeProject({
  scenes: [scene],
  variables: {
    arraySize: 20,
    minValue: 5,
    maxValue: 80,
    pivotStrategy: 'random',
  },
});
```

## 配置选项

### 数组配置
- `arraySize`: 数组元素数量 (5-50，建议 8-20)
- `minValue`: 数值最小值
- `maxValue`: 数值最大值

### 基准选择策略
- `'right'`: 选择最右边的元素作为基准
- `'left'`: 选择最左边的元素作为基准
- `'random'`: 随机选择元素作为基准

### 颜色配置
- `defaultColor`: 默认状态（灰色）
- `pivotColor`: 基准元素（红色）
- `compareColor`: 正在比较（蓝色）
- `swapColor`: 正在交换（金黄色）
- `sortedColor`: 已排序（绿色）
- `leftPartitionColor`: 左分区（浅绿色）
- `rightPartitionColor`: 右分区（浅紫色）

### 动画配置
- `highlightDuration`: 高亮动画时长
- `swapDuration`: 交换动画时长
- `colorChangeDuration`: 颜色变化时长
- `pauseDuration`: 步骤间暂停时长

## 运行项目

```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm run dev

# 选择 quick-sort 项目
```

## 算法说明

快速排序是一种高效的排序算法，采用分治法（Divide and Conquer）策略：

1. **选择基准**：从数组中选择一个元素作为基准（pivot）
2. **分区操作**：将小于基准的元素移到左边，大于基准的元素移到右边
3. **递归排序**：对左右两个子数组递归执行快速排序
4. **合并结果**：由于是原地排序，不需要额外的合并步骤

### 时间复杂度
- 平均情况：O(n log n)
- 最坏情况：O(n²)（当数组已排序且选择最左或最右作为基准时）
- 最好情况：O(n log n)

### 空间复杂度
- O(log n)（递归调用栈）

## 技术栈

- **revideo**: 视频编程框架
- **TypeScript**: 类型安全的 JavaScript
- **React**: UI 组件（JSX 语法）

## 代码结构

```
quick-sort.tsx
├── 类型定义
│   ├── QuickSortConfig      # 配置接口
│   ├── BarData              # 条形图数据
│   └── PointerData          # 指针数据
├── 配置区域
│   └── DEFAULT_CONFIG       # 默认配置
├── 工具函数
│   ├── validateConfig()     # 配置验证
│   ├── generateRandomArray() # 生成随机数组
│   └── calculateScale()     # 计算缩放比例
├── 动画辅助函数
│   ├── showSubtitle()       # 显示说明
│   ├── highlightPivot()     # 高亮基准
│   ├── createPointer()      # 创建指针
│   ├── swapBars()           # 交换条形
│   └── ...
└── 算法实现
    ├── selectPivot()        # 选择基准
    ├── partitionGenerator() # 分区操作
    └── quickSortGenerator() # 快速排序主函数
```

## 扩展建议

1. **添加其他排序算法**：归并排序、堆排序等
2. **性能对比**：同时展示多种排序算法的性能
3. **交互控制**：添加暂停、继续、单步执行功能
4. **自定义数组**：允许用户输入自定义数组
5. **统计信息**：显示比较次数、交换次数等

## 参考资料

- [revideo 官方文档](https://re.video/)
- [快速排序算法详解](https://zh.wikipedia.org/wiki/快速排序)
- [算法可视化最佳实践](https://visualgo.net/)

## 许可证

MIT License
