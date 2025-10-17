import {beforeEach, describe, expect, test, vi, type Mock} from 'vitest';
import {Logger, LogLevel} from './Logger';

describe('Logger', () => {
  let logger: Logger;
  const payload = {message: 'hello'};

  beforeEach(() => {
    vi.restoreAllMocks();
    logger = new Logger();
    vi.spyOn(console, 'error').mockImplementation(() => undefined as any);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined as any);
    vi.spyOn(console, 'info').mockImplementation(() => undefined as any);
    vi.spyOn(console, 'log').mockImplementation(() => undefined as any);
  });

  test('log pushes payload to history and fires event', () => {
    const listener = vi.fn();
    const dispose = logger.onLogged.subscribe(listener);
    logger.log(payload);

    expect(logger.history).toHaveLength(1);
    expect(logger.history[0]).toEqual(payload);
    expect(listener).toHaveBeenCalledWith(payload);
    dispose();
  });

  const levelCases: Array<[
    string,
    LogLevel,
    (logger: Logger, payload: string | typeof payload) => void,
    keyof Console,
    boolean
  ]> = [
    ['error', LogLevel.Error, (l, p) => l.error(p), 'error', true],
    ['warn', LogLevel.Warn, (l, p) => l.warn(p), 'warn', true],
    ['info', LogLevel.Info, (l, p) => l.info(p), 'info', true],
    ['http', LogLevel.Http, (l, p) => l.http(p), 'log', true],
    ['verbose', LogLevel.Verbose, (l, p) => l.verbose(p), 'log', true],
    ['debug', LogLevel.Debug, (l, p) => l.debug(p), 'log', false],
    ['silly', LogLevel.Silly, (l, p) => l.silly(p), 'log', true],
  ];

  test.each(levelCases)('%s levels payload and logs', (_, level, call, method, shouldLog) => {
    const original = {...payload};
    const mockFn = console[method] as unknown as Mock;
    const before = mockFn.mock.calls.length;
    call(logger, original);
    const logged = logger.history.at(-1)!;
    expect(logged.level).toBe(level);
    expect(logged.message).toBe('hello');
    if (shouldLog) {
      expect(mockFn.mock.calls.length).toBeGreaterThan(before);
    } else {
      expect(mockFn.mock.calls.length).toBe(before);
    }
  });

  test('logLevel converts string payload and preserves object payload', () => {
    logger.logLevel(LogLevel.Info, 'string message');
    expect(logger.history.at(-1)).toEqual({level: LogLevel.Info, message: 'string message'});

    const objectPayload = {message: 'obj'};
    logger.logLevel(LogLevel.Warn, objectPayload);
    expect(logger.history.at(-1)).toBe(objectPayload);
    expect(objectPayload.level).toBe(LogLevel.Warn);
  });

  test('profile logs duration and toggles state', () => {
    vi.spyOn(performance, 'now').mockReturnValueOnce(10).mockReturnValueOnce(60);
    logger.profile('id');
    const listener = vi.fn();
    logger.onLogged.subscribe(listener);
    logger.profile('id', {message: 'done'});
    expect(listener).toHaveBeenCalled();
    const last = logger.history.at(-1)!;
    expect(last.durationMs).toBe(50);
    expect(last.level).toBe(LogLevel.Debug);
  });

  test('error triggers browserError when available', () => {
    const browserError = vi.fn();
    (window as any).browserError = browserError;
    logger.error('boom');
    expect(browserError).toHaveBeenCalledWith('boom');
    delete (window as any).browserError;
  });
});
