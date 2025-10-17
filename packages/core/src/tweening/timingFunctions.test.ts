import {describe, expect, it} from 'vitest';
import {
  sin,
  cos,
  linear,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  createEaseInBack,
  createEaseOutBack,
  createEaseInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  createEaseInElastic,
  createEaseOutElastic,
  createEaseInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  createEaseInBounce,
  createEaseOutBounce,
  createEaseInOutBounce,
} from './timingFunctions';

describe('timingFunctions', () => {
  describe('linear', () => {
    it('应该返回线性插值', () => {
      expect(linear(0)).toBe(0);
      expect(linear(0.5)).toBe(0.5);
      expect(linear(1)).toBe(1);
    });

    it('应该支持自定义范围', () => {
      expect(linear(0.5, 10, 20)).toBe(15);
    });
  });

  describe('sin', () => {
    it('应该返回正弦值', () => {
      expect(sin(0)).toBeCloseTo(0.5);
      expect(sin(Math.PI / 2)).toBeCloseTo(1);
    });

    it('应该支持自定义范围', () => {
      expect(sin(Math.PI / 2, 0, 10)).toBeCloseTo(10);
    });
  });

  describe('cos', () => {
    it('应该返回余弦值', () => {
      expect(cos(0)).toBeCloseTo(1);
      expect(cos(Math.PI)).toBeCloseTo(0);
    });

    it('应该支持自定义范围', () => {
      expect(cos(0, 0, 10)).toBeCloseTo(10);
    });
  });

  describe('Sine easing', () => {
    it('easeInSine 应该在开始时缓慢', () => {
      expect(easeInSine(0)).toBe(0);
      expect(easeInSine(1)).toBeCloseTo(1);
      expect(easeInSine(0.5)).toBeLessThan(0.5);
    });

    it('easeOutSine 应该在结束时缓慢', () => {
      expect(easeOutSine(0)).toBe(0);
      expect(easeOutSine(1)).toBeCloseTo(1);
      expect(easeOutSine(0.5)).toBeGreaterThan(0.5);
    });

    it('easeInOutSine 应该在两端缓慢', () => {
      expect(easeInOutSine(0)).toBe(0);
      expect(easeInOutSine(1)).toBeCloseTo(1);
      expect(easeInOutSine(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Quadratic easing', () => {
    it('easeInQuad 应该正确计算', () => {
      expect(easeInQuad(0)).toBe(0);
      expect(easeInQuad(1)).toBe(1);
      expect(easeInQuad(0.5, 0, 10)).toBe(2.5);
    });

    it('easeOutQuad 应该正确计算', () => {
      expect(easeOutQuad(0)).toBe(0);
      expect(easeOutQuad(1)).toBe(1);
      expect(easeOutQuad(0.5, 0, 10)).toBe(7.5);
    });

    it('easeInOutQuad 应该正确计算', () => {
      expect(easeInOutQuad(0)).toBe(0);
      expect(easeInOutQuad(1)).toBe(1);
      expect(easeInOutQuad(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Cubic easing', () => {
    it('easeInCubic 应该正确计算', () => {
      expect(easeInCubic(0)).toBe(0);
      expect(easeInCubic(1)).toBe(1);
      expect(easeInCubic(0.5, 0, 10)).toBe(1.25);
    });

    it('easeOutCubic 应该正确计算', () => {
      expect(easeOutCubic(0)).toBe(0);
      expect(easeOutCubic(1)).toBe(1);
      expect(easeOutCubic(0.5, 0, 10)).toBe(8.75);
    });

    it('easeInOutCubic 应该正确计算', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
      expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Quartic easing', () => {
    it('easeInQuart 应该正确计算', () => {
      expect(easeInQuart(0)).toBe(0);
      expect(easeInQuart(1)).toBe(1);
      expect(easeInQuart(0.5, 0, 10)).toBe(0.625);
    });

    it('easeOutQuart 应该正确计算', () => {
      expect(easeOutQuart(0)).toBe(0);
      expect(easeOutQuart(1)).toBe(1);
      expect(easeOutQuart(0.5, 0, 10)).toBe(9.375);
    });

    it('easeInOutQuart 应该正确计算', () => {
      expect(easeInOutQuart(0)).toBe(0);
      expect(easeInOutQuart(1)).toBe(1);
      expect(easeInOutQuart(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Quintic easing', () => {
    it('easeInQuint 应该正确计算', () => {
      expect(easeInQuint(0)).toBe(0);
      expect(easeInQuint(1)).toBe(1);
      expect(easeInQuint(0.5, 0, 10)).toBe(0.3125);
    });

    it('easeOutQuint 应该正确计算', () => {
      expect(easeOutQuint(0)).toBe(0);
      expect(easeOutQuint(1)).toBe(1);
      expect(easeOutQuint(0.5, 0, 10)).toBe(9.6875);
    });

    it('easeInOutQuint 应该正确计算', () => {
      expect(easeInOutQuint(0)).toBe(0);
      expect(easeInOutQuint(1)).toBe(1);
      expect(easeInOutQuint(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Exponential easing', () => {
    it('easeInExpo 应该正确计算', () => {
      expect(easeInExpo(0)).toBe(0);
      expect(easeInExpo(1)).toBe(1);
      expect(easeInExpo(0.5, 0, 10)).toBeCloseTo(0.3125);
    });

    it('easeOutExpo 应该正确计算', () => {
      expect(easeOutExpo(0)).toBe(0);
      expect(easeOutExpo(1)).toBe(1);
      expect(easeOutExpo(0.5, 0, 10)).toBeCloseTo(9.6875);
    });

    it('easeInOutExpo 应该正确计算', () => {
      expect(easeInOutExpo(0)).toBe(0);
      expect(easeInOutExpo(1)).toBe(1);
      expect(easeInOutExpo(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Circular easing', () => {
    it('easeInCirc 应该正确计算', () => {
      expect(easeInCirc(0)).toBe(0);
      expect(easeInCirc(1)).toBeCloseTo(1);
      expect(easeInCirc(0.5, 0, 10)).toBeCloseTo(1.3397459621556135);
    });

    it('easeOutCirc 应该正确计算', () => {
      expect(easeOutCirc(0)).toBe(0);
      expect(easeOutCirc(1)).toBeCloseTo(1);
      expect(easeOutCirc(0.5, 0, 10)).toBeCloseTo(8.660254037844387);
    });

    it('easeInOutCirc 应该正确计算', () => {
      expect(easeInOutCirc(0)).toBe(0);
      expect(easeInOutCirc(1)).toBeCloseTo(1);
      expect(easeInOutCirc(0.5)).toBeCloseTo(0.5);
    });
  });

  describe('Back easing', () => {
    it('easeInBack 应该正确计算', () => {
      expect(easeInBack(0)).toBe(0);
      expect(easeInBack(1)).toBeCloseTo(1);
    });

    it('easeOutBack 应该正确计算', () => {
      expect(easeOutBack(0)).toBeCloseTo(0);
      expect(easeOutBack(1)).toBeCloseTo(1);
    });

    it('easeInOutBack 应该正确计算', () => {
      expect(easeInOutBack(0)).toBe(0);
      expect(easeInOutBack(1)).toBeCloseTo(1);
    });

    it('createEaseInBack 应该支持自定义参数', () => {
      const customEase = createEaseInBack(2);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBeCloseTo(1);
    });

    it('createEaseOutBack 应该支持自定义参数', () => {
      const customEase = createEaseOutBack(2);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBeCloseTo(1);
    });

    it('createEaseInOutBack 应该支持自定义参数', () => {
      const customEase = createEaseInOutBack(2, 1.5);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBeCloseTo(1);
    });
  });

  describe('Elastic easing', () => {
    it('easeInElastic 应该正确计算', () => {
      expect(easeInElastic(0)).toBe(0);
      expect(easeInElastic(1)).toBe(1);
    });

    it('easeOutElastic 应该正确计算', () => {
      expect(easeOutElastic(0)).toBe(0);
      expect(easeOutElastic(1)).toBe(1);
    });

    it('easeInOutElastic 应该正确计算', () => {
      expect(easeInOutElastic(0)).toBe(0);
      expect(easeInOutElastic(1)).toBe(1);
    });

    it('createEaseInElastic 应该支持自定义参数', () => {
      const customEase = createEaseInElastic(3);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBe(1);
    });

    it('createEaseOutElastic 应该支持自定义参数', () => {
      const customEase = createEaseOutElastic(3);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBe(1);
    });

    it('createEaseInOutElastic 应该支持自定义参数', () => {
      const customEase = createEaseInOutElastic(2);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBe(1);
    });
  });

  describe('Bounce easing', () => {
    it('easeInBounce 应该正确计算', () => {
      expect(easeInBounce(0)).toBeCloseTo(0);
      expect(easeInBounce(1)).toBeCloseTo(1);
    });

    it('easeOutBounce 应该正确计算', () => {
      expect(easeOutBounce(0)).toBe(0);
      expect(easeOutBounce(1)).toBeCloseTo(1);
    });

    it('easeInOutBounce 应该正确计算', () => {
      expect(easeInOutBounce(0)).toBeCloseTo(0);
      expect(easeInOutBounce(1)).toBeCloseTo(1);
    });

    it('createEaseInBounce 应该支持自定义参数', () => {
      const customEase = createEaseInBounce(8, 3);
      expect(customEase(0)).toBeCloseTo(0, 0.2);
      expect(customEase(1)).toBeCloseTo(1);
    });

    it('createEaseOutBounce 应该支持自定义参数', () => {
      const customEase = createEaseOutBounce(8, 3);
      expect(customEase(0)).toBe(0);
      expect(customEase(1)).toBeCloseTo(1, 0.2);
      expect(customEase(0.2, 0, 10)).toBeGreaterThan(0);
    });

    it('createEaseInOutBounce 应该支持自定义参数', () => {
      const customEase = createEaseInOutBounce(8, 3);
      expect(customEase(0)).toBeCloseTo(0, 0.1);
      expect(customEase(1)).toBeCloseTo(1, 0.1);
    });
  });
});
