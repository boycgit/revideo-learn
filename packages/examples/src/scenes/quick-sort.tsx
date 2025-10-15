/**
 * 快速排序算法可视化
 * 
 * 本文件实现了快速排序（Quick Sort）算法的动画演示，通过彩色条形图展示排序过程。
 * 
 * 主要功能：
 * - 使用竖直条形图表示数组元素
 * - 动画展示基准选择、分区操作和递归处理
 * - 支持多种基准选择策略（最右、最左、随机）
 * - 高度可配置的颜色、动画时长和数组参数
 * 
 * 使用方法：
 * 1. 直接修改 DEFAULT_CONFIG 中的配置项
 * 2. 或通过项目变量覆盖配置（参见下方注释）
 * 
 * @author revideo
 * @see https://re.video/
 */

import { Rect, Txt, makeScene2D, Line } from '@revideo/2d';
import {
    createRef,
    waitFor,
    all,
    easeInOutCubic,
    easeOutBack,
    useScene,
    Reference,
} from '@revideo/core';

// ============================================
// 类型定义
// ============================================

// 快速排序可视化配置接口
interface QuickSortConfig {
    // 数组配置
    arraySize: number;           // 数组元素数量 (5-50)
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

// 条形图数据结构
interface BarData {
    value: number;              // 数值
    ref: Reference<Rect>;       // 条形引用
    labelRef: Reference<Txt>;   // 标签引用
    index: number;              // 当前索引
    isSorted: boolean;          // 是否已排序
}

// 指针数据结构
interface PointerData {
    lineRef: Reference<Line>;   // 指针线引用
    labelRef: Reference<Txt>;   // 指针标签引用
}

// ============================================
// 配置区域 - 在这里修改初始值
// ============================================
// 修改这些值来自定义快速排序演示：
//   - arraySize: 数组元素数量 (建议 10-30)
//   - minValue/maxValue: 数值范围
//   - pivotStrategy: 基准选择策略
//     * 'right': 选择最右边的元素
//     * 'left': 选择最左边的元素
//     * 'random': 随机选择元素
// ============================================
const DEFAULT_CONFIG: QuickSortConfig = {
    // 数组配置
    arraySize: 12,              // 👈 修改这里：数组大小 (建议 8-20 以获得最佳体验)
    minValue: 10,               // 👈 修改这里：最小值
    maxValue: 100,              // 👈 修改这里：最大值

    // 视觉配置
    barWidth: 45,               // 条形宽度（会根据数组大小自动调整）
    barSpacing: 12,             // 条形间距
    baselineY: 250,             // 基准线位置

    // 颜色配置（高对比度设计）
    defaultColor: '#666666',    // 灰色 - 默认状态
    pivotColor: '#e13238',      // 红色 - 基准元素
    compareColor: '#4a90e2',    // 蓝色 - 正在比较
    swapColor: '#ffd700',       // 金黄色 - 正在交换
    sortedColor: '#4caf50',     // 绿色 - 已排序
    leftPartitionColor: '#90ee90',   // 浅绿色 - 左分区
    rightPartitionColor: '#dda0dd',  // 浅紫色 - 右分区

    // 动画配置（优化后的时长）
    highlightDuration: 0.3,     // 高亮动画
    swapDuration: 0.6,          // 交换动画
    colorChangeDuration: 0.4,   // 颜色变化
    pauseDuration: 0.8,         // 步骤间暂停

    // 算法配置
    pivotStrategy: 'right',     // 👈 修改这里：基准选择策略 ('right' | 'left' | 'random')
};

// ============================================
// 工具函数
// ============================================

// 验证配置参数的有效性
function validateConfig(config: QuickSortConfig): void {
    // 检查数组大小
    if (config.arraySize < 5 || config.arraySize > 50) {
        throw new Error('数组大小必须在 5 到 50 之间');
    }

    // 检查数值范围
    if (config.minValue >= config.maxValue) {
        throw new Error('最小值必须小于最大值');
    }

    // 检查视觉参数
    if (config.barWidth <= 0 || config.barSpacing < 0) {
        throw new Error('条形宽度必须为正数，间距必须为非负数');
    }

    // 检查动画时长
    if (config.highlightDuration <= 0 || config.swapDuration <= 0) {
        throw new Error('动画时长必须为正数');
    }

    // 对于较大的数组给出警告
    if (config.arraySize > 30) {
        console.warn('数组较大，动画可能较长');
    }
}

// 生成随机数组
function generateRandomArray(size: number, min: number, max: number): number[] {
    const array: number[] = [];
    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        array.push(value);
    }
    return array;
}

