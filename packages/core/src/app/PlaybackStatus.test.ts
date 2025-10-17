import {describe, expect, test} from 'vitest';
import {PlaybackManager, PlaybackState} from './PlaybackManager';
import {PlaybackStatus} from './PlaybackStatus';

describe('PlaybackStatus', () => {
  test('converts between seconds and frames using fps', () => {
    const manager = new PlaybackManager();
    manager.fps = 60;
    manager.frame = 120;
    manager.speed = 2;
    manager.state = PlaybackState.Playing;
    manager.duration = 300;
    (manager as any).previousScene = null;
    const status = new PlaybackStatus(manager);

    expect(status.framesToSeconds(120)).toBe(2);
    expect(status.secondsToFrames(2)).toBe(120);
    expect(status.secondsToFrames(2.4)).toBe(144);
    expect(status.time).toBe(2);
    expect(status.frame).toBe(120);
    expect(status.speed).toBe(2);
    expect(status.fps).toBe(60);
    expect(status.state).toBe(PlaybackState.Playing);
    expect(status.deltaTime).toBeCloseTo(2 / 60);
  });

  test('clamps frame conversion when exceeding duration', () => {
    const manager = new PlaybackManager();
    manager.fps = 30;
    manager.duration = 90;
    const status = new PlaybackStatus(manager);
    expect(status.secondsToFrames(10)).toBe(300);
    expect(status.framesToSeconds(120)).toBeCloseTo(4);
  });
});
