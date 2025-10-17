import {beforeEach, describe, expect, test, vi} from 'vitest';

vi.mock('./join', async actual => {
  const mod = await actual();
  return {
    ...mod,
    join: vi.fn(function* (...args: any[]) {
      yield ['joinedAny', args];
    }),
  };
});

import {any} from './any';
import {join} from './join';

const mockedJoin = join as unknown as ReturnType<typeof vi.fn> & {
  mock: ReturnType<typeof vi.fn>['mock'];
};

const makeTask = (label: string) =>
  (function* () {
    yield label;
  })();

describe('any', () => {
  beforeEach(() => {
    mockedJoin.mockClear();
  });

  test('yields tasks and delegates to join with all = false', () => {
    const taskA = makeTask('A');
    const taskB = makeTask('B');

    const iterator = any(taskA, taskB);

    expect(iterator.next().value).toBe(taskA);
    expect(iterator.next().value).toBe(taskB);

    const joinStep = iterator.next();
    const [label, args] = joinStep.value as [string, unknown[]];
    expect(label).toBe('joinedAny');
    expect(args.length).toBe(3);
    expect(args[0]).toBe(false);
    expect(args[1]).toBe(taskA);
    expect(args[2]).toBe(taskB);
    expect(iterator.next().done).toBe(true);

    const [flag, argA, argB] = mockedJoin.mock.calls[0];
    expect(flag).toBe(false);
    expect(argA).toBe(taskA);
    expect(argB).toBe(taskB);
  });

  test('handles no tasks', () => {
    const iterator = any();
    const first = iterator.next();
    const [label, args] = first.value as [string, unknown[]];
    expect(label).toBe('joinedAny');
    expect(args).toEqual([false]);
    expect(iterator.next().done).toBe(true);
    const [flag] = mockedJoin.mock.calls[0];
    expect(flag).toBe(false);
  });
});