// 根据数组值范围计算合适的缩放比例
function calculateScale(values: number[], maxHeight: number): number {
    const maxValue = Math.max(...values);
    return maxHeight / maxValue;
}

// 根据数值计算条形高度
function calculateBarHeight(value: number, scale: number): number {
    return value * scale;
}

// 计算条形图的 X 坐标位置
function calculateX(index: number, totalCount: number, barWidth: number, barSpacing: number): number {
    const totalWidth = totalCount * barWidth + (totalCount - 1) * barSpacing;
    const startX = -totalWidth / 2 + barWidth / 2;
    return startX + index * (barWidth + barSpacing);
}

// ============================================
// 动画辅助函数
// ============================================

// 显示说明文本
function* showSubtitle(subtitleRef: Reference<Txt>, text: string, duration: number = 0.3): Generator {
    subtitleRef().text(text);
    yield* subtitleRef().opacity(1, duration);
}

// 隐藏说明文本
function* hideSubtitle(subtitleRef: Reference<Txt>, duration: number = 0.3): Generator {
    yield* subtitleRef().opacity(0, duration);
}

// 高亮基准元素
function* highlightPivot(bar: BarData, config: QuickSortConfig, subtitleRef: Reference<Txt>): Generator {
    // 高亮颜色变化和缩放动画
    yield* all(
        bar.ref().fill(config.pivotColor, config.highlightDuration),
        bar.ref().scale(1.15, config.highlightDuration, easeOutBack).to(1, 0.3)
    );
}

// 选择基准元素
function* selectPivot(
    bars: BarData[],
    left: number,
    right: number,
    config: QuickSortConfig,
    subtitleRef: Reference<Txt>
): Generator<any, number, any> {
    let pivotIndex: number;

    // 根据策略选择基准
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
        default:
            pivotIndex = right;
    }

    // 显示选择说明
    yield* showSubtitle(
        subtitleRef,
        `选择索引 ${pivotIndex} 的元素 ${bars[pivotIndex].value} 作为基准 (Pivot)`
    );

    // 高亮基准元素
    yield* highlightPivot(bars[pivotIndex], config, subtitleRef);

    // 添加 Pivot 标签
    const pivotLabelRef = createRef<Txt>();
    const pivotBar = bars[pivotIndex];
    const barHeight = pivotBar.value * calculateScale(
        bars.map(b => b.value),
        400
    );

    // 动态获取 view（通过 bar 的父节点）
    const view = pivotBar.ref().view();
    view.add(
        <Txt
            ref={pivotLabelRef}
            x={pivotBar.ref().x()}
            y={config.baselineY - barHeight - 40}
            text={'Pivot'}
            fontSize={24}
            fill={config.pivotColor}
            fontWeight={700}
            opacity={0}
        />
    );

    yield* pivotLabelRef().opacity(1, 0.3);

    yield* waitFor(config.pauseDuration);

    return pivotIndex;
}

