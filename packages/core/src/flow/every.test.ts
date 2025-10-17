import {beforeEach, describe, expect, test, vi} from 'vitest';
import {every} from './every';
import * as utils from '../utils';

const mockPlayback = {
  secondsToFrames: vi.fn((seconds: number) => seconds * 5),
};

vi.mock('../utils', async actual => {
  const mod = await actual();
  return {
    ...mod,
    usePlayback: vi.fn(() => mockPlayback),
  };
});

const advance = (runner: Generator, steps: number) => {
  for (let i = 0; i < steps; i++) {
    runner.next();
  }
};

describe('every', () => {
  beforeEach(() => {
    mockPlayback.secondsToFrames.mockClear();
    mockPlayback.secondsToFrames.mockImplementation(seconds => seconds * 5);
  });

  test('invokes callback on creation and updates tick', () => {
    const callback = vi.fn();
    const timer = every(1, callback);
    const runner = timer.runner;

    expect(callback).not.toHaveBeenCalled();

    runner.next();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(0);

    advance(runner, 5);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(1);
  });

  test('sync waits until tick occurs', () => {
    const callback = vi.fn();
    const timer = every(2, callback);
    const runner = timer.runner;
    const sync = timer.sync();

    runner.next();
    let syncResult = sync.next();
    expect(syncResult.done).toBe(false);

    advance(runner, 10);
    syncResult = sync.next();
    expect(syncResult.done).toBe(true);
  });

  test('setInterval resets change detection', () => {
    const callback = vi.fn();
    const timer = every(1, callback);
    const runner = timer.runner;

    runner.next();
    advance(runner, 5);
    timer.setInterval(2);
    advance(runner, 10);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('setCallback replaces callback and resets sync state', () => {
    const first = vi.fn();
    const timer = every(1, first);
    const runner = timer.runner;

    runner.next();
    expect(first).toHaveBeenCalledTimes(1);

    const replacement = vi.fn();
    timer.setCallback(replacement);

    runner.next();
    advance(runner, 5);

    expect(first).toHaveBeenCalledTimes(1);
    expect(replacement).toHaveBeenCalledTimes(1);
    expect(replacement).toHaveBeenLastCalledWith(1);
  });
});
