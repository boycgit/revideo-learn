import { Rect, Txt, makeScene2D } from '@revideo/2d';
import {
    createRef,
    waitFor,
    all,
    easeInOutCubic,
    easeOutBack,
} from '@revideo/core';

// 根据输入数字计算合适的缩放比例
function calculateScale(a: number, b: number): number {
    const maxValue = Math.max(a, b);
    const maxWidth = 600; // 最大允许宽度

    if (maxValue * 10 > maxWidth) {
        return maxWidth / maxValue;
    }
    return 10; // 默认缩放比例
}

// 格式化数学表达式
function formatExpression(
    a: number,
    b: number,
    quotient: number,
    remainder: number,
): string {
    return `${a} = ${b} × ${quotient} + ${remainder}`;
}

// 验证输入是否为正整数
function validateInput(a: number, b: number): void {
    // 检查是否为正数
    if (a <= 0 || b <= 0) {
        throw new Error('输入必须是正整数');
    }

    // 检查是否为整数
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
        throw new Error('输入必须是整数');
    }

    // 检查是否为有限数
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error('输入必须是有限数');
    }

    // 对于较大的数字给出警告
    if (a > 1000 || b > 1000) {
        console.warn('输入数字较大，可能影响可视化效果');
    }
}

// 可视化配置接口
interface VisualizationConfig {
    initialA: number;
    initialB: number;
    baseScale: number;
    rectHeight: number;
    colorA: string;
    colorB: string;
    colorGCD: string;
    stepDuration: number;
    transitionDuration: number;
    pauseDuration: number;
}

// 默认配置
const DEFAULT_CONFIG: VisualizationConfig = {
    initialA: 48,
    initialB: 18,
    baseScale: 10,
    rectHeight: 80,
    colorA: '#e13238',
    colorB: '#4a90e2',
    colorGCD: '#4caf50',
    stepDuration: 1.5,
    transitionDuration: 0.8,
    pauseDuration: 0.5,
};

export default makeScene2D('euclidean-algorithm', function* (view) {
    // 使用配置
    const config = DEFAULT_CONFIG;
    const initialA = config.initialA;
    const initialB = config.initialB;

    // 验证输入
    validateInput(initialA, initialB);

    // 计算缩放比例
    const scale = calculateScale(initialA, initialB);

    // 创建引用
    const rectA = createRef<Rect>();
    const rectB = createRef<Rect>();
    const labelA = createRef<Txt>();
    const labelB = createRef<Txt>();
    const expression = createRef<Txt>();
    const resultText = createRef<Txt>();

    // 初始化变量
    let a = initialA;
    let b = initialB;

    // 添加矩形和标签到场景
    view.add(
        <>
            {/* 矩形 A */}
            <Rect
                ref={rectA}
                x={-300}
                y={0}
                width={a * scale}
                height={config.rectHeight}
                fill={config.colorA}
                stroke={'#ffffff'}
                lineWidth={2}
                opacity={0}
            />
            {/* 标签 A */}
            <Txt
                ref={labelA}
                x={-300}
                y={-config.rectHeight / 2 - 40}
                text={a.toString()}
                fontSize={32}
                fill={'#ffffff'}
                fontWeight={700}
                opacity={0}
            />
            {/* 矩形 B */}
            <Rect
                ref={rectB}
                x={100}
                y={0}
                width={b * scale}
                height={config.rectHeight}
                fill={config.colorB}
                stroke={'#ffffff'}
                lineWidth={2}
                opacity={0}
            />
            {/* 标签 B */}
            <Txt
                ref={labelB}
                x={100}
                y={-config.rectHeight / 2 - 40}
                text={b.toString()}
                fontSize={32}
                fill={'#ffffff'}
                fontWeight={700}
                opacity={0}
            />
            {/* 数学表达式 */}
            <Txt
                ref={expression}
                x={0}
                y={200}
                text={''}
                fontSize={28}
                fill={'#ffffff'}
                fontWeight={600}
                opacity={0}
            />
            {/* 结果文本 */}
            <Txt
                ref={resultText}
                x={0}
                y={-200}
                text={''}
                fontSize={36}
                fill={config.colorGCD}
                fontWeight={700}
                opacity={0}
            />
        </>,
    );

    // 初始淡入动画
    yield* all(
        rectA().opacity(1, 1),
        rectB().opacity(1, 1),
        labelA().opacity(1, 1),
        labelB().opacity(1, 1),
    );

    // 暂停让用户观察初始状态
    yield* waitFor(config.pauseDuration);

    // 算法迭代循环
    while (b !== 0) {
        // 计算商和余数
        const quotient = Math.floor(a / b);
        const remainder = a % b;

        // 显示数学表达式
        const expr = formatExpression(a, b, quotient, remainder);
        expression().text(expr);
        yield* expression().opacity(1, 0.5);

        // 暂停显示表达式
        yield* waitFor(config.stepDuration);

        // 淡出表达式
        yield* expression().opacity(0, 0.5);

        // 如果余数为 0，退出循环
        if (remainder === 0) {
            break;
        }

        // 更新矩形尺寸和位置
        yield* all(
            rectA().width(b * scale, config.transitionDuration, easeInOutCubic),
            rectB().width(remainder * scale, config.transitionDuration, easeInOutCubic),
            labelA().text(b.toString(), config.transitionDuration),
            labelB().text(remainder.toString(), config.transitionDuration),
        );

        // 更新变量
        a = b;
        b = remainder;

        // 暂停
        yield* waitFor(config.pauseDuration);
    }

    // 高亮显示最大公约数
    yield* all(
        rectA().fill(config.colorGCD, config.transitionDuration, easeInOutCubic),
        rectB().opacity(0, config.transitionDuration),
        labelB().opacity(0, config.transitionDuration),
    );

    // 显示结果文本
    resultText().text(`最大公约数 = ${a}`);
    yield* resultText().opacity(1, 0.5);

    // 添加强调动画（缩放回弹效果）
    yield* rectA().scale(1.2, 0.6, easeOutBack).to(1, 0.4);

    // 最终暂停
    yield* waitFor(2);
});
