import {describe, expect, it} from 'vitest';
import {errorToLog} from './errorToLog';

describe('errorToLog', () => {
  it('应该将错误转换为日志格式', () => {
    const error = new Error('Test error');
    const log = errorToLog(error);

    expect(log.message).toBe('Test error');
    expect(log.stack).toBeDefined();
  });

  it('应该处理带有 remarks 的错误', () => {
    const error = {
      message: 'Custom error',
      stack: 'stack trace',
      remarks: 'additional info',
    };
    const log = errorToLog(error);

    expect(log.message).toBe('Custom error');
    expect(log.stack).toBe('stack trace');
    expect(log.remarks).toBe('additional info');
  });

  it('应该处理没有 remarks 的错误', () => {
    const error = {
      message: 'Simple error',
      stack: 'stack',
    };
    const log = errorToLog(error);

    expect(log.message).toBe('Simple error');
    expect(log.stack).toBe('stack');
    expect(log.remarks).toBeUndefined();
  });
});