// 创建指针
function* createPointer(
    label: string,
    index: number,
    bars: BarData[],
    config: QuickSortConfig,
    color: string = '#ffff00'
): Generator<any, PointerData, any> {
    const pointerLineRef = createRef<Line>();
    const pointerLabelRef = createRef<Txt>();

    const bar = bars[index];
    const x = bar.ref().x();
    const y1 = config.baselineY + 60;
    const y2 = config.baselineY + 80;

    const view = bar.ref().view();

    // 添加指针线
    view.add(
        <Line
            ref={pointerLineRef}
            points={[[x, y1], [x, y2]]}
            stroke={color}
            lineWidth={4}
            endArrow
            arrowSize={12}
            opacity={0}
        />
    );

    // 添加指针标签
    view.add(
        <Txt
            ref={pointerLabelRef}
            x={x}
            y={y2 + 25}
            text={label}
            fontSize={24}
            fill={color}
            fontWeight={700}
            opacity={0}
        />
    );

    // 淡入动画
    yield* all(
        pointerLineRef().opacity(1, 0.3),
        pointerLabelRef().opacity(1, 0.3)
    );

    return {
        lineRef: pointerLineRef,
        labelRef: pointerLabelRef,
    };
}

// 移动指针
function* movePointer(
    pointer: PointerData,
    index: number,
    bars: BarData[],
    config: QuickSortConfig,
    duration: number = 0.4
): Generator {
    const bar = bars[index];
    const x = bar.ref().x();
    const y1 = config.baselineY + 60;
    const y2 = config.baselineY + 80;

    yield* all(
        pointer.lineRef().points([[x, y1], [x, y2]], duration, easeInOutCubic),
        pointer.labelRef().x(x, duration, easeInOutCubic)
    );
}

// 移除指针
function* removePointers(...pointers: PointerData[]): Generator {
    const animations = [];
    for (const pointer of pointers) {
        animations.push(pointer.lineRef().opacity(0, 0.3));
        animations.push(pointer.labelRef().opacity(0, 0.3));
    }
    yield* all(...animations);

    // 移除节点
    for (const pointer of pointers) {
        pointer.lineRef().remove();
        pointer.labelRef().remove();
    }
}

// 高亮比较元素
function* highlightCompare(bar: BarData, config: QuickSortConfig): Generator {
    yield* bar.ref().fill(config.compareColor, config.highlightDuration);
}

// 恢复默认颜色
function* resetColor(bar: BarData, config: QuickSortConfig): any {
    if (!bar.isSorted) {
        yield* bar.ref().fill(config.defaultColor, config.colorChangeDuration);
    }
}

// 交换两个条形
function* swapBars(
    bars: BarData[],
    i: number,
    j: number,
    config: QuickSortConfig,
    subtitleRef: Reference<Txt>
): Generator {
    if (i === j) return;

    const barI = bars[i];
    const barJ = bars[j];

    const xI = barI.ref().x();
    const xJ = barJ.ref().x();

    // 显示交换说明
    yield* showSubtitle(
        subtitleRef,
        `交换元素 ${barI.value} 和 ${barJ.value}`
    );

    // 高亮交换的元素
    yield* all(
        barI.ref().fill(config.swapColor, 0.2),
        barJ.ref().fill(config.swapColor, 0.2)
    );

    yield* waitFor(0.2);

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
        resetColor(barI, config),
        resetColor(barJ, config)
    );
}

