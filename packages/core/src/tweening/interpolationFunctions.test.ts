import {describe, expect, test, vi} from 'vitest';
import {Vector2} from '../types';
import {deepLerp, textLerp, boolLerp, arcLerp} from './interpolationFunctions';

describe('deepLerp', () => {
  test('falls back to primitive tween for numbers', () => {
    expect(deepLerp(5, 10, 3 / 5)).toEqual(8);
  });

  test('falls back to primitive tween for strings', () => {
    expect(deepLerp('foo', 'foobar', 2 / 3)).toEqual('fooba');
  });

  test('interpolates between values in an array', () => {
    expect(deepLerp([0, 2], [1, 3], 1 / 2)).toEqual([0.5, 2.5]);
  });

  test('jumps to new array if values vary in length', () => {
    expect(deepLerp([0, 2], [1, 3, 5], 0)).toEqual([0, 2]);
    expect(deepLerp([0, 2], [1, 3, 5], 1 / 2)).toEqual([1, 3, 5]);
    expect(deepLerp([0, 2], [1, 3, 5], 1)).toEqual([1, 3, 5]);
  });

  test('interpolates between values in a map', () => {
    expect(
      deepLerp(new Map([['foo', 0]]), new Map([['foo', 5]]), 3 / 5),
    ).toEqual(new Map([['foo', 3]]));
  });

  test('deletes values in a map after a value of 0', () => {
    expect(deepLerp(new Map([['foo', 5]]), new Map(), 3 / 5)).toEqual(
      new Map(),
    );
    expect(deepLerp(new Map([['foo', 5]]), new Map(), 1)).toEqual(new Map());
  });

  test('retains missing values in a map at a value of 0', () => {
    expect(deepLerp(new Map([['foo', 5]]), new Map(), 0)).toEqual(
      new Map([['foo', 5]]),
    );
  });

  test('waits to add new values to a map until a value of 1', () => {
    expect(deepLerp(new Map(), new Map([['foo', 5]]), 3 / 5)).toEqual(
      new Map(),
    );
    expect(deepLerp(new Map(), new Map([['foo', 5]]), 0)).toEqual(new Map());
  });

  test('adds new values to a map at a value of 1', () => {
    expect(deepLerp(new Map(), new Map([['foo', 5]]), 1)).toEqual(
      new Map([['foo', 5]]),
    );
  });

  test('interpolates between values in an object', () => {
    expect(deepLerp({foo: 0}, {foo: 5}, 3 / 5)).toEqual({foo: 3});
  });

  test('deletes values in a map after a value of 0', () => {
    expect(deepLerp({foo: 5}, {}, 3 / 5)).toEqual({});
    expect(deepLerp({foo: 5}, {}, 1)).toEqual({});
  });

  test('retains missing values in a map at a value of 0', () => {
    expect(deepLerp({foo: 5}, {}, 0)).toEqual({foo: 5});
  });

  test('retains properties with falsy values', () => {
    expect(deepLerp({x: 0, y: 10}, {x: 0, y: 20}, 0.5)).toEqual({x: 0, y: 15});
  });

  test('waits to add new values to a map until a value of 1', () => {
    expect(deepLerp({}, {foo: 5}, 3 / 5)).toEqual({});
    expect(deepLerp({}, {foo: 5}, 0)).toEqual({});
  });

  test('adds new values to a map at a value of 1', () => {
    expect(deepLerp({}, {foo: 5}, 1)).toEqual({foo: 5});
  });

  test('invokes native interpolation function', () => {
    const spy = vi.spyOn(Vector2, 'lerp');
    const args: [Vector2, Vector2, number] = [
      new Vector2(50, 65),
      new Vector2(10, 100),
      1 / 2,
    ];
    expect(deepLerp(...args)).toEqual(Vector2.lerp(...args));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('returns the from boolean until a value of 0.5', () => {
    expect(deepLerp(true, false, 0)).toBe(true);
    expect(deepLerp(true, false, 0.25)).toBe(true);
    expect(deepLerp(true, false, 0.499999)).toBe(true);
  });

  test('returns the to boolean after a value of 0.5 or greater', () => {
    expect(deepLerp(true, false, 0.5)).toBe(false);
    expect(deepLerp(true, false, 0.75)).toBe(false);
    expect(deepLerp(true, false, 0.99999)).toBe(false);
    expect(deepLerp(true, false, 1)).toBe(false);
  });
});



  test('deepLerp 应该处理嵌套对象', () => {
    const from = {a: {b: 1}};
    const to = {a: {b: 2}};
    const result = deepLerp(from, to, 0.5);
    expect(result.a.b).toBe(1.5);
  });

  test('deepLerp 应该处理数组', () => {
    const from = [1, 2, 3];
    const to = [4, 5, 6];
    const result = deepLerp(from, to, 0.5);
    expect(result[0]).toBe(2.5);
    expect(result[1]).toBe(3.5);
    expect(result[2]).toBe(4.5);
  });

  test('deepLerp 应该处理不同长度的数组', () => {
    const from = [1, 2];
    const to = [3, 4, 5];
    const result = deepLerp(from, to, 0.5);
    expect(result.length).toBeGreaterThan(0);
  });

  test('deepLerp 应该处理 Map', () => {
    const from = new Map([['a', 1]]);
    const to = new Map([['a', 2]]);
    const result = deepLerp(from, to, 0.5);
    expect(result.get('a')).toBe(1.5);
  });

  test('deepLerp 应该处理不匹配的键', () => {
    const from = {a: 1, b: 2};
    const to = {a: 2, c: 3};
    const result = deepLerp(from, to, 0.5);
    expect(result.a).toBe(1.5);
  });

  test('deepLerp 应该在 value=0 时返回 from', () => {
    const from = {a: 1};
    const to = {a: 2};
    const result = deepLerp(from, to, 0);
    expect(result.a).toBe(1);
  });

  test('deepLerp 应该在 value=1 时返回 to', () => {
    const from = {a: 1};
    const to = {a: 2};
    const result = deepLerp(from, to, 1);
    expect(result.a).toBe(2);
  });

  test('textLerp 应该处理空字符串', () => {
    expect(textLerp('', 'hello', 0.5)).toBe('hel');
    const result = textLerp('hello', '', 0.5);
    expect(result.length).toBeLessThanOrEqual('hello'.length);
  });

  test('textLerp 应该处理相同长度的字符串', () => {
    expect(textLerp('abc', 'xyz', 0)).toBe('abc');
    expect(textLerp('abc', 'xyz', 1)).toBe('xyz');
    expect(textLerp('abc', 'xyz', 0.5)).toContain('x');
  });

  test('deepLerp 应该处理 null 和 undefined', () => {
    expect(deepLerp(null, 10, 0.5)).toBeUndefined();
    expect(deepLerp(10, null, 0.5)).toBeUndefined();
    expect(deepLerp(undefined, 10, 0.5)).toBeUndefined();
  });

  test('deepLerp 应该处理布尔值', () => {
    expect(deepLerp(true, false, 0.3)).toBe(true);
    expect(deepLerp(true, false, 0.7)).toBe(false);
  });

  test('deepLerp 应该处理字符串', () => {
    const result = deepLerp('hello', 'world', 0.5);
    expect(typeof result).toBe('string');
  });

  test('deepLerp 应该处理不同长度的数组', () => {
    const result = deepLerp([1, 2], [3, 4, 5], 0.5);
    expect(result).toEqual([3, 4, 5]);
  });

  test('deepLerp 应该处理 Map', () => {
    const from = new Map([['a', 1], ['b', 2]]);
    const to = new Map([['a', 10], ['c', 30]]);
    const result = deepLerp(from, to, 0.5);
    
    expect(result).toBeInstanceOf(Map);
    expect(result.get('a')).toBe(5.5);
  });

  test('deepLerp 应该处理嵌套对象', () => {
    const from = {x: {y: 10}};
    const to = {x: {y: 20}};
    const result = deepLerp(from, to, 0.5);
    
    expect(result.x.y).toBe(15);
  });

  test('deepLerp 应该在 value=0 时返回 from', () => {
    const from = {x: 10};
    const to = {x: 20};
    expect(deepLerp(from, to, 0)).toBe(from);
  });

  test('deepLerp 应该在 value=1 时返回 to', () => {
    const from = {x: 10};
    const to = {x: 20};
    expect(deepLerp(from, to, 1)).toBe(to);
  });

  test('deepLerp 应该处理带 lerp 方法的对象', () => {
    const from = {
      value: 10,
      lerp(to: any, value: number) {
        return {value: this.value + (to.value - this.value) * value};
      }
    };
    const to = {value: 20};
    const result = deepLerp(from, to, 0.5);
    
    expect(result.value).toBe(15);
  });

  test('boolLerp 应该在 0.5 之前返回 from', () => {
    expect(boolLerp(true, false, 0.4)).toBe(true);
    expect(boolLerp(10, 20, 0.3)).toBe(10);
  });

  test('boolLerp 应该在 0.5 及之后返回 to', () => {
    expect(boolLerp(true, false, 0.5)).toBe(false);
    expect(boolLerp(10, 20, 0.7)).toBe(20);
  });

  test('arcLerp 应该处理 ratio > 1', () => {
    const result = arcLerp(0.5, false, 2);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });

  test('arcLerp 应该处理 reverse=true', () => {
    const result = arcLerp(0.5, true, 1);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });

  test('arcLerp 应该处理边界值', () => {
    const result1 = arcLerp(0, false, 1);
    expect(result1.x).toBe(0);
    
    const result2 = arcLerp(1, false, 1);
    expect(result2.y).toBeCloseTo(1);
  });

  test('deepLerp 应该处理 suppressWarnings 参数', () => {
    // 不应该抛出警告
    expect(() => deepLerp(null, 10, 0.5, true)).not.toThrow();
  });

  test('textLerp 应该处理从长到短的转换', () => {
    const result = textLerp('hello world', 'hi', 0.5);
    expect(result.length).toBeLessThanOrEqual('hello world'.length);
  });

  test('textLerp 应该处理从短到长的转换', () => {
    const result = textLerp('hi', 'hello world', 0.5);
    expect(result.length).toBeGreaterThan(0);
  });
