import {describe, expect, it} from 'vitest';
import {createRefArray} from './createRefArray';

describe('createRefArray', () => {
  it('应该创建一个引用数组', () => {
    const refs = createRefArray<string>();
    expect(refs).toBeDefined();
    expect(typeof refs).toBe('function');
  });

  it('应该作为引用接收器工作', () => {
    const refs = createRefArray<string>();
    refs('first');
    refs('second');
    refs('third');

    expect(refs.length).toBe(3);
    expect(refs[0]).toBe('first');
    expect(refs[1]).toBe('second');
    expect(refs[2]).toBe('third');
  });

  it('应该支持批量添加', () => {
    const refs = createRefArray<number>();
    refs(1, 2, 3);

    expect(refs.length).toBe(3);
    expect(refs[0]).toBe(1);
    expect(refs[1]).toBe(2);
    expect(refs[2]).toBe(3);
  });

  it('应该支持数组方法', () => {
    const refs = createRefArray<string>();
    refs('a', 'b', 'c');

    const mapped = refs.map(x => x.toUpperCase());
    expect(mapped).toEqual(['A', 'B', 'C']);

    const filtered = refs.filter(x => x !== 'b');
    expect(filtered).toEqual(['a', 'c']);
  });

  it('应该支持 push 方法', () => {
    const refs = createRefArray<string>();
    refs.push('first');
    refs.push('second');

    expect(refs.length).toBe(2);
    expect(refs[0]).toBe('first');
    expect(refs[1]).toBe('second');
  });

  it('应该支持索引访问', () => {
    const refs = createRefArray<string>();
    refs('initial');

    expect(refs[0]).toBe('initial');
  });

  it('无参数调用应该返回第一个元素', () => {
    const refs = createRefArray<string>();
    refs('first', 'second');

    expect(refs()).toBe('first');
  });

  it('应该支持 forEach', () => {
    const refs = createRefArray<number>();
    refs(1, 2, 3);

    const results: number[] = [];
    refs.forEach(x => results.push(x * 2));

    expect(results).toEqual([2, 4, 6]);
  });
});