// 分区函数
function* partitionGenerator(
    bars: BarData[],
    left: number,
    right: number,
    pivotIndex: number,
    config: QuickSortConfig,
    subtitleRef: Reference<Txt>
): Generator<any, number, any> {
    // 将基准移到最右边
    if (pivotIndex !== right) {
        yield* swapBars(bars, pivotIndex, right, config, subtitleRef);
    }

    const pivot = bars[right];

    // 显示分区开始
    yield* showSubtitle(
        subtitleRef,
        `开始分区：将小于 ${pivot.value} 的元素移到左边`
    );
    yield* waitFor(config.pauseDuration);

    let i = left - 1;

    // 创建指针（如果范围足够大）
    let iPointer: PointerData | null = null;
    let jPointer: PointerData | null = null;

    if (right - left > 2) {
        // 只在有足够空间时显示指针
        if (i >= 0) {
            iPointer = yield* createPointer('i', Math.max(left, i), bars, config, '#00ff00');
        }
        jPointer = yield* createPointer('j', left, bars, config, '#ff00ff');
    }

    // 遍历数组进行分区
    for (let j = left; j < right; j++) {
        // 移动 j 指针
        if (jPointer) {
            yield* movePointer(jPointer, j, bars, config, 0.3);
        }

        // 高亮比较元素
        yield* highlightCompare(bars[j], config);

        // 显示比较说明
        yield* showSubtitle(
            subtitleRef,
            `比较 ${bars[j].value} 和基准 ${pivot.value}`
        );

        yield* waitFor(config.pauseDuration * 0.6);

        // 如果当前元素小于基准
        if (bars[j].value < pivot.value) {
            i++;

            // 移动 i 指针
            if (iPointer) {
                yield* movePointer(iPointer, i, bars, config, 0.3);
            } else if (i >= left && right - left > 2) {
                // 第一次创建 i 指针
                iPointer = yield* createPointer('i', i, bars, config, '#00ff00');
            }

            // 交换元素
            if (i !== j) {
                yield* swapBars(bars, i, j, config, subtitleRef);
            } else {
                yield* showSubtitle(
                    subtitleRef,
                    `${bars[j].value} < ${pivot.value}，位置正确`
                );
            }
        } else {
            yield* showSubtitle(
                subtitleRef,
                `${bars[j].value} >= ${pivot.value}，保持不动`
            );
        }

        // 恢复颜色
        yield* resetColor(bars[j], config);

        yield* waitFor(config.pauseDuration * 0.4);
    }

    // 将基准放到正确位置
    i++;

    yield* showSubtitle(
        subtitleRef,
        `将基准 ${pivot.value} 放到正确位置 (索引 ${i})`
    );

    yield* swapBars(bars, i, right, config, subtitleRef);

    // 移除指针
    if (iPointer && jPointer) {
        yield* removePointers(iPointer, jPointer);
    } else if (iPointer) {
        yield* removePointers(iPointer);
    } else if (jPointer) {
        yield* removePointers(jPointer);
    }

    yield* waitFor(config.pauseDuration * 0.5);

    return i;
}

// ============================================
// 快速排序算法实现
// ============================================

// 高亮分区范围
// 用不同颜色标记当前正在处理的子数组范围，帮助理解递归结构
function* highlightPartition(
    bars: BarData[],
    left: number,
    right: number,
    depth: number,
    config: QuickSortConfig,
    subtitleRef: Reference<Txt>
): Generator {
    // 根据递归深度选择颜色（奇偶层使用不同颜色）
    const color = depth % 2 === 0
        ? config.leftPartitionColor
        : config.rightPartitionColor;

    const animations = [];
    for (let i = left; i <= right; i++) {
        if (!bars[i].isSorted) {
            animations.push(
                bars[i].ref().stroke(color, config.colorChangeDuration)
            );
            animations.push(
                bars[i].ref().lineWidth(4, config.colorChangeDuration)
            );
        }
    }

    if (animations.length > 0) {
        yield* all(...animations);
    }

    // 显示递归层级信息
    yield* showSubtitle(
        subtitleRef,
        `第 ${depth + 1} 层递归：处理索引 ${left} 到 ${right} 的子数组`
    );

    yield* waitFor(config.pauseDuration);
}

// 标记元素为已排序
function* markAsSorted(bar: BarData, config: QuickSortConfig): Generator {
    bar.isSorted = true;
    yield* all(
        bar.ref().fill(config.sortedColor, config.colorChangeDuration),
        bar.ref().stroke('#ffffff', config.colorChangeDuration),
        bar.ref().lineWidth(2, config.colorChangeDuration)
    );
}

