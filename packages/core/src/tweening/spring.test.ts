/* eslint-disable @typescript-eslint/no-unused-vars */

import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {PlaybackManager, PlaybackStatus} from '../app';
import {threads} from '../threading';
import {endPlayback, startPlayback, useTime} from '../utils';
import {
  spring,
  makeSpring,
  BeatSpring,
  PlopSpring,
  BounceSpring,
  SwingSpring,
  JumpSpring,
  StrikeSpring,
  SmoothSpring,
} from './spring';

describe('spring()', () => {
  const playback = new PlaybackManager();
  const status = new PlaybackStatus(playback);
  beforeAll(() => startPlayback(status));
  afterAll(() => endPlayback(status));

  test('Framerate-independent spring duration', () => {
    let timeA;
    // should be around 1.13333333 seconds
    const taskA = threads(function* () {
      yield* spring(
        {
          mass: 0.1,
          stiffness: 20,
          damping: 1.5,
        },
        0,
        300,
        _ => {
          // do nothing
        },
      );
      timeA = useTime();
    });

    let timeB;
    const taskB = threads(function* () {
      yield* spring(
        {
          mass: 0.1,
          stiffness: 20,
          damping: 1.5,
        },
        0,
        300,
        _ => {
          // do nothing
        },
      );
      timeB = useTime();
    });

    let timeC;
    const taskC = threads(function* () {
      yield* spring(
        {
          mass: 0.1,
          stiffness: 20,
          damping: 1.5,
        },
        0,
        300,
        _ => {
          // do nothing
        },
      );
      timeC = useTime();
    });

    playback.fps = 60;
    playback.frame = 0;
    for (const _ of taskA) {
      playback.frame++;
    }

    playback.fps = 24;
    playback.frame = 0;
    for (const _ of taskB) {
      playback.frame++;
    }

    playback.fps = 120;
    playback.frame = 0;
    for (const _ of taskC) {
      playback.frame++;
    }

    expect(timeA).toBeCloseTo(1.5, 0);
    expect(timeB).toBeCloseTo(1.5, 0);
    expect(timeC).toBeCloseTo(1.5, 0);
  });

  test('Accumulated time offset', () => {
    let time;
    const task = threads(function* () {
      yield* spring(
        {
          mass: 0.1,
          stiffness: 20,
          damping: 1.5,
        },
        0,
        300,
        _ => {
          // do nothing
        },
      );
      time = useTime();
    });

    playback.fps = 10;
    playback.frame = 0;
    for (const _ of task) {
      playback.frame++;
    }

    expect(playback.frame).toBe(18);
    expect(time).toBeCloseTo(1.5, 0);
  });
});

  test('应该处理负质量错误', function* () {
    const onProgress = vi.fn();
    const badSpring = {mass: -1, stiffness: 10, damping: 0.5};
    
    yield* spring(badSpring, 0, 100, onProgress);
    
    // 应该只调用初始值
    expect(onProgress).toHaveBeenCalledWith(0, 0);
  });

  test('应该处理负刚度错误', function* () {
    const onProgress = vi.fn();
    const badSpring = {mass: 1, stiffness: -10, damping: 0.5};
    
    yield* spring(badSpring, 0, 100, onProgress);
    
    expect(onProgress).toHaveBeenCalledWith(0, 0);
  });

  test('应该处理负阻尼错误', function* () {
    const onProgress = vi.fn();
    const badSpring = {mass: 1, stiffness: 10, damping: -0.5};
    
    yield* spring(badSpring, 0, 100, onProgress);
    
    expect(onProgress).toHaveBeenCalledWith(0, 0);
  });

  test('应该支持自定义 settleTolerance', function* () {
    const onProgress = vi.fn();
    const testSpring = {mass: 0.1, stiffness: 10, damping: 1};
    
    yield* spring(testSpring, 0, 100, 0.1, onProgress);
    
    expect(onProgress).toHaveBeenCalled();
  });

  test('应该支持 onEnd 回调', function* () {
    const onProgress = vi.fn();
    const onEnd = vi.fn();
    const testSpring = {mass: 0.1, stiffness: 10, damping: 1};
    
    yield* spring(testSpring, 0, 100, onProgress, onEnd);
    
    expect(onEnd).toHaveBeenCalledWith(100, expect.any(Number));
  });

  test('应该支持带 settleTolerance 的 onEnd', function* () {
    const onProgress = vi.fn();
    const onEnd = vi.fn();
    const testSpring = {mass: 0.1, stiffness: 10, damping: 1};
    
    yield* spring(testSpring, 0, 100, 0.01, onProgress, onEnd);
    
    expect(onEnd).toHaveBeenCalled();
  });

  test('应该使用默认 spring 参数', function* () {
    const onProgress = vi.fn();
    
    yield* spring(null, 0, 100, onProgress);
    
    expect(onProgress).toHaveBeenCalled();
  });

  test('应该支持初始速度', function* () {
    const onProgress = vi.fn();
    const testSpring = {
      mass: 0.1,
      stiffness: 10,
      damping: 1,
      initialVelocity: 50,
    };
    
    yield* spring(testSpring, 0, 100, onProgress);
    
    expect(onProgress).toHaveBeenCalled();
  });

  test('应该正确处理从大到小的动画', function* () {
    const onProgress = vi.fn();
    const testSpring = {mass: 0.1, stiffness: 10, damping: 1};
    
    yield* spring(testSpring, 100, 0, onProgress);
    
    expect(onProgress).toHaveBeenCalledWith(100, 0);
    expect(onProgress).toHaveBeenCalledWith(0, expect.any(Number));
  });

  test('makeSpring 应该创建 Spring 对象', () => {
    const testSpring = makeSpring(1, 10, 0.5, 5);
    
    expect(testSpring.mass).toBe(1);
    expect(testSpring.stiffness).toBe(10);
    expect(testSpring.damping).toBe(0.5);
    expect(testSpring.initialVelocity).toBe(5);
  });

  test('makeSpring 应该支持不带初始速度', () => {
    const testSpring = makeSpring(1, 10, 0.5);
    
    expect(testSpring.mass).toBe(1);
    expect(testSpring.initialVelocity).toBeUndefined();
  });

  test('预定义的 Spring 常量应该存在', () => {
    expect(BeatSpring).toBeDefined();
    expect(PlopSpring).toBeDefined();
    expect(BounceSpring).toBeDefined();
    expect(SwingSpring).toBeDefined();
    expect(JumpSpring).toBeDefined();
    expect(StrikeSpring).toBeDefined();
    expect(SmoothSpring).toBeDefined();
  });

  test('预定义的 Spring 应该有正确的属性', () => {
    expect(BeatSpring.mass).toBeGreaterThan(0);
    expect(BeatSpring.stiffness).toBeGreaterThan(0);
    expect(BeatSpring.damping).toBeGreaterThan(0);
  });
