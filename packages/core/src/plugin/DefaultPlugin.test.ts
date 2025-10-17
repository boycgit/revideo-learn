import {describe, expect, it} from 'vitest';
import DefaultPlugin from './DefaultPlugin';

describe('DefaultPlugin', () => {
  it('应该导出默认插件', () => {
    expect(DefaultPlugin).toBeDefined();
    expect(typeof DefaultPlugin).toBe('function');
  });

  it('应该返回插件配置', () => {
    const plugin = DefaultPlugin();
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('@revideo/core/default');
  });

  it('应该提供导出器', () => {
    const plugin = DefaultPlugin();
    expect(plugin.exporters).toBeDefined();

    const exporters = plugin.exporters!();
    expect(Array.isArray(exporters)).toBe(true);
    expect(exporters.length).toBeGreaterThan(0);
  });
});