// 快速排序主函数（递归实现）
// 这是快速排序的核心算法，使用分治法递归处理数组
function* quickSortGenerator(
    bars: BarData[],
    left: number,
    right: number,
    depth: number,
    config: QuickSortConfig,
    subtitleRef: Reference<Txt>
): any {
    // 基准情况：子数组为空或只有一个元素
    // 这是递归的终止条件
    if (left >= right) {
        if (left === right) {
            // 单个元素，直接标记为已排序
            yield* showSubtitle(
                subtitleRef,
                `索引 ${left} 的元素 ${bars[left].value} 已就位`
            );
            yield* markAsSorted(bars[left], config);
            yield* waitFor(config.pauseDuration * 0.5);
        }
        return;
    }

    // 显示当前处理范围
    yield* highlightPartition(bars, left, right, depth, config, subtitleRef);

    // 选择基准
    const pivotIndex = yield* selectPivot(bars, left, right, config, subtitleRef);

    // 分区
    const partitionIndex = yield* partitionGenerator(
        bars,
        left,
        right,
        pivotIndex,
        config,
        subtitleRef
    );

    // 标记基准已就位
    yield* showSubtitle(
        subtitleRef,
        `基准元素 ${bars[partitionIndex].value} 已就位 (索引 ${partitionIndex})`
    );
    yield* markAsSorted(bars[partitionIndex], config);
    yield* waitFor(config.pauseDuration);

    // 递归处理左子数组
    if (partitionIndex - 1 > left) {
        yield* showSubtitle(
            subtitleRef,
            `递归处理左子数组 (索引 ${left} 到 ${partitionIndex - 1})`
        );
        yield* waitFor(config.pauseDuration * 0.7);
        yield* quickSortGenerator(bars, left, partitionIndex - 1, depth + 1, config, subtitleRef);

        yield* showSubtitle(
            subtitleRef,
            `左子数组排序完成`
        );
        yield* waitFor(config.pauseDuration * 0.5);
    }

    // 递归处理右子数组
    if (partitionIndex + 1 < right) {
        yield* showSubtitle(
            subtitleRef,
            `递归处理右子数组 (索引 ${partitionIndex + 1} 到 ${right})`
        );
        yield* waitFor(config.pauseDuration * 0.7);
        yield* quickSortGenerator(bars, partitionIndex + 1, right, depth + 1, config, subtitleRef);

        yield* showSubtitle(
            subtitleRef,
            `右子数组排序完成`
        );
        yield* waitFor(config.pauseDuration * 0.5);
    }
}

