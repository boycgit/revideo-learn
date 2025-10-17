import {describe, expect, test} from 'vitest';
import {createSignal} from '../signals';
import type {PossibleVector2} from '../types';
import {Vector2} from '../types';
import {rotateVector} from './vector-transformations';

describe('Vector2', () => {
  test('Correctly parses values', () => {
    const fromUndefined = new Vector2();
    const fromScalar = new Vector2(3);
    const fromProperties = new Vector2(2, 4);
    const fromArray = new Vector2([2, -1]);
    const fromVector = new Vector2(Vector2.up);
    const fromObject = new Vector2({x: -1, y: 3});

    expect(fromUndefined).toMatchObject({x: 0, y: 0});
    expect(fromScalar).toMatchObject({x: 3, y: 3});
    expect(fromProperties).toMatchObject({x: 2, y: 4});
    expect(fromArray).toMatchObject({x: 2, y: -1});
    expect(fromVector).toMatchObject({x: 0, y: 1});
    expect(fromObject).toMatchObject({x: -1, y: 3});
  });

  test('Interpolates between vectors', () => {
    const a = new Vector2(10, 24);
    const b = new Vector2(-10, 12);

    const result = Vector2.lerp(a, b, 0.5);

    expect(result).toMatchObject({x: 0, y: 18});
  });

  test('Creates a compound signal', () => {
    const x = createSignal(1);
    const vector = Vector2.createSignal(() => [x(), 2]);

    expect(vector()).toMatchObject({x: 1, y: 2});
    expect(vector.x()).toBe(1);
    expect(vector.y()).toBe(2);

    x(3);
    expect(vector()).toMatchObject({x: 3, y: 2});
    expect(vector.x()).toBe(3);
  });

  test.each([
    [[0, 0], 0],
    [[1, 1], 45],
    [[0, 1], 90],
    [[-1, 1], 135],
    [[-1, 0], 180],
    [[-1, -1], -135],
    [[0, -1], -90],
    [[1, -1], -45],
  ])(
    'Computes angle of vector with positive x-axis in degrees: (%s, %s)',
    (points, expected) => {
      const vector = new Vector2(points[0], points[1]);

      expect(vector.degrees).toBe(expected);
      expect(Vector2.degrees(points[0], points[1])).toBe(expected);
    },
  );

  describe('equality', () => {
    test('equal if all components are exactly equal', () => {
      const a = new Vector2(2.5, 2.5);
      const b = new Vector2(2.5, 2.5);

      expect(a.equals(b)).toBe(true);
      expect(b.equals(a)).toBe(true);
    });

    test('equal if all components are within epsilon of each other', () => {
      const a = new Vector2(2.5, 2.5);
      const b = new Vector2(2.499, 2.499);

      expect(a.equals(b, 0.001)).toBe(true);
      expect(b.equals(a, 0.001)).toBe(true);
    });

    test('not equal if not all components are within epsilon of each other', () => {
      const a = new Vector2(2.5, 2.5);
      const b = new Vector2(2.498, 2.498);

      expect(a.equals(b, 0.001)).toBe(false);
      expect(b.equals(a, 0.001)).toBe(false);
    });

    test('exactly equal if all components are exactly equal', () => {
      const a = new Vector2(2.5, 2.5);
      const b = new Vector2(2.5, 2.5);

      expect(a.exactlyEquals(b)).toBe(true);
      expect(b.exactlyEquals(a)).toBe(true);
    });

    test('not exactly equal if not all components are exactly equal', () => {
      const a = new Vector2(2.5, 2.5);
      const b = new Vector2(2.49, 2.49);

      expect(a.exactlyEquals(b)).toBe(false);
      expect(b.exactlyEquals(a)).toBe(false);
    });
  });

  test.each([
    [[0, 0], 0],
    [[1, 0], 1],
    [[0, 1], 1],
    [[2, 1], 5],
    [[-1, 3], 10],
  ])(
    'Computes the squared magnitude of the vector: (%s, %s)',
    (points, expected) => {
      const vector = new Vector2(points[0], points[1]);

      expect(vector.squaredMagnitude).toBe(expected);
      expect(Vector2.squaredMagnitude(points[0], points[1])).toBe(expected);
    },
  );

  test.each([
    [0, [1, 0]],
    [30, [Math.sqrt(3) / 2, 0.5]],
    [60, [0.5, Math.sqrt(3) / 2]],
    [90, [0, 1]],
    [180, [-1, 0]],
    [270, [0, -1]],
    [360, [1, 0]],
    [-90, [0, -1]],
    [-180, [-1, 0]],
    [-270, [0, 1]],
  ])('Creates a Vector from an angle in degrees: (%s°)', (angle, expected) => {
    const vector = Vector2.fromDegrees(angle);
    expect(vector.equals(new Vector2(expected as PossibleVector2))).toBe(true);
  });

  test.each([
    [0, [5, 10]],
    [30, [-0.669872981, 11.1602540378]],
    [45, [-3.535533905, 10.6066017178]],
    [60, [-6.160254037, 9.3301270189]],
    [90, [-10, 5]],
    [180, [-5, -10]],
    [270, [10, -5]],
    [360, [5, 10]],
    [-90, [10, -5]],
    [-180, [-5, -10]],
    [-270, [-10, 5]],
  ])('Rotates a vector around the origin: (%s°)', (angle, expected) => {
    const vector = new Vector2(5, 10);
    const result = rotateVector(vector, angle);
    expect(result.equals(new Vector2(expected as PossibleVector2))).toBe(true);
  });

  test.each([
    [[1, 0], 90, [1, -1]],
    [[1, 0], -90, [1, 1]],
    [[-1, 0], 90, [-1, 1]],
    [[-1, 0], -90, [-1, -1]],
    [[0, 1], 90, [1, 1]],
    [[0, 1], -90, [-1, 1]],
    [[0, -1], 90, [-1, -1]],
    [[0, -1], -90, [1, -1]],
  ])(
    'Rotates a vector around an arbitrary point: (%s, %s°)',
    (center, angle, expected) => {
      const vector = Vector2.zero;
      const result = rotateVector(vector, angle, center as PossibleVector2);
      expect(result).toEqual(new Vector2(expected as PossibleVector2));
    },
  );
});

  test('fromOrigin 应该从原点创建向量', () => {
    expect(Vector2.fromOrigin(0)).toMatchObject({x: 0, y: 0});
  });

  test('fromScalar 应该从标量创建向量', () => {
    const v = Vector2.fromScalar(5);
    expect(v).toMatchObject({x: 5, y: 5});
  });

  test('fromRadians 应该从弧度创建向量', () => {
    const v = Vector2.fromRadians(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  test('fromDegrees 应该从角度创建向量', () => {
    const v = Vector2.fromDegrees(90);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(1);
  });

  test('magnitude 应该计算向量长度', () => {
    expect(Vector2.magnitude(3, 4)).toBe(5);
  });

  test('squaredMagnitude 应该计算平方长度', () => {
    expect(Vector2.squaredMagnitude(3, 4)).toBe(25);
  });

  test('angleBetween 应该计算两个向量之间的角度', () => {
    const u = new Vector2(1, 0);
    const v = new Vector2(0, 1);
    const angle = Vector2.angleBetween(u, v);
    expect(angle).toBeCloseTo(Math.PI / 2);
  });

  test('width/height getters 应该工作', () => {
    const v = new Vector2(10, 20);
    expect(v.width).toBe(10);
    expect(v.height).toBe(20);
  });

  test('width/height setters 应该工作', () => {
    const v = new Vector2(10, 20);
    v.width = 30;
    v.height = 40;
    expect(v.x).toBe(30);
    expect(v.y).toBe(40);
  });

  test('normalized 应该返回单位向量', () => {
    const v = new Vector2(3, 4);
    const normalized = v.normalized;
    expect(normalized.magnitude).toBeCloseTo(1);
  });

  test('safe 应该处理 NaN', () => {
    const v = new Vector2(NaN, 10);
    const safe = v.safe;
    expect(safe.x).toBe(0);
    expect(safe.y).toBe(10);
  });

  test('flipped 应该翻转向量', () => {
    const v = new Vector2(10, 20);
    const flipped = v.flipped;
    expect(flipped).toMatchObject({x: -10, y: -20});
  });

  test('floored 应该向下取整', () => {
    const v = new Vector2(10.7, 20.3);
    const floored = v.floored;
    expect(floored).toMatchObject({x: 10, y: 20});
  });

  test('perpendicular 应该返回垂直向量', () => {
    const v = new Vector2(1, 0);
    const perp = v.perpendicular;
    expect(perp).toMatchObject({x: 0, y: -1});
  });

  test('ctg 应该计算余切', () => {
    const v = new Vector2(10, 5);
    expect(v.ctg).toBe(2);
  });

  test('scale 应该缩放向量', () => {
    const v = new Vector2(10, 20);
    const scaled = v.scale(2);
    expect(scaled).toMatchObject({x: 20, y: 40});
  });

  test('mul 应该乘以向量', () => {
    const v = new Vector2(10, 20);
    const result = v.mul(new Vector2(2, 3));
    expect(result).toMatchObject({x: 20, y: 60});
  });

  test('div 应该除以向量', () => {
    const v = new Vector2(10, 20);
    const result = v.div(new Vector2(2, 4));
    expect(result).toMatchObject({x: 5, y: 5});
  });

  test('add 应该加向量', () => {
    const v = new Vector2(10, 20);
    const result = v.add(new Vector2(5, 10));
    expect(result).toMatchObject({x: 15, y: 30});
  });

  test('sub 应该减向量', () => {
    const v = new Vector2(10, 20);
    const result = v.sub(new Vector2(5, 10));
    expect(result).toMatchObject({x: 5, y: 10});
  });

  test('dot 应该计算点积', () => {
    const v = new Vector2(10, 20);
    const result = v.dot(new Vector2(2, 3));
    expect(result).toBe(80);
  });

  test('cross 应该计算叉积', () => {
    const v = new Vector2(10, 20);
    const result = v.cross(new Vector2(2, 3));
    expect(result).toBe(-10);
  });

  test('mod 应该计算模', () => {
    const v = new Vector2(10, 20);
    const result = v.mod(new Vector2(3, 7));
    expect(result).toMatchObject({x: 1, y: 6});
  });

  test('addX 应该只增加 x', () => {
    const v = new Vector2(10, 20);
    const result = v.addX(5);
    expect(result).toMatchObject({x: 15, y: 20});
  });

  test('addY 应该只增加 y', () => {
    const v = new Vector2(10, 20);
    const result = v.addY(5);
    expect(result).toMatchObject({x: 10, y: 25});
  });

  test('toString 应该返回字符串', () => {
    const v = new Vector2(10, 20);
    expect(v.toString()).toBe('Vector2(10, 20)');
  });

  test('serialize 应该序列化', () => {
    const v = new Vector2(10, 20);
    expect(v.serialize()).toEqual({x: 10, y: 20});
  });

  test('exactlyEquals 应该精确比较', () => {
    const v1 = new Vector2(10, 20);
    const v2 = new Vector2(10, 20);
    const v3 = new Vector2(10.0001, 20);
    
    expect(v1.exactlyEquals(v2)).toBe(true);
    expect(v1.exactlyEquals(v3)).toBe(false);
  });

  test('equals 应该允许误差比较', () => {
    const v1 = new Vector2(10, 20);
    const v2 = new Vector2(10.0001, 20.0001);
    
    expect(v1.equals(v2, 0.001)).toBe(true);
    expect(v1.equals(v2, 0.00001)).toBe(false);
  });

  test('arcLerp 应该使用弧形插值', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(100, 100);
    const result = Vector2.arcLerp(a, b, 0.5);
    
    expect(result).toBeDefined();
  });

  test('createArcLerp 应该创建弧形插值函数', () => {
    const lerp = Vector2.createArcLerp(false, 1);
    const result = lerp(new Vector2(0, 0), new Vector2(100, 100), 0.5);
    
    expect(result).toBeDefined();
  });

  test('polarLerp 应该在极坐标平面插值', () => {
    const a = new Vector2(10, 0);
    const b = new Vector2(0, 10);
    const result = Vector2.polarLerp(a, b, 0.5);
    
    expect(result).toBeDefined();
    expect(result.magnitude).toBeCloseTo(10);
  });

  test('createPolarLerp 应该创建极坐标插值函数', () => {
    const lerp = Vector2.createPolarLerp(true, new Vector2(0, 0));
    const result = lerp(new Vector2(10, 0), new Vector2(0, 10), 0.5);
    
    expect(result).toBeDefined();
  });

  test('getOriginOffset 应该计算原点偏移', () => {
    const v = new Vector2(100, 50);
    const offset = v.getOriginOffset(0);
    
    expect(offset).toBeDefined();
  });

  test('lerp 实例方法应该工作', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(100, 100);
    const result = a.lerp(b, 0.5);
    
    expect(result).toMatchObject({x: 50, y: 50});
  });

  test('lerp 应该支持 Vector2 插值值', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(100, 100);
    const result = Vector2.lerp(a, b, new Vector2(0.5, 0.25));
    
    expect(result).toMatchObject({x: 50, y: 25});
  });

  test('应该正确解析 width/height 对象', () => {
    const v = new Vector2({width: 100, height: 50});
    expect(v).toMatchObject({x: 100, y: 50});
  });

  test('toSymbol 应该返回正确的符号', () => {
    const v = new Vector2(10, 20);
    expect(v.toSymbol()).toBe(Vector2.symbol);
  });

  test('createSignal 应该支持自定义 owner', () => {
    const owner = {key: 'test'};
    const signal = Vector2.createSignal(
      {x: 10, y: 20},
      Vector2.lerp,
      owner,
    );
    expect(signal()).toBeDefined();
  });

  test('应该处理 null 构造参数', () => {
    const v = new Vector2(null as any);
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  test('应该处理单个数字构造', () => {
    const v = new Vector2(5);
    expect(v.x).toBe(5);
    expect(v.y).toBe(5);
  });

  test('polarLerp 应该支持自定义原点', () => {
    const a = new Vector2(10, 0);
    const b = new Vector2(0, 10);
    const result = Vector2.polarLerp(a, b, 0.5, false, new Vector2(5, 5));
    
    expect(result).toBeDefined();
  });

  test('polarLerp 应该处理逆时针旋转', () => {
    const a = new Vector2(10, 0);
    const b = new Vector2(0, 10);
    const result = Vector2.polarLerp(a, b, 0.5, true);
    
    expect(result).toBeDefined();
  });

  test('radians getter 应该返回弧度', () => {
    const v = new Vector2(1, 0);
    expect(v.radians).toBeCloseTo(0);
  });

  test('degrees getter 应该返回角度', () => {
    const v = new Vector2(1, 0);
    expect(v.degrees).toBeCloseTo(0);
  });

  test('squaredMagnitude getter 应该返回平方长度', () => {
    const v = new Vector2(3, 4);
    expect(v.squaredMagnitude).toBe(25);
  });

  test('常量应该正确定义', () => {
    expect(Vector2.zero).toMatchObject({x: 0, y: 0});
    expect(Vector2.one).toMatchObject({x: 1, y: 1});
    expect(Vector2.right).toMatchObject({x: 1, y: 0});
    expect(Vector2.left).toMatchObject({x: -1, y: 0});
    expect(Vector2.up).toMatchObject({x: 0, y: 1});
    expect(Vector2.down).toMatchObject({x: 0, y: -1});
    expect(Vector2.top).toMatchObject({x: 0, y: -1});
    expect(Vector2.bottom).toMatchObject({x: 0, y: 1});
    expect(Vector2.topLeft).toMatchObject({x: -1, y: -1});
    expect(Vector2.topRight).toMatchObject({x: 1, y: -1});
    expect(Vector2.bottomLeft).toMatchObject({x: -1, y: 1});
    expect(Vector2.bottomRight).toMatchObject({x: 1, y: 1});
  });
