import {describe, expect, test, vi, beforeEach} from 'vitest';
import {loopFor} from './loopFor';
import * as utils from '../utils';

const mockThread: any = {
  time: vi.fn(() => currentTime),
  fixed: 0,
};

let currentTime = 0;

vi.mock('../utils', async actual => {
  const mod = await actual();
  return {
    ...mod,
    useThread: vi.fn(() => mockThread),
    usePlayback: vi.fn(() => ({framesToSeconds: (frames: number) => frames * 0.1})),
  };
});

describe('loopFor', () => {
  beforeEach(() => {
    currentTime = 0;
    mockThread.fixed = 0;
    mockThread.time.mockImplementation((value?: number) => {
      if (typeof value === 'number') {
        currentTime = value;
      }
      return currentTime;
    });
  });

  test('runs factory multiple iterations until time reached', () => {
    const steps: number[] = [];
    const iterator = loopFor(0.25, i =>
      (function* () {
        steps.push(i);
        mockThread.fixed += 0.05;
        yield;
      })(),
    );

    Array.from(iterator);

    expect(steps).toEqual([0, 1, 2]);
    expect(mockThread.time).toHaveBeenLastCalledWith(0.25);
  });

  test('yields when factory returns void', () => {
    const gen = loopFor(0.2, () => undefined);
    const step = gen.next();
    expect(step.done).toBe(false);
  });
});
