import {describe, expect, it, vi} from 'vitest';
import {createComputed} from './createComputed';
import {createSignal} from './createSignal';

describe('ComputedContext', () => {
  it('应该创建计算值', () => {
    const computed = createComputed(() => 42);
    expect(computed()).toBe(42);
  });

  it('应该支持带参数的工厂函数', () => {
    const computed = createComputed((x: number, y: number) => x + y);
    expect(computed(10, 20)).toBe(30);
  });

  it('应该缓存计算结果', () => {
    const factory = vi.fn(() => 42);
    const computed = createComputed(factory);
    
    computed();
    computed();
    
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('应该在依赖变化时重新计算', () => {
    const signal = createSignal(10);
    const computed = createComputed(() => signal() * 2);
    
    expect(computed()).toBe(20);
    
    signal(20);
    expect(computed()).toBe(40);
  });

  it('应该支持多个依赖', () => {
    const a = createSignal(10);
    const b = createSignal(20);
    const computed = createComputed(() => a() + b());
    
    expect(computed()).toBe(30);
    
    a(15);
    expect(computed()).toBe(35);
    
    b(25);
    expect(computed()).toBe(40);
  });

  it('应该正确处理错误', () => {
    const computed = createComputed(() => {
      throw new Error('Test error');
    });
    
    // 应该捕获错误并记录
    expect(() => computed()).not.toThrow();
  });

  it('应该支持 dispose', () => {
    const computed = createComputed(() => 42);
    computed.context.dispose();
    
    // 验证资源已清理
    expect(() => computed()).not.toThrow();
  });

  it('应该支持嵌套计算值', () => {
    const signal = createSignal(10);
    const computed1 = createComputed(() => signal() * 2);
    const computed2 = createComputed(() => computed1() + 5);
    
    expect(computed2()).toBe(25);
    
    signal(20);
    expect(computed2()).toBe(45);
  });

  it('应该支持条件计算', () => {
    const condition = createSignal(true);
    const a = createSignal(10);
    const b = createSignal(20);
    const computed = createComputed(() => condition() ? a() : b());
    
    expect(computed()).toBe(10);
    
    condition(false);
    expect(computed()).toBe(20);
  });
});
