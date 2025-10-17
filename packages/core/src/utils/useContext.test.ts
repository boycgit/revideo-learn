import {describe, expect, it, vi} from 'vitest';
import {useContext, useContextAfter} from './useContext';
import {startScene, endScene} from './useScene';

describe('useContext', () => {
  it('应该订阅 onBeginRender 事件', () => {
    const mockSubscribe = vi.fn(() => vi.fn());
    const mockScene = {
      lifecycleEvents: {
        onBeginRender: {
          subscribe: mockSubscribe,
        },
      },
    } as any;

    startScene(mockScene);

    const callback = vi.fn();
    const unsubscribe = useContext(callback);

    expect(mockSubscribe).toHaveBeenCalledWith(callback);
    expect(typeof unsubscribe).toBe('function');

    endScene(mockScene);
  });

  it('应该返回取消订阅函数', () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscribe = vi.fn(() => mockUnsubscribe);
    const mockScene = {
      lifecycleEvents: {
        onBeginRender: {
          subscribe: mockSubscribe,
        },
      },
    } as any;

    startScene(mockScene);

    const callback = vi.fn();
    const unsubscribe = useContext(callback);

    expect(unsubscribe).toBe(mockUnsubscribe);

    endScene(mockScene);
  });

  it('应该在没有场景时抛出错误', () => {
    const callback = vi.fn();
    expect(() => useContext(callback)).toThrow(
      'The scene is not available in the current context.',
    );
  });
});

describe('useContextAfter', () => {
  it('应该订阅 onFinishRender 事件', () => {
    const mockSubscribe = vi.fn(() => vi.fn());
    const mockScene = {
      lifecycleEvents: {
        onFinishRender: {
          subscribe: mockSubscribe,
        },
      },
    } as any;

    startScene(mockScene);

    const callback = vi.fn();
    const unsubscribe = useContextAfter(callback);

    expect(mockSubscribe).toHaveBeenCalledWith(callback);
    expect(typeof unsubscribe).toBe('function');

    endScene(mockScene);
  });

  it('应该返回取消订阅函数', () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscribe = vi.fn(() => mockUnsubscribe);
    const mockScene = {
      lifecycleEvents: {
        onFinishRender: {
          subscribe: mockSubscribe,
        },
      },
    } as any;

    startScene(mockScene);

    const callback = vi.fn();
    const unsubscribe = useContextAfter(callback);

    expect(unsubscribe).toBe(mockUnsubscribe);

    endScene(mockScene);
  });

  it('应该在没有场景时抛出错误', () => {
    const callback = vi.fn();
    expect(() => useContextAfter(callback)).toThrow(
      'The scene is not available in the current context.',
    );
  });
});
