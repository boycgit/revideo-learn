import {describe, expect, test, vi} from 'vitest';
import {chain} from './chain';

const makeTask = (label: string) =>
  (function* () {
    yield label;
  })();

describe('chain', () => {
  test('executes generators sequentially', () => {
    const gen = chain(makeTask('A'), makeTask('B'));

    expect(gen.next().value).toBe('A');
    expect(gen.next().value).toBe('B');
    expect(gen.next().done).toBe(true);
  });

  test('invokes callbacks inline', () => {
    const spy = vi.fn();
    const gen = chain(spy, spy, makeTask('C'));

    const firstStep = gen.next();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(firstStep.value).toBe('C');
    expect(gen.next().done).toBe(true);
  });
});
