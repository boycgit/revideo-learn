import {describe, expect, it, vi} from 'vitest';
import {lazy} from './lazy';

describe('lazy', () => {
  it('应该延迟初始化属性', () => {
    const factory = vi.fn(() => 'test value');

    class TestClass {
      @lazy(factory)
      public lazyProp!: string;
    }

    const instance = new TestClass();
    expect(factory).not.toHaveBeenCalled();

    const value = instance.lazyProp;
    expect(factory).toHaveBeenCalledTimes(1);
    expect(value).toBe('test value');
  });

  it('应该只初始化一次', () => {
    const factory = vi.fn(() => 'test value');

    class TestClass {
      @lazy(factory)
      public lazyProp!: string;
    }

    const instance = new TestClass();
    const value1 = instance.lazyProp;
    const value2 = instance.lazyProp;
    const value3 = instance.lazyProp;

    expect(factory).toHaveBeenCalledTimes(1);
    expect(value1).toBe('test value');
    expect(value2).toBe('test value');
    expect(value3).toBe('test value');
  });

  it('应该支持不同类型的值', () => {
    class TestClass {
      @lazy(() => 42)
      public numberProp!: number;

      @lazy(() => ({key: 'value'}))
      public objectProp!: {key: string};

      @lazy(() => [1, 2, 3])
      public arrayProp!: number[];
    }

    const instance = new TestClass();
    expect(instance.numberProp).toBe(42);
    expect(instance.objectProp).toEqual({key: 'value'});
    expect(instance.arrayProp).toEqual([1, 2, 3]);
  });

  it('应该在正确的上下文中调用工厂函数', () => {
    class TestClass {
      private value = 'instance value';

      @lazy(function (this: TestClass) {
        return this.value;
      })
      public lazyProp!: string;
    }

    const instance = new TestClass();
    expect(instance.lazyProp).toBe('instance value');
  });
});
