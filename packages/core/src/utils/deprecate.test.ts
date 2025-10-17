import {describe, expect, it, vi} from 'vitest';
import {deprecate} from './deprecate';
import {startScene, endScene} from './useScene';

describe('deprecate', () => {
  it('应该包装函数并记录警告', () => {
    const mockScene = {
      logger: {
        warn: vi.fn(),
      },
    } as any;

    startScene(mockScene);

    const originalFn = vi.fn((x: number) => x * 2);
    const deprecatedFn = deprecate(originalFn, 'This function is deprecated');

    const result = deprecatedFn(5);

    expect(result).toBe(10);
    expect(originalFn).toHaveBeenCalledWith(5);
    expect(mockScene.logger.warn).toHaveBeenCalled();

    const warnCall = mockScene.logger.warn.mock.calls[0][0];
    expect(warnCall.message).toBe('This function is deprecated');

    endScene(mockScene);
  });

  it('应该支持自定义 remarks', () => {
    const mockScene = {
      logger: {
        warn: vi.fn(),
      },
    } as any;

    startScene(mockScene);

    const originalFn = vi.fn(() => 'test');
    const deprecatedFn = deprecate(
      originalFn,
      'Deprecated',
      'Use newFunction instead',
    );

    deprecatedFn();

    const warnCall = mockScene.logger.warn.mock.calls[0][0];
    expect(warnCall.message).toBe('Deprecated');
    expect(warnCall.remarks).toBe('Use newFunction instead');

    endScene(mockScene);
  });

  it('应该保持函数的 this 上下文', () => {
    const mockScene = {
      logger: {
        warn: vi.fn(),
      },
    } as any;

    startScene(mockScene);

    const obj = {
      value: 42,
      getValue: function () {
        return this.value;
      },
    };

    obj.getValue = deprecate(obj.getValue, 'Deprecated');
    const result = obj.getValue();

    expect(result).toBe(42);

    endScene(mockScene);
  });

  it('应该传递所有参数', () => {
    const mockScene = {
      logger: {
        warn: vi.fn(),
      },
    } as any;

    startScene(mockScene);

    const originalFn = vi.fn((a: number, b: string, c: boolean) => ({a, b, c}));
    const deprecatedFn = deprecate(originalFn, 'Deprecated');

    const result = deprecatedFn(1, 'test', true);

    expect(result).toEqual({a: 1, b: 'test', c: true});
    expect(originalFn).toHaveBeenCalledWith(1, 'test', true);

    endScene(mockScene);
  });

  it('应该在没有 Scene 时使用 console', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const originalFn = vi.fn(() => 'test');
    const deprecatedFn = deprecate(originalFn, 'Deprecated');

    deprecatedFn();

    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });
});
