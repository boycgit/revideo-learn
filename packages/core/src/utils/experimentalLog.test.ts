import {describe, expect, it} from 'vitest';
import {experimentalLog} from './experimentalLog';
import {LogLevel} from '../app/Logger';

describe('experimentalLog', () => {
  it('应该创建实验性功能日志', () => {
    const log = experimentalLog('Test feature');

    expect(log.level).toBe(LogLevel.Error);
    expect(log.message).toBe('Test feature');
    expect(log.remarks).toContain('experimental');
  });

  it('应该支持自定义 remarks', () => {
    const log = experimentalLog('Test feature', 'Custom remark');

    expect(log.message).toBe('Test feature');
    expect(log.remarks).toContain('Custom remark');
    expect(log.remarks).toContain('experimental');
  });

  it('应该在没有 remarks 时仍然包含实验性标记', () => {
    const log = experimentalLog('Test feature');

    expect(log.remarks).toBeDefined();
    expect(log.remarks).toContain('experimental');
  });
});
