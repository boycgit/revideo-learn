import {describe, expect, test, vi} from 'vitest';
import {delay} from './delay';
import * as scheduling from './scheduling';

vi.spyOn(scheduling, 'waitFor').mockImplementation(function* (time: number) {
  yield time;
});

describe('delay', () => {
  test('awaits nested generator', () => {
    const inner = vi.fn(function* () {
      yield 'done';
    });
    const gen = delay(1, inner());

    expect(gen.next().value).toBe(1);
    expect(gen.next().value).toBe('done');
    expect(inner).toHaveBeenCalled();
  });

  test('invokes callback after waiting', () => {
    const fn = vi.fn();
    const gen = delay(2, fn);

    gen.next();
    gen.next();

    expect(fn).toHaveBeenCalled();
  });
});
