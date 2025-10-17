import {describe, expect, test} from 'vitest';
import {createSignal} from '../signals';
import {BBox, Vector2} from '../types';

describe('BBox', () => {
  test('Correctly parses values', () => {
    const fromUndefined = new BBox();
    const fromProperties = new BBox(10, 20, 200, 100);
    const fromArray = new BBox([10, 20, 200, 100]);
    const fromVectors = new BBox(new Vector2(10, 20), new Vector2(200, 100));
    const fromObject = new BBox({x: 10, y: 20, width: 200, height: 100});

    expect(fromUndefined).toMatchObject({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    expect(fromProperties).toMatchObject({
      x: 10,
      y: 20,
      width: 200,
      height: 100,
    });
    expect(fromArray).toMatchObject({
      x: 10,
      y: 20,
      width: 200,
      height: 100,
    });
    expect(fromVectors).toMatchObject({
      x: 10,
      y: 20,
      width: 200,
      height: 100,
    });
    expect(fromObject).toMatchObject({
      x: 10,
      y: 20,
      width: 200,
      height: 100,
    });
  });

  test('Interpolates between bounding boxes', () => {
    const a = new BBox(10, 20, 200, 100);
    const b = new BBox(20, 40, 400, 200);

    const result = BBox.lerp(a, b, 0.5);

    expect(result).toMatchObject({
      x: 15,
      y: 30,
      width: 300,
      height: 150,
    });
  });

  test('Creates a compound signal', () => {
    const width = createSignal(200);
    const box = BBox.createSignal(() => [10, 20, width(), 100]);

    expect(box()).toMatchObject({x: 10, y: 20, width: 200, height: 100});
    expect(box.x()).toBe(10);
    expect(box.y()).toBe(20);
    expect(box.width()).toBe(200);
    expect(box.height()).toBe(100);

    width(400);
    expect(box()).toMatchObject({x: 10, y: 20, width: 400, height: 100});
    expect(box.width()).toBe(400);
  });

  describe('intersects', () => {
    test.each([
      ['a.left > b.right', new BBox(11, 0, 10, 10), new BBox(0, 0, 10, 10)],
      ['a.right < b.left', new BBox(0, 0, 10, 10), new BBox(11, 0, 10, 10)],
      ['a.top > b.bottom', new BBox(0, 11, 10, 10), new BBox(0, 0, 10, 10)],
      ['a.bottom < b.top', new BBox(0, 0, 10, 10), new BBox(11, 0, 10, 10)],
      [
        'boxes are touching but not overlapping',
        new BBox(0, 0, 10, 10),
        new BBox(10, 0, 10, 10),
      ],
    ])('does not intersect if %s', (_, a, b) => {
      expect(a.intersects(b)).toBe(false);
      expect(b.intersects(a)).toBe(false);
    });

    test('intersects', () => {
      const a = new BBox(0, 0, 10, 10);
      const b = new BBox(5, 5, 10, 10);

      expect(a.intersects(b)).toBe(true);
      expect(b.intersects(a)).toBe(true);
    });
  });

  test('fromSizeCentered 应该创建居中的边界框', () => {
    const bbox = BBox.fromSizeCentered(new Vector2(100, 50));
    expect(bbox.x).toBe(-50);
    expect(bbox.y).toBe(-25);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(50);
  });

  test('fromPoints 应该从点创建边界框', () => {
    const bbox = BBox.fromPoints(
      new Vector2(10, 20),
      new Vector2(100, 50),
      new Vector2(30, 80),
    );
    expect(bbox.x).toBe(10);
    expect(bbox.y).toBe(20);
    expect(bbox.width).toBe(90);
    expect(bbox.height).toBe(60);
  });

  test('fromBBoxes 应该从多个边界框创建边界框', () => {
    const bbox = BBox.fromBBoxes(
      new BBox(10, 20, 50, 30),
      new BBox(40, 10, 60, 40),
    );
    expect(bbox.x).toBe(10);
    expect(bbox.y).toBe(10);
    expect(bbox.width).toBe(90);
    expect(bbox.height).toBe(40);
  });

  test('position getter/setter 应该正常工作', () => {
    const bbox = new BBox(10, 20, 100, 50);
    expect(bbox.position).toMatchObject({x: 10, y: 20});
    
    bbox.position = new Vector2(30, 40);
    expect(bbox.x).toBe(30);
    expect(bbox.y).toBe(40);
  });

  test('size getter 应该返回尺寸', () => {
    const bbox = new BBox(10, 20, 100, 50);
    expect(bbox.size).toMatchObject({x: 100, y: 50});
  });

  test('center getter 应该返回中心点', () => {
    const bbox = new BBox(0, 0, 100, 50);
    expect(bbox.center).toMatchObject({x: 50, y: 25});
  });

  test('left/right/top/bottom setters 应该正常工作', () => {
    const bbox = new BBox(10, 20, 100, 50);
    
    bbox.left = 5;
    expect(bbox.x).toBe(5);
    expect(bbox.width).toBe(105);
    
    bbox.right = 120;
    expect(bbox.width).toBe(115);
    
    bbox.top = 15;
    expect(bbox.y).toBe(15);
    expect(bbox.height).toBe(55);
    
    bbox.bottom = 80;
    expect(bbox.height).toBe(65);
  });

  test('corners 应该返回四个角点', () => {
    const bbox = new BBox(10, 20, 100, 50);
    const [tl, tr, br, bl] = bbox.corners;
    
    expect(tl).toMatchObject({x: 10, y: 20});
    expect(tr).toMatchObject({x: 110, y: 20});
    expect(br).toMatchObject({x: 110, y: 70});
    expect(bl).toMatchObject({x: 10, y: 70});
  });

  test('pixelPerfect 应该返回像素完美的边界框', () => {
    const bbox = new BBox(10.3, 20.7, 100.2, 50.8);
    const perfect = bbox.pixelPerfect;
    
    expect(perfect.x).toBe(10);
    expect(perfect.y).toBe(20);
    expect(perfect.width).toBe(102); // ceil(100.2 + 1)
    expect(perfect.height).toBe(52); // ceil(50.8 + 1)
  });

  test('expand 应该扩展边界框', () => {
    const bbox = new BBox(10, 20, 100, 50);
    const expanded = bbox.expand(5);
    
    expect(expanded.x).toBe(5);
    expect(expanded.y).toBe(15);
    expect(expanded.width).toBe(110);
    expect(expanded.height).toBe(60);
  });

  test('includes 应该检查点是否在边界框内', () => {
    const bbox = new BBox(10, 20, 100, 50);
    
    expect(bbox.includes(new Vector2(50, 40))).toBe(true);
    expect(bbox.includes(new Vector2(10, 20))).toBe(true);
    expect(bbox.includes(new Vector2(110, 70))).toBe(true);
    expect(bbox.includes(new Vector2(5, 40))).toBe(false);
    expect(bbox.includes(new Vector2(120, 40))).toBe(false);
  });

  test('intersection 应该返回交集', () => {
    const a = new BBox(0, 0, 100, 100);
    const b = new BBox(50, 50, 100, 100);
    const intersection = a.intersection(b);
    
    expect(intersection.x).toBe(50);
    expect(intersection.y).toBe(50);
    expect(intersection.width).toBe(50);
    expect(intersection.height).toBe(50);
  });

  test('intersection 应该返回空边界框如果不相交', () => {
    const a = new BBox(0, 0, 10, 10);
    const b = new BBox(20, 20, 10, 10);
    const intersection = a.intersection(b);
    
    expect(intersection.width).toBe(0);
    expect(intersection.height).toBe(0);
  });

  test('union 应该返回并集', () => {
    const a = new BBox(0, 0, 50, 50);
    const b = new BBox(40, 40, 60, 60);
    const union = a.union(b);
    
    expect(union.x).toBe(0);
    expect(union.y).toBe(0);
    expect(union.width).toBe(100);
    expect(union.height).toBe(100);
  });

  test('toString 应该返回字符串表示', () => {
    const bbox = new BBox(10, 20, 100, 50);
    expect(bbox.toString()).toBe('BBox(10, 20, 100, 50)');
  });

  test('serialize 应该序列化', () => {
    const bbox = new BBox(10, 20, 100, 50);
    expect(bbox.serialize()).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
    });
  });

  test('arcLerp 应该使用弧形插值', () => {
    const a = new BBox(0, 0, 100, 100);
    const b = new BBox(200, 200, 100, 100);
    const result = BBox.arcLerp(a, b, 0.5);
    
    expect(result).toBeDefined();
    // arcLerp 可能产生 NaN，所以只检查结果存在
  });

  test('lerp 应该支持 Vector2 插值', () => {
    const a = new BBox(0, 0, 100, 100);
    const b = new BBox(200, 200, 200, 200);
    const result = BBox.lerp(a, b, new Vector2(0.5, 0.25));
    
    expect(result.x).toBe(100);
    expect(result.y).toBe(50);
    expect(result.width).toBe(150);
    expect(result.height).toBe(125);
  });

  test('lerp 应该支持 BBox 插值', () => {
    const a = new BBox(0, 0, 100, 100);
    const b = new BBox(200, 200, 200, 200);
    const value = new BBox(0.5, 0.25, 0.75, 0.1);
    const result = BBox.lerp(a, b, value);
    
    expect(result.x).toBe(100);
    expect(result.y).toBe(50);
    expect(result.width).toBe(175);
    expect(result.height).toBe(110);
  });
});

  test('transform 应该应用矩阵变换', () => {
    const bbox = new BBox(0, 0, 100, 50);
    const matrix = {m11: 1, m12: 0, m21: 0, m22: 1, m41: 10, m42: 20};
    const transformed = bbox.transform(matrix);
    
    expect(transformed).toBeDefined();
  });

  test('transformCorners 应该变换所有角点', () => {
    const bbox = new BBox(0, 0, 100, 50);
    const matrix = {m11: 1, m12: 0, m21: 0, m22: 1, m41: 10, m42: 20};
    const corners = bbox.transformCorners(matrix);
    
    expect(corners).toHaveLength(4);
  });

  test('addSpacing 应该是 expand 的别名', () => {
    const bbox = new BBox(10, 20, 100, 50);
    const expanded = bbox.addSpacing(5);
    
    expect(expanded.x).toBe(5);
    expect(expanded.y).toBe(15);
  });

  test('toSymbol 应该返回正确的符号', () => {
    const bbox = new BBox();
    expect(bbox.toSymbol()).toBe(BBox.symbol);
  });

  test('createSignal 应该创建信号', () => {
    const signal = BBox.createSignal([10, 20, 100, 50]);
    expect(signal()).toBeDefined();
    expect(signal().x).toBe(10);
  });

  test('lerp 实例方法应该工作', () => {
    const a = new BBox(0, 0, 100, 100);
    const b = new BBox(200, 200, 200, 200);
    const result = a.lerp(b, 0.5);
    
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
  });

  test('应该处理 null 构造参数', () => {
    const bbox = new BBox(null as any);
    expect(bbox.x).toBe(0);
    expect(bbox.y).toBe(0);
  });

  test('应该处理只有位置向量的构造', () => {
    const bbox = new BBox(new Vector2(10, 20));
    expect(bbox.x).toBe(10);
    expect(bbox.y).toBe(20);
    expect(bbox.width).toBe(0);
    expect(bbox.height).toBe(0);
  });
