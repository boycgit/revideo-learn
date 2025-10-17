import {describe, expect, test} from 'vitest';
import {createSignal} from '../signals';
import {Spacing} from '../types';

describe('Spacing', () => {
  test('Correctly parses values', () => {
    const fromUndefined = new Spacing();
    const fromArray = new Spacing([1, 2, 3, 4]);
    const fromOne = new Spacing(1);
    const fromTwo = new Spacing(1, 2);
    const fromThree = new Spacing(1, 2, 3);
    const fromObject = new Spacing({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });

    expect(fromUndefined).toMatchObject({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(fromArray).toMatchObject({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
    expect(fromOne).toMatchObject({
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    });
    expect(fromTwo).toMatchObject({
      top: 1,
      right: 2,
      bottom: 1,
      left: 2,
    });
    expect(fromThree).toMatchObject({
      top: 1,
      right: 2,
      bottom: 3,
      left: 2,
    });
    expect(fromObject).toMatchObject({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
  });

  test('Interpolates between spacings', () => {
    const a = new Spacing(1, 2, 3, 4);
    const b = new Spacing(3, 4, 5, 6);

    const result = Spacing.lerp(a, b, 0.5);

    expect(result).toMatchObject({
      top: 2,
      right: 3,
      bottom: 4,
      left: 5,
    });
  });

  test('Creates a compound signal', () => {
    const horizontal = createSignal(2);
    const spacing = Spacing.createSignal(() => [1, horizontal(), 3]);

    expect(spacing()).toMatchObject({
      top: 1,
      right: 2,
      bottom: 3,
      left: 2,
    });
    expect(spacing.top()).toBe(1);
    expect(spacing.right()).toBe(2);
    expect(spacing.bottom()).toBe(3);
    expect(spacing.left()).toBe(2);

    horizontal(4);
    expect(spacing()).toMatchObject({
      top: 1,
      right: 4,
      bottom: 3,
      left: 4,
    });
    expect(spacing.left()).toBe(4);
    expect(spacing.right()).toBe(4);
  });
});

  test('应该从数组创建', () => {
    const s1 = new Spacing([10]);
    expect(s1).toMatchObject({top: 10, right: 10, bottom: 10, left: 10});

    const s2 = new Spacing([10, 20]);
    expect(s2).toMatchObject({top: 10, right: 20, bottom: 10, left: 20});

    const s3 = new Spacing([10, 20, 30]);
    expect(s3).toMatchObject({top: 10, right: 20, bottom: 30, left: 20});

    const s4 = new Spacing([10, 20, 30, 40]);
    expect(s4).toMatchObject({top: 10, right: 20, bottom: 30, left: 40});
  });

  test('应该从对象创建', () => {
    const s = new Spacing({top: 10, right: 20, bottom: 30, left: 40});
    expect(s).toMatchObject({top: 10, right: 20, bottom: 30, left: 40});
  });

  test('应该处理 undefined 和 null', () => {
    const s1 = new Spacing(undefined);
    expect(s1).toMatchObject({top: 0, right: 0, bottom: 0, left: 0});

    const s2 = new Spacing(null as any);
    expect(s2).toMatchObject({top: 0, right: 0, bottom: 0, left: 0});
  });

  test('x getter 应该返回水平总和', () => {
    const s = new Spacing(10, 20, 30, 40);
    expect(s.x).toBe(60); // left + right = 40 + 20
  });

  test('y getter 应该返回垂直总和', () => {
    const s = new Spacing(10, 20, 30, 40);
    expect(s.y).toBe(40); // top + bottom = 10 + 30
  });

  test('lerp 应该插值', () => {
    const a = new Spacing(0, 0, 0, 0);
    const b = new Spacing(10, 20, 30, 40);
    const result = Spacing.lerp(a, b, 0.5);
    expect(result).toMatchObject({top: 5, right: 10, bottom: 15, left: 20});
  });

  test('lerp 实例方法应该工作', () => {
    const a = new Spacing(0, 0, 0, 0);
    const b = new Spacing(10, 20, 30, 40);
    const result = a.lerp(b, 0.5);
    expect(result).toMatchObject({top: 5, right: 10, bottom: 15, left: 20});
  });

  test('scale 应该缩放所有值', () => {
    const s = new Spacing(10, 20, 30, 40);
    const scaled = s.scale(2);
    expect(scaled).toMatchObject({top: 20, right: 40, bottom: 60, left: 80});
  });

  test('addScalar 应该给所有值加上标量', () => {
    const s = new Spacing(10, 20, 30, 40);
    const added = s.addScalar(5);
    expect(added).toMatchObject({top: 15, right: 25, bottom: 35, left: 45});
  });

  test('toString 应该返回字符串表示', () => {
    const s = new Spacing(10, 20, 30, 40);
    expect(s.toString()).toBe('Spacing(10, 20, 30, 40)');
  });

  test('serialize 应该序列化', () => {
    const s = new Spacing(10, 20, 30, 40);
    expect(s.serialize()).toEqual({
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    });
  });

  test('toSymbol 应该返回符号', () => {
    const s = new Spacing(10);
    expect(s.toSymbol()).toBe(Spacing.symbol);
  });

  test('createSignal 应该创建信号', () => {
    const signal = Spacing.createSignal(10);
    expect(signal()).toBeDefined();
    expect(signal().top).toBe(10);
  });

  test('应该支持单参数构造', () => {
    const s = new Spacing(10);
    expect(s).toMatchObject({top: 10, right: 10, bottom: 10, left: 10});
  });

  test('应该支持双参数构造', () => {
    const s = new Spacing(10, 20);
    expect(s).toMatchObject({top: 10, right: 20, bottom: 10, left: 20});
  });

  test('应该支持三参数构造', () => {
    const s = new Spacing(10, 20, 30);
    expect(s).toMatchObject({top: 10, right: 20, bottom: 30, left: 20});
  });

  test('应该支持四参数构造', () => {
    const s = new Spacing(10, 20, 30, 40);
    expect(s).toMatchObject({top: 10, right: 20, bottom: 30, left: 40});
  });
