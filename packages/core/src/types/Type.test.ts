import {describe, expect, it} from 'vitest';
import {EPSILON, isType} from './Type';

describe('Type', () => {
  describe('EPSILON', () => {
    it('应该是一个很小的数', () => {
      expect(EPSILON).toBe(0.000001);
      expect(EPSILON).toBeGreaterThan(0);
      expect(EPSILON).toBeLessThan(0.001);
    });
  });

  describe('isType', () => {
    it('应该识别有效的 Type 对象', () => {
      const validType = {
        toSymbol: () => Symbol('test'),
      };
      expect(isType(validType)).toBe(true);
    });

    it('应该拒绝没有 toSymbol 方法的对象', () => {
      const invalidType = {
        someMethod: () => {},
      };
      expect(isType(invalidType)).toBe(false);
    });

    it('应该拒绝 null 和 undefined', () => {
      expect(isType(null)).toBeFalsy();
      expect(isType(undefined)).toBeFalsy();
    });

    it('应该拒绝原始类型', () => {
      expect(isType(42)).toBe(false);
      expect(isType('string')).toBe(false);
      expect(isType(true)).toBe(false);
    });
  });
});