export default makeScene2D('quick-sort', function* (view) {
    // 设置背景颜色为暗灰色
    view.fill('#2a2a2a');

    // 使用配置
    const config = DEFAULT_CONFIG;

    // ============================================
    // 项目变量支持
    // ============================================
    // 可以通过项目配置覆盖默认值，例如：
    // const project = makeProject({
    //   scenes: [quickSort],
    //   variables: {
    //     arraySize: 20,
    //     minValue: 5,
    //     maxValue: 80,
    //     pivotStrategy: 'random'
    //   }
    // });
    // ============================================

    // 从项目变量中读取，如果没有则使用默认值
    const arraySize = useScene().variables.get('arraySize', config.arraySize)();
    const minValue = useScene().variables.get('minValue', config.minValue)();
    const maxValue = useScene().variables.get('maxValue', config.maxValue)();
    const pivotStrategy = useScene().variables.get('pivotStrategy', config.pivotStrategy)() as 'right' | 'left' | 'random';

    // 更新配置
    config.arraySize = arraySize;
    config.minValue = minValue;
    config.maxValue = maxValue;
    config.pivotStrategy = pivotStrategy;

    // 验证配置
    validateConfig(config);

    // 生成随机数组
    const values = generateRandomArray(config.arraySize, config.minValue, config.maxValue);

    // 计算缩放比例（最大高度为 400 像素）
    const scale = calculateScale(values, 400);

    // 根据数组大小自动调整条形宽度和间距
    if (config.arraySize > 20) {
        config.barWidth = Math.max(25, 900 / config.arraySize);
        config.barSpacing = Math.max(5, 200 / config.arraySize);
    } else if (config.arraySize > 15) {
        config.barWidth = Math.max(30, 1000 / config.arraySize);
        config.barSpacing = Math.max(8, 250 / config.arraySize);
    }

    // 创建条形图数据数组
    const bars: BarData[] = [];

    // 创建 UI 组件引用
    const titleRef = createRef<Txt>();
    const subtitleRef = createRef<Txt>();

    // 添加标题和说明文本到场景
    yield view.add(
        <>
            {/* 标题 */}
            <Txt
                ref={titleRef}
                x={0}
                y={-400}
                text={'快速排序算法演示'}
                fontSize={48}
                fill={'#ffffff'}
                fontWeight={700}
                opacity={0}
            />
            {/* 说明文本 */}
            <Txt
                ref={subtitleRef}
                x={0}
                y={450}
                text={''}
                fontSize={28}
                fill={'#ffffff'}
                fontWeight={600}
                opacity={0}
            />
        </>,
    );

    // 创建条形图和标签
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const barRef = createRef<Rect>();
        const labelRef = createRef<Txt>();

        const x = calculateX(i, config.arraySize, config.barWidth, config.barSpacing);
        const barHeight = value * scale;
        const y = config.baselineY - barHeight / 2;

        // 添加条形图
        view.add(
            <Rect
                ref={barRef}
                x={x}
                y={y}
                width={config.barWidth}
                height={barHeight}
                fill={config.defaultColor}
                stroke={'#ffffff'}
                lineWidth={2}
                opacity={0}
            />
        );

        // 添加数值标签
        view.add(
            <Txt
                ref={labelRef}
                x={x}
                y={config.baselineY + 30}
                text={value.toString()}
                fontSize={18}
                fill={'#ffffff'}
                fontWeight={600}
                opacity={0}
            />
        );

        // 保存到数组
        bars.push({
            value,
            ref: barRef,
            labelRef,
            index: i,
            isSorted: false,
        });
    }

    // 初始淡入动画
    yield* waitFor(0.5);

    // 显示标题
    yield* titleRef().opacity(1, 0.8);

    yield* waitFor(0.3);

    // 显示所有条形图和标签
    const fadeInAnimations = [];
    for (const bar of bars) {
        fadeInAnimations.push(bar.ref().opacity(1, 0.6));
        fadeInAnimations.push(bar.labelRef().opacity(1, 0.6));
    }
    yield* all(...fadeInAnimations);

    // 显示初始说明
    subtitleRef().text(`待排序数组包含 ${config.arraySize} 个元素`);
    yield* subtitleRef().opacity(1, 0.5);

    yield* waitFor(config.pauseDuration * 1.5);

    // 淡出初始说明
    yield* subtitleRef().opacity(0, 0.3);

    // 执行快速排序
    try {
        console.log('开始快速排序动画');
        console.log(`数组大小: ${bars.length}, 数值范围: ${config.minValue}-${config.maxValue}`);
        console.log(`基准选择策略: ${config.pivotStrategy}`);

        yield* quickSortGenerator(bars, 0, bars.length - 1, 0, config, subtitleRef);

        // 排序完成，显示最终状态
        yield* hideSubtitle(subtitleRef);
        yield* waitFor(0.5);

        // 确保所有元素都标记为已排序（以防有遗漏）
        const finalAnimations = [];
        for (const bar of bars) {
            if (!bar.isSorted) {
                bar.isSorted = true;
                finalAnimations.push(
                    bar.ref().fill(config.sortedColor, config.colorChangeDuration)
                );
                finalAnimations.push(
                    bar.ref().stroke('#ffffff', config.colorChangeDuration)
                );
            }
        }
        if (finalAnimations.length > 0) {
            yield* all(...finalAnimations);
        }

        // 显示完成文本
        yield* showSubtitle(subtitleRef, '排序完成！');

        // 庆祝动画：条形依次闪烁波浪效果
        for (let i = 0; i < bars.length; i++) {
            bars[i].ref().scale(1.2, 0.15, easeOutBack).to(1, 0.15);
            yield* waitFor(0.05);
        }

        yield* waitFor(1);

        // 再次波浪效果
        for (let i = 0; i < bars.length; i++) {
            bars[i].ref().scale(1.15, 0.12, easeOutBack).to(1, 0.12);
            yield* waitFor(0.04);
        }

        // 保持最终状态
        yield* waitFor(2);

        console.log('快速排序动画完成');

    } catch (error) {
        console.error('排序动画执行失败:', error);
        console.error('错误详情:', error);
        yield* showSubtitle(subtitleRef, '动画执行出错，请刷新页面重试');
        yield* waitFor(3);
    }
});
