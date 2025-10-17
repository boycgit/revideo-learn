import {describe, expect, it} from 'vitest';
import {map, remap, clamp, clampRemap} from './helpers';

describe('helpers', () => {
  describe('map', () => {
    it('应该在范围内映射值', () => {
      expect(map(0, 10, 0)).toBe(0);
      expect(map(0, 10, 0.5)).toBe(5);
      expect(map(0, 10, 1)).toBe(10);
    });

    it('应该支持负数范围', () => {
      expect(map(-10, 10, 0.5)).toBe(0);
      expect(map(-5, 5, 0)).toBe(-5);
      expect(map(-5, 5, 1)).toBe(5);
    });

    it('应该支持反向范围', () => {
      expect(map(10, 0, 0)).toBe(10);
      expect(map(10, 0, 0.5)).toBe(5);
      expect(map(10, 0, 1)).toBe(0);
    });
  });

  describe('remap', () => {
    it('应该重新映射值', () => {
      expect(remap(0, 1, 0, 10, 0.5)).toBe(5);
      expect(remap(0, 100, 0, 1, 50)).toBe(0.5);
    });

    it('应该处理不同的输入范围', () => {
      expect(remap(10, 20, 0, 100, 15)).toBe(50);
      expect(remap(-10, 10, 0, 100, 0)).toBe(50);
    });

    it('应该支持负数输出范围', () => {
      expect(remap(0, 1, -10, 10, 0.5)).toBe(0);
      expect(remap(0, 1, -10, 10, 0)).toBe(-10);
      expect(remap(0, 1, -10, 10, 1)).toBe(10);
    });
  });

  describe('clamp', () => {
    it('应该限制值在范围内', () => {
      expect(clamp(0, 10, 5)).toBe(5);
      expect(clamp(0, 10, -5)).toBe(0);
      expect(clamp(0, 10, 15)).toBe(10);
    });

    it('应该处理边界值', () => {
      expect(clamp(0, 10, 0)).toBe(0);
      expect(clamp(0, 10, 10)).toBe(10);
    });

    it('应该支持负数范围', () => {
      expect(clamp(-10, -5, -7)).toBe(-7);
      expect(clamp(-10, -5, -15)).toBe(-10);
      expect(clamp(-10, -5, 0)).toBe(-5);
    });
  });

  describe('clampRemap', () => {
    it('应该重新映射并限制值', () => {
      expect(clampRemap(0, 1, 0, 10, 0.5)).toBe(5);
      expect(clampRemap(0, 1, 0, 10, -0.5)).toBe(0);
      expect(clampRemap(0, 1, 0, 10, 1.5)).toBe(10);
    });

    it('应该处理反向输出范围', () => {
      expect(clampRemap(0, 1, 10, 0, 0.5)).toBe(5);
      expect(clampRemap(0, 1, 10, 0, -0.5)).toBe(10);
      expect(clampRemap(0, 1, 10, 0, 1.5)).toBe(0);
    });

    it('应该正确限制边界值', () => {
      expect(clampRemap(0, 10, 0, 100, 5)).toBe(50);
      expect(clampRemap(0, 10, 0, 100, -5)).toBe(0);
      expect(clampRemap(0, 10, 0, 100, 15)).toBe(100);
    });
  });
});
