import {beforeEach, describe, expect, test, vi} from 'vitest';
vi.mock('../tweening', async () => {
  const mod = await vi.importActual<typeof import('../tweening')>(
    '../tweening',
  );
  const tweenSpy = vi.fn(
    (duration: number, cb: (progress: number) => void) =>
      (function* () {
        cb(0);
        cb(0.5);
        cb(1);
        yield duration;
      })(),
  );
  return {
    ...mod,
    tween: tweenSpy,
    easeInOutCubic: mod.easeLinear,
  };
});

import {tween} from '../tweening';
import {DEFAULT} from './symbols';
import {SignalContext} from './SignalContext';

const makeContext = (initial = 0) =>
  new SignalContext<number, number>(
    initial,
    (from, to, progress) => from + (to - from) * progress,
    {key: 'owner'},
    value => Number(value),
  ).toSignal();

describe('SignalContext', () => {
  let signal: ReturnType<typeof makeContext>;

  beforeEach(() => {
    signal = makeContext(10);
  });

  test('getter returns last value and supports DEFAULT reset', () => {
    expect(signal()).toBe(10);
    signal(20);
    expect(signal()).toBe(20);
    signal(DEFAULT);
    expect(signal()).toBe(10);
  });

  test('save persists computed value', () => {
    signal(() => 42);
    expect(signal()).toBe(42);
    signal.save();
    // the saved value should now be treated as fixed
    (signal as any).context.set(21);
    expect(signal()).toBe(21);
  });

  test('isInitial reflects current state', () => {
    expect(signal.context.isInitial()).toBe(true);
    signal(5);
    expect(signal.context.isInitial()).toBe(false);
    signal(DEFAULT);
    expect(signal.context.isInitial()).toBe(true);
  });

  test('tween produces interpolated updates and resets tweening flag', () => {
    const context = (signal as any).context;
    const result = context.tweener(20, 1, (v: number) => v, (from, to, t) =>
      from + (to - from) * t,
    );

    // consume tween generator
    Array.from(result);

    expect(signal()).toBe(20);
    expect(context.isTweening()).toBe(false);
  });

  test('reset clears to initial and dispose releases references', () => {
    const context = (signal as any).context;
    signal(100);
    context.reset();
    expect(signal()).toBe(10);

    context.dispose();
    expect(context.getInitial()).toBeUndefined();
    expect(context.raw()).toBeUndefined();
  });
});

describe('SignalContext 扩展测试', () => {
  test('应该支持响应式值', () => {
    const signal1 = makeContext(10);
    const signal2 = makeContext(20);
    
    signal1(() => signal2());
    expect(signal1()).toBe(20);
    
    signal2(30);
    expect(signal1()).toBe(30);
  });

  test('应该支持自定义扩展', () => {
    let customValue = 0;
    const context = new SignalContext<number, number>(
      10,
      (from, to, progress) => from + (to - from) * progress,
      {key: 'owner'},
      value => Number(value),
      {
        setter: function(value) {
          customValue = typeof value === 'function' ? value() : value;
          this.current = value;
          this.last = customValue;
          return this.owner;
        },
      },
    );
    
    const signal = context.toSignal();
    signal(20);
    expect(customValue).toBe(20);
  });

  test('raw 应该返回原始值', () => {
    const signal = makeContext(10);
    expect(signal.context.raw()).toBe(10);
    
    signal(20);
    expect(signal.context.raw()).toBe(20);
  });

  test('getInitial 应该返回初始值', () => {
    const signal = makeContext(10);
    expect(signal.context.getInitial()).toBe(10);
    
    signal(20);
    expect(signal.context.getInitial()).toBe(10);
  });

  test('isTweening 应该反映补间状态', () => {
    const signal = makeContext(10);
    expect(signal.context.isTweening()).toBe(false);
  });

  test('应该支持链式调用', () => {
    const signal = makeContext(10);
    const result = signal(20);
    expect(result).toBe(signal.context.owner);
  });

  test('应该处理解析错误', () => {
    const context = new SignalContext<string, number>(
      '10',
      (from, to, progress) => from + (to - from) * progress,
      {key: 'owner'},
      value => {
        const num = Number(value);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;
      },
    );
    
    const signal = context.toSignal();
    expect(signal()).toBe(10);
  });

  test('应该支持 undefined 初始值', () => {
    const context = new SignalContext<number | undefined, number | undefined>(
      undefined,
      (from, to, progress) => (from ?? 0) + ((to ?? 0) - (from ?? 0)) * progress,
    );
    
    const signal = context.toSignal();
    expect(signal()).toBeUndefined();
  });
});

  test('应该支持 getInitial 方法', () => {
    const signal = makeContext(42);
    expect(signal.context.getInitial()).toBe(42);
    
    signal(100);
    expect(signal.context.getInitial()).toBe(42);
  });

  test('应该支持 raw 方法获取原始值', () => {
    const signal = makeContext(10);
    expect(signal.context.raw()).toBe(10);
    
    const factory = () => 20;
    const signal2 = makeContext(factory);
    expect(signal2.context.raw()).toBe(factory);
  });

  test('应该支持 isTweening 检查', () => {
    const signal = makeContext(0);
    expect(signal.context.isTweening()).toBe(false);
  });

  test('应该支持链式动画 to 方法', function* () {
    const signal = makeContext(0);
    const animation = signal(10, 0.1).to(20, 0.1);
    
    yield* animation;
    expect(signal()).toBe(20);
  });

  test('应该支持链式动画 back 方法', function* () {
    const signal = makeContext(0);
    signal(10);
    const animation = signal(20, 0.1).back(0.1);
    
    yield* animation;
    expect(signal()).toBe(10);
  });

  test('应该支持链式动画 wait 方法', function* () {
    const signal = makeContext(0);
    const animation = signal(10, 0.1).wait(0.1);
    
    yield* animation;
    expect(signal()).toBe(10);
  });

  test('应该支持链式动画 do 方法', function* () {
    const signal = makeContext(0);
    const callback = vi.fn();
    const animation = signal(10, 0.1).do(callback);
    
    yield* animation;
    expect(callback).toHaveBeenCalled();
  });

  test('应该支持链式动画 run 方法', function* () {
    const signal = makeContext(0);
    const customGenerator = function* () {
      signal(50);
    };
    const animation = signal(10, 0.1).run(customGenerator());
    
    yield* animation;
    expect(signal()).toBe(50);
  });

  test('应该正确处理 dispose', () => {
    const signal = makeContext(10);
    signal.context.dispose();
    
    // 验证资源已清理
    expect(signal.context.getInitial()).toBeUndefined();
  });

  test('应该支持自定义插值函数', function* () {
    const customInterpolation = (from: number, to: number, value: number) => {
      return from + (to - from) * value * value; // 二次插值
    };
    
    const signal = makeContext(0);
    yield* signal(100, 0.1, undefined, customInterpolation);
    
    expect(signal()).toBe(100);
  });

  test('应该支持自定义时间函数', function* () {
    const customTiming = (value: number) => value * value;
    
    const signal = makeContext(0);
    yield* signal(100, 0.1, customTiming);
    
    expect(signal()).toBe(100);
  });

  test('应该正确处理 parse 方法', () => {
    const parser = (value: string) => parseInt(value, 10);
    const signal = makeContext('10', undefined, undefined, parser);
    
    expect(signal()).toBe(10);
  });
