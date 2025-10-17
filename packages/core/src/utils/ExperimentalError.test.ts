import {describe, expect, it} from 'vitest';
import {ExperimentalError, experimentalFeatures} from './ExperimentalError';

describe('ExperimentalError', () => {
  it('应该创建带有消息的实验性错误', () => {
    const error = new ExperimentalError('Test feature');
    expect(error.message).toBe('Test feature');
    expect(error.remarks).toContain('experimentalFeatures');
    expect(error.remarks).toContain(experimentalFeatures);
  });

  it('应该支持自定义 remarks', () => {
    const error = new ExperimentalError('Test feature', 'Custom remark');
    expect(error.message).toBe('Test feature');
    expect(error.remarks).toContain('Custom remark');
    expect(error.remarks).toContain(experimentalFeatures);
  });

  it('应该支持对象形式的构造', () => {
    const error = new ExperimentalError({
      message: 'Test feature',
      remarks: 'Custom remark',
      object: {key: 'value'},
    });
    expect(error.message).toBe('Test feature');
    expect(error.remarks).toContain('Custom remark');
    expect(error.remarks).toContain(experimentalFeatures);
  });

  it('应该处理没有 remarks 的对象构造', () => {
    const error = new ExperimentalError({
      message: 'Test feature',
    });
    expect(error.message).toBe('Test feature');
    expect(error.remarks).toContain(experimentalFeatures);
  });

  it('应该是 DetailedError 的实例', () => {
    const error = new ExperimentalError('Test');
    expect(error).toBeInstanceOf(Error);
  });

  it('experimentalFeatures 常量应该包含配置说明', () => {
    expect(experimentalFeatures).toContain('experimentalFeatures');
    expect(experimentalFeatures).toContain('makeProject');
  });
});
