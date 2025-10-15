import { Rect, Txt, makeScene2D, Line } from '@revideo/2d';
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
    colorC: string;
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
    colorC: '#ff9800',
    colorGCD: '#4caf50',
    stepDuration: 1.5,
    transitionDuration: 0.8,
    pauseDuration: 0.5,
};

export default makeScene2D('euclidean-algorithm', function* (view) {
    // 设置背景颜色为暗灰色
    view.fill('#2a2a2a');

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
    const subtitle = createRef<Txt>();
    const divisionLine = createRef<Line>();
    const quotientLabel = createRef<Txt>();

    // 初始化变量
    let a = initialA;
    let b = initialB;

    // 定义底部基准线位置
    const baselineY = 200;

    // 添加矩形和标签到场景
    view.add(
        <>
            {/* 矩形 A - 竖向，底部对齐 */}
            <Rect
                ref={rectA}
                x={-200}
                y={baselineY - (a * scale) / 2}
                width={config.rectHeight}
                height={a * scale}
                fill={config.colorA}
                stroke={'#ffffff'}
                lineWidth={2}
                opacity={0}
            />
            {/* 标签 A */}
            <Txt
                ref={labelA}
                x={-200 - config.rectHeight / 2 - 50}
                y={baselineY - a * scale / 2}
                text={a.toString()}
                fontSize={32}
                fill={'#ffffff'}
                fontWeight={700}
                opacity={0}
            />
            {/* 矩形 B - 竖向，底部对齐 */}
            <Rect
                ref={rectB}
                x={200}
                y={baselineY - (b * scale) / 2}
                width={config.rectHeight}
                height={b * scale}
                fill={config.colorB}
                stroke={'#ffffff'}
                lineWidth={2}
                opacity={0}
            />
            {/* 标签 B */}
            <Txt
                ref={labelB}
                x={200 + config.rectHeight / 2 + 50}
                y={baselineY - b * scale / 2}
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
                y={350}
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
                y={-350}
                text={''}
                fontSize={36}
                fill={config.colorGCD}
                fontWeight={700}
                opacity={0}
            />
            {/* 字幕说明 */}
            <Txt
                ref={subtitle}
                x={0}
                y={450}
                text={''}
                fontSize={36}
                fill={'#ffffff'}
                fontWeight={700}
                opacity={0}
            />
            {/* 虚线 - 用于标记商的位置 */}
            <Line
                ref={divisionLine}
                points={[
                    [-400, 0],
                    [400, 0],
                ]}
                stroke={'#ffff00'}
                lineWidth={3}
                lineDash={[10, 10]}
                opacity={0}
            />
            {/* 商的标签 */}
            <Txt
                ref={quotientLabel}
                x={-450}
                y={0}
                text={''}
                fontSize={28}
                fill={'#ffff00'}
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

    // 显示初始说明
    subtitle().text(`开始计算 ${initialA} 和 ${initialB} 的最大公约数`);
    yield* subtitle().opacity(1, 0.5);

    // 暂停让用户观察初始状态
    yield* waitFor(config.pauseDuration);

    // 淡出初始说明
    yield* subtitle().opacity(0, 0.3);

    // 算法迭代循环
    let step = 1;
    while (b !== 0) {
        // 计算商和余数
        const quotient = Math.floor(a / b);
        const remainder = a % b;

        // 显示步骤说明
        subtitle().text(`第 ${step} 步：用 ${a} 除以 ${b}`);
        yield* subtitle().opacity(1, 0.3);

        // 显示数学表达式
        const expr = formatExpression(a, b, quotient, remainder);
        expression().text(expr);
        yield* expression().opacity(1, 0.5);

        // 暂停显示表达式
        yield* waitFor(config.stepDuration * 0.5);

        // 显示商的可视化：在左侧矩形上叠加虚线，表示 b × quotient 的高度
        const divisionHeight = b * quotient * scale;
        const divisionY = baselineY - divisionHeight;

        divisionLine().y(divisionY);
        quotientLabel().text(`商 = ${quotient}`);
        quotientLabel().y(divisionY);

        // 显示虚线和商标签
        yield* all(
            divisionLine().opacity(0.8, 0.5),
            quotientLabel().opacity(1, 0.5),
        );

        // 创建虚框矩形来表示商（在右侧矩形和虚线之间堆叠）
        const stackedRects: Rect[] = [];
        const bHeight = b * scale;

        // 在右侧矩形上方堆叠 quotient - 1 个虚框矩形
        for (let i = 1; i < quotient; i++) {
            const stackRect = new Rect({
                x: 200,
                y: baselineY - bHeight / 2 - i * bHeight,
                width: config.rectHeight,
                height: bHeight,
                fill: config.colorB,
                stroke: config.colorB,
                lineWidth: 2,
                lineDash: [8, 8],
                opacity: 0,
            });
            view.add(stackRect);
            stackedRects.push(stackRect);
        }

        // 逐个显示堆叠的虚框矩形
        for (const rect of stackedRects) {
            yield* rect.opacity(0.5, 0.3);
            yield* waitFor(0.2);
        }

        // 创建余数矩形和标签（在虚线上方，右侧矩形位置）
        let remainderRect: Rect | null = null;
        let remainderLabel: Txt | null = null;
        if (remainder > 0) {
            const remainderHeight = remainder * scale;
            remainderRect = new Rect({
                x: 200,
                y: divisionY - remainderHeight / 2,
                width: config.rectHeight,
                height: remainderHeight,
                fill: config.colorC,
                stroke: config.colorC,
                lineWidth: 2,
                lineDash: [8, 8],
                opacity: 0,
            });
            view.add(remainderRect);

            // 创建余数标签
            remainderLabel = new Txt({
                x: 200 + config.rectHeight / 2 + 80,
                y: divisionY - remainderHeight / 2,
                text: `余数: ${remainder}`,
                fontSize: 28,
                fill: config.colorC,
                fontWeight: 700,
                opacity: 0,
            });
            view.add(remainderLabel);

            yield* all(
                remainderRect.opacity(0.5, 0.5),
                remainderLabel.opacity(1, 0.5),
            );
        }

        // 更新字幕说明商的含义
        subtitle().text(`${b} 可以叠 ${quotient} 次，虚线上方是余数 ${remainder}`);

        yield* waitFor(config.stepDuration);

        // 淡出堆叠的虚框矩形、余数矩形和标签
        const fadeOutAnims = stackedRects.map(rect => rect.opacity(0, 0.5));
        if (remainderRect) {
            fadeOutAnims.push(remainderRect.opacity(0, 0.5));
        }
        if (remainderLabel) {
            fadeOutAnims.push(remainderLabel.opacity(0, 0.5));
        }
        yield* all(...fadeOutAnims);

        // 移除堆叠的矩形和标签
        stackedRects.forEach(rect => rect.remove());
        if (remainderRect) {
            remainderRect.remove();
        }
        if (remainderLabel) {
            remainderLabel.remove();
        }

        // 如果余数为 0，退出循环
        if (remainder === 0) {
            // 显示完成说明
            subtitle().text(`余数为 0，${b} 就是最大公约数`);
            yield* all(
                expression().opacity(0, 0.5),
                divisionLine().opacity(0, 0.5),
                quotientLabel().opacity(0, 0.5),
            );
            yield* waitFor(1);
            break;
        }

        // 淡出可视化元素
        yield* all(
            expression().opacity(0, 0.5),
            divisionLine().opacity(0, 0.5),
            quotientLabel().opacity(0, 0.5),
        );

        // 显示辗转相除的说明
        subtitle().text(`辗转相除：${b} 移到左边，余数 ${remainder} 移到右边`);

        // 创建临时余数矩形，从虚线位置移动到右侧底部位置
        const tempRemainderRect = new Rect({
            x: 200,
            y: divisionY - (remainder * scale) / 2,
            width: config.rectHeight,
            height: remainder * scale,
            fill: config.colorC,
            stroke: '#ffffff',
            lineWidth: 2,
            opacity: 0.5,
        });
        view.add(tempRemainderRect);

        const tempRemainderLabel = new Txt({
            x: 200 + config.rectHeight / 2 + 50,
            y: divisionY - (remainder * scale) / 2,
            text: remainder.toString(),
            fontSize: 32,
            fill: '#ffffff',
            fontWeight: 700,
            opacity: 1,
        });
        view.add(tempRemainderLabel);

        // 同时执行：右侧矩形移到左侧，余数矩形移到右侧底部
        yield* all(
            // 右侧矩形移到左侧
            rectB().x(-200, config.transitionDuration, easeInOutCubic),
            rectB().fill(config.colorA, config.transitionDuration, easeInOutCubic),
            // 右侧标签移到左侧
            labelB().x(-200 - config.rectHeight / 2 - 50, config.transitionDuration, easeInOutCubic),
            // 左侧原矩形淡出
            rectA().opacity(0, config.transitionDuration),
            labelA().opacity(0, config.transitionDuration),
            // 余数矩形移到右侧底部位置
            tempRemainderRect.y(baselineY - (remainder * scale) / 2, config.transitionDuration, easeInOutCubic),
            tempRemainderRect.fill(config.colorB, config.transitionDuration, easeInOutCubic),
            tempRemainderRect.opacity(1, config.transitionDuration),
            tempRemainderRect.lineDash([], config.transitionDuration),
            // 余数标签移到右侧位置
            tempRemainderLabel.y(baselineY - (remainder * scale) / 2, config.transitionDuration, easeInOutCubic),
        );

        // 更新左侧矩形的属性以匹配新的 B 值
        rectA().height(b * scale);
        rectA().y(baselineY - (b * scale) / 2);
        rectA().fill(config.colorA);
        rectA().x(-200);
        labelA().text(b.toString());
        labelA().y(baselineY - b * scale / 2);
        labelA().x(-200 - config.rectHeight / 2 - 50);

        // 恢复左侧矩形的透明度
        rectA().opacity(1);
        labelA().opacity(1);

        // 更新右侧矩形的属性
        rectB().height(remainder * scale);
        rectB().y(baselineY - (remainder * scale) / 2);
        rectB().fill(config.colorB);
        rectB().x(200);
        labelB().text(remainder.toString());
        labelB().y(baselineY - remainder * scale / 2);
        labelB().x(200 + config.rectHeight / 2 + 50);

        // 移除临时矩形
        tempRemainderRect.remove();
        tempRemainderLabel.remove();

        // 更新变量
        a = b;
        b = remainder;
        step++;

        // 淡出字幕
        yield* subtitle().opacity(0, 0.3);

        // 暂停
        yield* waitFor(config.pauseDuration);
    }

    // 高亮显示最大公约数
    yield* all(
        rectA().fill(config.colorGCD, config.transitionDuration, easeInOutCubic),
        rectB().opacity(0, config.transitionDuration),
        labelB().opacity(0, config.transitionDuration),
        subtitle().opacity(0, config.transitionDuration),
    );

    // 显示结果文本
    resultText().text(`最大公约数 = ${a}`);
    yield* resultText().opacity(1, 0.5);

    // 添加强调动画（缩放回弹效果）
    yield* rectA().scale(1.2, 0.6, easeOutBack).to(1, 0.4);

    // 最终暂停
    yield* waitFor(2);
});
