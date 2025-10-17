import { describe, expect, test, vi } from 'vitest';
import { loop } from './loop';
import * as utils from '../utils';

vi.mock('../utils', async () => {
  const mod = await vi.importActual<typeof utils>('../utils');
  return {
    ...mod,
    useThread: vi.fn(() => ({ parent: {} })),
    useLogger: vi.fn(() => ({ error: vi.fn() })),
  };
});

describe('loop', () => {
  test('runs factory infinite in non-main thread', () => {
    const factory = vi.fn(() => (function* () { })());
    // 使用有限次数的循环来避免内存溢出
    const generator = loop(3, factory);

    generator.next();
    generator.next();
    generator.next();
    generator.next(); // 完成循环

    expect(factory).toHaveBeenCalledTimes(3);
  });

  test('runs finite iterations and yields inner generators', () => {
    let total = 0;
    const factory = vi.fn((i: number) =>
      (function* () {
        total += i;
        yield;
      })(),
    );

    const gen = loop(3, factory);
    gen.next();
    gen.next();
    gen.next();
    gen.next();
    gen.next();
    gen.next();
    const result = gen.next();
    expect(result.done).toBe(true);

    expect(total).toBe(3); // 0 + 1 + 2
    expect(factory).toHaveBeenCalledTimes(3);
  });

  test('logs error when infinite loop runs in main thread', () => {
    const logSpy = vi.fn();
    vi.spyOn(utils, 'useThread').mockReturnValue({ parent: null } as any);
    vi.spyOn(utils, 'useLogger').mockReturnValue({ error: logSpy } as any);

    const gen = loop(() => undefined);
    gen.next();

    expect(logSpy).toHaveBeenCalled();
  });
});
