import {describe, expect, test, vi} from 'vitest';
import {sequence} from './sequence';
import * as scheduling from './scheduling';
import * as joinModule from './join';

vi.spyOn(scheduling, 'waitFor').mockImplementation(function* (delay: number) {
  yield delay;
});

const joinSpy = vi.spyOn(joinModule, 'join').mockImplementation(function* (...tasks) {
  for (const task of tasks) {
    task.next();
  }
  yield ['join', ...tasks.map((_, index) => String.fromCharCode(65 + index))];
});

const makeTask = (label: string) => {
  const generator = function* () {
    yield label;
  };
  const factory = vi.fn(() => generator());
  return factory;
};

describe('sequence', () => {
  test('starts tasks sequentially and waits for delay', () => {
    const taskA = makeTask('A');
    const taskB = makeTask('B');
    const taskC = makeTask('C');

    const iterator = sequence(0.5, taskA(), taskB(), taskC());

    const firstIter = iterator.next().value!;
    expect(firstIter.next().value).toBe('A');
    expect(iterator.next().value).toBe(0.5);

    const secondIter = iterator.next().value!;
    expect(secondIter.next().value).toBe('B');
    expect(iterator.next().value).toBe(0.5);

    const thirdIter = iterator.next().value!;
    expect(thirdIter.next().value).toBe('C');
    expect(iterator.next().value).toBe(0.5);

    const final = iterator.next().value as unknown[];
    expect(final).toEqual(['join', 'A', 'B', 'C']);

    expect(taskA).toHaveBeenCalledTimes(1);
    expect(taskB).toHaveBeenCalledTimes(1);
    expect(taskC).toHaveBeenCalledTimes(1);
  });
});
