import {describe, expect, test} from 'vitest';
import {Color} from './Color';

describe('Color.lerp', () => {
  test('interpolates between colors', () => {
    expect(
      Color.lerp('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 1 / 2).css(),
    ).toMatchInlineSnapshot(`"rgb(119,119,119)"`);
    expect(
      Color.lerp('hsl(0, 0%, 0%)', 'hsl(0, 0%, 100%)', 1 / 2).css(),
    ).toMatchInlineSnapshot(`"rgb(119,119,119)"`);
  });
  test('returns starting value at 0', () => {
    expect(Color.lerp('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 0).css()).toEqual(
      'rgb(0,0,0)',
    );
  });
  test('returns final value at 1', () => {
    expect(Color.lerp('rgb(0, 0, 0)', 'rgb(255, 255, 255)', 1).css()).toEqual(
      'rgb(255,255,255)',
    );
  });
});

describe('Color.createLerp', () => {
  test('creates an interpolation function with default LCH mode', () => {
    const lerpFn = Color.createLerp();
    expect(
      lerpFn(
        new Color('rgb(0, 0, 0)'),
        new Color('rgb(255, 255, 255)'),
        0.5,
      ).css(),
    ).toEqual('rgb(119,119,119)');
  });

  test('creates an interpolation function with a specified mode (e.g., lab)', () => {
    const lerpFn = Color.createLerp('lab');
    const expected = Color.lerp(
      'rgb(0, 0, 0)',
      'rgb(255, 255, 255)',
      0.5,
      'lab',
    );

    expect(
      lerpFn(
        new Color('rgb(0, 0, 0)'),
        new Color('rgb(255, 255, 255)'),
        0.5,
      ).css(),
    ).toEqual(expected.css());

    // Example with a different color pair to ensure mode is used
    const blueToYellowLerp = Color.createLerp('lab');
    expect(
      blueToYellowLerp(new Color('blue'), new Color('yellow'), 0.5).css(),
    ).toMatchInlineSnapshot(`"rgb(193,137,172)"`);
  });
});

describe('Color Constructor', () => {
  test('parses 4-digit hex codes correctly', () => {
    // Opaque (#rgb -> #rrggbb)
    expect(new Color('#f00').serialize()).toBe('rgba(255, 0, 0, 1.000)');
    expect(new Color('#0f0').serialize()).toBe('rgba(0, 255, 0, 1.000)');
    // Transparent (#rgba -> #rrggbbaa)
    expect(new Color('#00f8').serialize()).toBe('rgba(0, 0, 255, 0.533)'); // 88/255 = 0.5333...
    expect(new Color('#fff0').serialize()).toBe('rgba(255, 255, 255, 0.000)'); // 00/255 = 0
  });

  test('parses 8-digit hex codes correctly', () => {
    // Opaque
    expect(new Color('#ff0000ff').serialize()).toBe('rgba(255, 0, 0, 1.000)');
    // Transparent
    expect(new Color('#00ff0080').serialize()).toBe('rgba(0, 255, 0, 0.502)'); // 128/255 = 0.5019...
    expect(new Color('#0000ff00').serialize()).toBe('rgba(0, 0, 255, 0.000)');
  });

  test('parses CSS color names correctly', () => {
    expect(new Color('red').serialize()).toBe('rgba(255, 0, 0, 1.000)');
    expect(new Color('lime').serialize()).toBe('rgba(0, 255, 0, 1.000)'); // CSS 'green' is #008000
    expect(new Color('blue').serialize()).toBe('rgba(0, 0, 255, 1.000)');
    expect(new Color('lightgray').serialize()).toBe(
      'rgba(211, 211, 211, 1.000)',
    );
    expect(new Color('lightgrey').serialize()).toBe(
      'rgba(211, 211, 211, 1.000)',
    ); // Alias
    expect(new Color('transparent').serialize()).toBe('rgba(0, 0, 0, 0.000)');
  });

  test('handles invalid string input', () => {
    expect(() => new Color('invalid-color-string')).toThrow(
      'Invalid color string value provided: invalid-color-string',
    );
    expect(() => new Color('#gggggg')).toThrow(
      'Invalid color string value provided: #gggggg',
    );
  });
});

describe('Color 构造函数', () => {
  test('应该处理 undefined 和 null', () => {
    const c1 = new Color(undefined);
    expect(c1.r).toBe(0);
    expect(c1.g).toBe(0);
    expect(c1.b).toBe(0);
    expect(c1.a).toBe(1);

    const c2 = new Color(null as any);
    expect(c2.r).toBe(0);
    expect(c2.g).toBe(0);
    expect(c2.b).toBe(0);
    expect(c2.a).toBe(1);
  });

  test('应该处理 Color 实例', () => {
    const c1 = new Color('red');
    const c2 = new Color(c1);
    expect(c2.r).toBe(c1.r);
    expect(c2.g).toBe(c1.g);
    expect(c2.b).toBe(c1.b);
    expect(c2.a).toBe(c1.a);
  });

  test('应该处理数字', () => {
    const c = new Color(0xff0000);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
    expect(c.a).toBe(1);
  });

  test('应该处理 ColorObject', () => {
    const c = new Color({r: 255, g: 128, b: 64, a: 0.5});
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0.5019, 2);
    expect(c.b).toBeCloseTo(0.2509, 2);
    expect(c.a).toBe(0.5);
  });

  test('应该处理没有 alpha 的 ColorObject', () => {
    const c = new Color({r: 255, g: 128, b: 64, a: undefined as any});
    expect(c.a).toBe(1);
  });
});

describe('Color 方法', () => {
  test('css 应该返回 rgb 字符串', () => {
    const c = new Color('rgba(255, 128, 64, 0.5)');
    expect(c.css()).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
  });

  test('alpha 应该返回 alpha 值', () => {
    const c = new Color('rgba(255, 128, 64, 0.5)');
    expect(c.alpha()).toBe(0.5);
  });

  test('hex 应该返回十六进制字符串', () => {
    const c = new Color('red');
    const hex = c.hex();
    expect(hex).toMatch(/^#[0-9a-f]{8}$/i);
  });

  test('lerp 实例方法应该工作', () => {
    const c1 = new Color('black');
    const c2 = new Color('white');
    const result = c1.lerp(c2, 0.5);
    expect(result).toBeDefined();
  });

  test('toSymbol 应该返回符号', () => {
    const c = new Color('red');
    expect(c.toSymbol()).toBe(Color.symbol);
  });
});

describe('Color.createSignal', () => {
  test('应该创建颜色信号', () => {
    const signal = Color.createSignal('red');
    expect(signal()).toBeDefined();
    expect(signal() instanceof Color).toBe(true);
  });
});

describe('Color.lerp 不同模式', () => {
  test('应该支持 rgb 模式', () => {
    const result = Color.lerp('red', 'blue', 0.5, 'rgb');
    expect(result).toBeDefined();
  });

  test('应该支持 hsl 模式', () => {
    const result = Color.lerp('red', 'blue', 0.5, 'hsl');
    expect(result).toBeDefined();
  });

  test('应该支持 lab 模式', () => {
    const result = Color.lerp('red', 'blue', 0.5, 'lab');
    expect(result).toBeDefined();
  });

  test('应该处理 null 颜色', () => {
    const result = Color.lerp(null, 'blue', 0.5);
    expect(result).toBeDefined();
  });
});

describe('Color 边缘情况', () => {
  test('应该处理超出范围的 RGB 值', () => {
    const c = new Color({r: 300, g: -50, b: 128, a: 1.5});
    expect(c.r).toBeGreaterThanOrEqual(0);
    expect(c.r).toBeLessThanOrEqual(1);
    expect(c.g).toBeGreaterThanOrEqual(0);
    expect(c.b).toBeGreaterThanOrEqual(0);
    expect(c.a).toBeGreaterThanOrEqual(0);
    expect(c.a).toBeLessThanOrEqual(1);
  });

  test('应该处理 HSL 颜色字符串', () => {
    const c = new Color('hsl(120, 100%, 50%)');
    expect(c).toBeDefined();
    expect(c.r).toBeGreaterThanOrEqual(0);
  });

  test('应该处理 RGBA 颜色字符串', () => {
    const c = new Color('rgba(255, 128, 64, 0.5)');
    expect(c.a).toBeCloseTo(0.5);
  });

  test('lerp 应该处理 Color 实例', () => {
    const c1 = new Color('red');
    const c2 = new Color('blue');
    const result = Color.lerp(c1, c2, 0.5);
    expect(result).toBeDefined();
  });

  test('createLerp 应该支持不同的插值模式', () => {
    const modes = ['rgb', 'hsl', 'lab', 'lch', 'oklch'] as const;
    
    modes.forEach(mode => {
      const lerp = Color.createLerp(mode);
      const result = lerp(new Color('red'), new Color('blue'), 0.5);
      expect(result).toBeDefined();
    });
  });

  test('serialize 应该返回 rgba 字符串', () => {
    const c = new Color('red');
    const serialized = c.serialize();
    expect(serialized).toMatch(/^rgba\(/);
  });

  test('应该处理透明色', () => {
    const c = new Color('transparent');
    expect(c.a).toBe(0);
  });

  test('应该处理十六进制颜色', () => {
    const c = new Color('#ff0000');
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });

  test('应该处理短十六进制颜色', () => {
    const c = new Color('#f00');
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });
});
