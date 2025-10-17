import {describe, expect, it} from 'vitest';
import {makePlugin} from './makePlugin';
import type {Plugin} from './Plugin';

describe('makePlugin', () => {
  it('应该包装插件对象', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
    };

    const factory = makePlugin(plugin);
    expect(typeof factory).toBe('function');
    expect(factory()).toBe(plugin);
  });

  it('应该包装插件工厂函数', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
    };
    const factory = () => plugin;

    const wrapped = makePlugin(factory);
    expect(wrapped).toBe(factory);
    expect(wrapped()).toBe(plugin);
  });

  it('应该支持带有配置的插件', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
      exporters: () => [],
    };

    const factory = makePlugin(plugin);
    const result = factory();

    expect(result.name).toBe('test-plugin');
    expect(result.exporters).toBeDefined();
  });
});
