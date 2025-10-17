import {describe, expect, it, vi} from 'vitest';
import {
  useScene,
  startScene,
  endScene,
  useLogger,
  finishScene,
} from './useScene';

describe('useScene', () => {
  it('应该在没有上下文时抛出错误', () => {
    expect(() => useScene()).toThrow(
      'The scene is not available in the current context.',
    );
  });

  it('应该返回当前场景', () => {
    const mockScene = {
      name: 'test-scene',
      enterCanTransitionOut: vi.fn(),
    } as any;

    startScene(mockScene);
    const result = useScene();
    expect(result).toBe(mockScene);
    endScene(mockScene);
  });

  it('应该支持嵌套场景', () => {
    const scene1 = {name: 'scene1'} as any;
    const scene2 = {name: 'scene2'} as any;

    startScene(scene1);
    expect(useScene()).toBe(scene1);

    startScene(scene2);
    expect(useScene()).toBe(scene2);

    endScene(scene2);
    expect(useScene()).toBe(scene1);

    endScene(scene1);
  });

  it('应该在顺序错误时抛出错误', () => {
    const scene1 = {name: 'scene1'} as any;
    const scene2 = {name: 'scene2'} as any;

    startScene(scene1);
    startScene(scene2);

    let errorThrown = false;
    try {
      endScene(scene1);
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).toContain('out of order');
    }

    expect(errorThrown).toBe(true);

    // 正确清理堆栈 - pop 已经在 endScene 中执行了
    endScene(scene1);
  });
});

describe('useLogger', () => {
  it('应该返回场景的 logger', () => {
    const mockLogger = {warn: vi.fn(), error: vi.fn()};
    const mockScene = {
      logger: mockLogger,
    } as any;

    startScene(mockScene);
    const logger = useLogger();
    expect(logger).toBe(mockLogger);
    endScene(mockScene);
  });

  it('应该在没有场景时返回 console', () => {
    const logger = useLogger();
    expect(logger).toBe(console);
  });
});

describe('finishScene', () => {
  it('应该标记场景为可以过渡', () => {
    const mockScene = {
      enterCanTransitionOut: vi.fn(),
    } as any;

    startScene(mockScene);
    finishScene();
    expect(mockScene.enterCanTransitionOut).toHaveBeenCalled();
    endScene(mockScene);
  });

  it('应该在没有场景时抛出错误', () => {
    expect(() => finishScene()).toThrow(
      'The scene is not available in the current context.',
    );
  });
});
