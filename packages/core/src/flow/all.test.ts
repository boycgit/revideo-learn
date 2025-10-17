import {beforeEach, describe, expect, test, vi} from 'vitest';

vi.mock('./join', async actual => {
  const mod = await actual();
  return {
    ...mod,
    join: vi.fn(function* (...tasks: Generator[]) {
      yield ['joined', tasks];
    }),
  };
});

import {all} from './all';
import {join} from './join';

const mockedJoin = join as unknown as ReturnType<typeof vi.fn> & {
  mock: ReturnType<typeof vi.fn>['mock'];
};

const makeTask = (label: string) =>
  (function* () {
    yield label;
  })();

describe('all', () => {
  beforeEach(() => {
    mockedJoin.mockClear();
  });

  test('yields tasks and waits for join completion', () => {
    const taskA = makeTask('A');
    const taskB = makeTask('B');

    const iterator = all(taskA, taskB);

    expect(iterator.next().value).toBe(taskA);
    expect(iterator.next().value).toBe(taskB);

    const joinStep = iterator.next();
    const [label, tasks] = joinStep.value as [string, Generator[]];
    expect(label).toBe('joined');
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toBe(taskA);
    expect(tasks[1]).toBe(taskB);
    expect(iterator.next().done).toBe(true);

    const [argA, argB] = mockedJoin.mock.calls[0];
    expect(argA).toBe(taskA);
    expect(argB).toBe(taskB);
  });

  test('handles empty input without calling join', () => {
    const iterator = all();
    const first = iterator.next();
    const [label, tasks] = first.value as [string, Generator[]];
    expect(label).toBe('joined');
    expect(tasks).toHaveLength(0);
    expect(iterator.next().done).toBe(true);
    expect(mockedJoin.mock.calls[0]).toHaveLength(0);
  });
});
