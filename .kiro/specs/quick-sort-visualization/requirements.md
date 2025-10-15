# 需求文档

## 简介

本项目旨在使用 revideo 框架创建一个交互式的快速排序（Quick Sort）算法可视化演示。通过动画展示快速排序的核心思想——分治法（Divide and Conquer）和基准（Pivot）划分过程，帮助学习者直观理解算法的执行步骤。该演示将以通俗易懂、互动性强的方式呈现，使用彩色条形图表示数组元素，通过高亮、移动和颜色变化等动画效果展示排序过程。

## 需求

### 需求 1：初始状态展示

**用户故事：** 作为学习者，我希望看到待排序数组的初始状态，以便了解排序前的数据分布。

#### 验收标准

1. WHEN 动画开始 THEN 系统 SHALL 显示一组竖直彩色条形图，每个条形代表数组中的一个元素
2. WHEN 显示初始状态 THEN 系统 SHALL 使用 20-50 个随机高度的矩形条形
3. WHEN 显示条形图 THEN 系统 SHALL 为每个条形使用默认颜色（如灰色）
4. WHEN 显示条形图 THEN 系统 SHALL 在每个条形上方或内部显示对应的数值
5. WHEN 初始化完成 THEN 系统 SHALL 显示标题文本"快速排序算法演示"

### 需求 2：基准选择可视化

**用户故事：** 作为学习者，我希望清楚地看到哪个元素被选为基准，以便理解快速排序的第一步。

#### 验收标准

1. WHEN 开始排序步骤 THEN 系统 SHALL 高亮显示被选为基准的条形（使用特殊颜色如红色）
2. WHEN 选择基准 THEN 系统 SHALL 在基准条形上方显示"Pivot"标签
3. WHEN 选择基准 THEN 系统 SHALL 显示说明文本，例如"选择最右边的元素作为基准"
4. IF 基准选择策略可配置 THEN 系统 SHALL 支持最右边、最左边或随机选择基准
5. WHEN 基准被选中 THEN 系统 SHALL 使用动画效果（如缩放或闪烁）强调基准元素

### 需求 3：分区过程可视化

**用户故事：** 作为学习者，我希望看到分区（Partition）过程的详细步骤，以便理解元素如何根据基准重新排列。

#### 验收标准

1. WHEN 开始分区 THEN 系统 SHALL 显示两个指针（i 和 j）从数组两端向中间移动
2. WHEN 指针移动 THEN 系统 SHALL 使用不同颜色（如蓝色）高亮当前正在比较的元素
3. WHEN 需要交换元素 THEN 系统 SHALL 使用平滑动画展示两个条形的位置交换
4. WHEN 交换发生 THEN 系统 SHALL 显示说明文本，例如"交换元素 X 和 Y"
5. WHEN 分区完成 THEN 系统 SHALL 将基准元素移动到正确的位置
6. WHEN 分区完成 THEN 系统 SHALL 显示说明文本，例如"基准元素已就位"
7. WHEN 比较元素 THEN 系统 SHALL 暂停足够时间让学习者观察当前状态

### 需求 4：递归子数组处理可视化

**用户故事：** 作为学习者，我希望看到算法如何递归处理左右子数组，以便理解分治法的核心思想。

#### 验收标准

1. WHEN 分区完成 THEN 系统 SHALL 使用不同颜色区分左右子数组（如绿色表示左半区，紫色表示右半区）
2. WHEN 处理子数组 THEN 系统 SHALL 显示当前正在处理的子数组范围
3. WHEN 递归深入 THEN 系统 SHALL 显示递归层级信息，例如"第 2 层递归：处理左子数组"
4. WHEN 子数组只有一个元素 THEN 系统 SHALL 将该元素标记为已排序（使用特殊颜色如金色）
5. WHEN 递归返回 THEN 系统 SHALL 显示说明文本，例如"左子数组排序完成"
6. WHEN 所有递归完成 THEN 系统 SHALL 将所有条形变为已排序颜色

### 需求 5：最终状态展示

**用户故事：** 作为学习者，我希望看到排序完成后的最终状态，以便确认算法正确执行。

#### 验收标准

1. WHEN 排序完成 THEN 系统 SHALL 显示所有条形按升序排列
2. WHEN 排序完成 THEN 系统 SHALL 将所有条形变为统一的完成颜色（如绿色）
3. WHEN 排序完成 THEN 系统 SHALL 显示完成文本，例如"排序完成！"
4. WHEN 排序完成 THEN 系统 SHALL 播放庆祝动画（如条形依次闪烁或波浪效果）
5. WHEN 显示最终状态 THEN 系统 SHALL 保持足够时间让学习者观察结果

### 需求 6：可配置性

**用户故事：** 作为开发者或教师，我希望能够自定义演示参数，以便适应不同的教学场景。

#### 验收标准

1. WHEN 初始化场景 THEN 系统 SHALL 支持配置初始数组的元素数量
2. WHEN 初始化场景 THEN 系统 SHALL 支持配置初始数组的数值范围
3. WHEN 初始化场景 THEN 系统 SHALL 支持配置各种颜色（默认色、基准色、比较色、已排序色等）
4. WHEN 初始化场景 THEN 系统 SHALL 支持配置动画速度和暂停时长
5. WHEN 初始化场景 THEN 系统 SHALL 支持配置基准选择策略
6. WHEN 配置参数 THEN 系统 SHALL 将所有配置项集中在代码顶部的配置区域
7. WHEN 配置参数 THEN 系统 SHALL 为每个配置项提供清晰的注释说明

### 需求 7：代码规范和项目结构

**用户故事：** 作为项目维护者，我希望代码遵循现有项目的编码风格，以便于后续维护和扩展。

#### 验收标准

1. WHEN 创建新文件 THEN 系统 SHALL 将场景文件放置在 `packages/examples/src/scenes/` 目录下
2. WHEN 编写代码 THEN 系统 SHALL 参考 `euclidean-algorithm.tsx` 的编码风格
3. WHEN 编写代码 THEN 系统 SHALL 使用 TypeScript 和 React 语法
4. WHEN 编写代码 THEN 系统 SHALL 使用 revideo 的 `makeScene2D` 函数创建场景
5. WHEN 编写代码 THEN 系统 SHALL 使用 revideo 的动画 API（如 `yield*`、`all()`、`waitFor()` 等）
6. WHEN 定义配置 THEN 系统 SHALL 创建配置接口（interface）定义所有可配置参数
7. WHEN 编写代码 THEN 系统 SHALL 添加适当的中文注释说明关键逻辑
8. WHEN 命名文件 THEN 系统 SHALL 使用 kebab-case 格式，例如 `quick-sort.tsx`

### 需求 8：性能和用户体验

**用户故事：** 作为学习者，我希望动画流畅且易于理解，以便获得良好的学习体验。

#### 验收标准

1. WHEN 播放动画 THEN 系统 SHALL 确保动画帧率稳定在 30fps 以上
2. WHEN 显示说明文本 THEN 系统 SHALL 使用清晰易读的字体和字号
3. WHEN 切换状态 THEN 系统 SHALL 使用平滑的过渡动画（easing functions）
4. WHEN 显示多个元素 THEN 系统 SHALL 确保视觉层次清晰，避免元素重叠
5. WHEN 处理大数组 THEN 系统 SHALL 自动调整条形宽度和间距以适应画布
6. WHEN 播放动画 THEN 系统 SHALL 在关键步骤之间添加适当的暂停时间
7. WHEN 显示颜色 THEN 系统 SHALL 确保颜色对比度足够，便于区分不同状态
