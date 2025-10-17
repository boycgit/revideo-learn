import {describe, expect, it} from 'vitest';
import {createRefMap} from './createRefMap';

describe('createRefMap', () => {
  it('应该创建一个引用映射', () => {
    const refs = createRefMap<string>();
    expect(refs).toBeDefined();
  });

  it('应该自动创建引用', () => {
    const refs = createRefMap<string>();
    const refA = refs.a;
    const refB = refs.b;

    expect(refA).toBeDefined();
    expect(refB).toBeDefined();
    expect(refA).not.toBe(refB);
  });

  it('应该设置和获取引用值', () => {
    const refs = createRefMap<string>();
    refs.test('value');

    expect(refs.test()).toBe('value');
  });

  it('应该为相同的键返回相同的引用', () => {
    const refs = createRefMap<string>();
    const ref1 = refs.test;
    const ref2 = refs.test;

    expect(ref1).toBe(ref2);
  });

  it('应该支持 in 操作符检查', () => {
    const refs = createRefMap<string>();
    refs.existing('value');

    expect('existing' in refs).toBe(true);
    expect('nonexisting' in refs).toBe(false);
  });

  it('mapRefs 应该映射所有引用', () => {
    const refs = createRefMap<number>();
    refs.a(1);
    refs.b(2);
    refs.c(3);

    const mapped = refs.mapRefs(value => value * 2);
    expect(mapped).toEqual([2, 4, 6]);
  });

  it('mapRefs 应该提供索引', () => {
    const refs = createRefMap<string>();
    refs.a('first');
    refs.b('second');

    const mapped = refs.mapRefs((value, index) => `${index}: ${value}`);
    expect(mapped).toEqual(['0: first', '1: second']);
  });

  it('应该支持 in 操作符检查已创建的引用', () => {
    const refs = createRefMap<string>();
    refs.test('value');

    expect('test' in refs).toBe(true);
  });

  it('应该支持多个不同类型的引用', () => {
    interface TestObject {
      name: string;
      value: number;
    }

    const refs = createRefMap<TestObject>();
    refs.obj1({name: 'first', value: 1});
    refs.obj2({name: 'second', value: 2});

    expect(refs.obj1()).toEqual({name: 'first', value: 1});
    expect(refs.obj2()).toEqual({name: 'second', value: 2});
  });
});
