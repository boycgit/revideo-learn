import {describe, expect, it} from 'vitest';
import {usePlayback, startPlayback, endPlayback} from './usePlayback';
import {PlaybackStatus} from '../app/PlaybackStatus';

describe('usePlayback', () => {
  it('应该在没有上下文时抛出错误', () => {
    expect(() => usePlayback()).toThrow(
      'The playback is not available in the current context.',
    );
  });

  it('应该返回当前播放状态', () => {
    const playback = new PlaybackStatus();
    startPlayback(playback);

    const result = usePlayback();
    expect(result).toBe(playback);

    endPlayback(playback);
  });

  it('应该支持嵌套上下文', () => {
    const playback1 = new PlaybackStatus();
    const playback2 = new PlaybackStatus();

    startPlayback(playback1);
    expect(usePlayback()).toBe(playback1);

    startPlayback(playback2);
    expect(usePlayback()).toBe(playback2);

    endPlayback(playback2);
    expect(usePlayback()).toBe(playback1);

    endPlayback(playback1);
  });

  it('应该在顺序错误时抛出错误', () => {
    const playback1 = new PlaybackStatus();
    const playback2 = new PlaybackStatus();

    startPlayback(playback1);
    startPlayback(playback2);

    let errorThrown = false;
    try {
      endPlayback(playback1);
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).toContain('out of order');
    }

    expect(errorThrown).toBe(true);

    // 正确清理堆栈 - 注意 pop 已经在 endPlayback 中执行了
    // 所以现在堆栈中只有 playback1
    endPlayback(playback1);
  });
});
