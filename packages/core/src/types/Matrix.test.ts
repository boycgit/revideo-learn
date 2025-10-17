import {describe, expect, it} from 'vitest';
import {transformAngle, transformScalar} from './Matrix';
import {Matrix2D} from './Matrix2D';

describe('Matrix', () => {
  describe('transformAngle', () => {
    it('应该转换角度', () => {
      const matrix = Matrix2D.fromRotation(45);
      const angle = transformAngle(0, matrix as any);
      expect(angle).toBeCloseTo(45, 0);
    });

    it('应该处理单位矩阵', () => {
      const matrix = new Matrix2D();
      const angle = transformAngle(45, matrix as any);
      expect(angle).toBeCloseTo(45, 0);
    });

    it('应该处理负角度', () => {
      const matrix = new Matrix2D();
      const angle = transformAngle(-45, matrix as any);
      expect(angle).toBeCloseTo(-45, 0);
    });

    it('应该处理 90 度旋转', () => {
      const matrix = Matrix2D.fromRotation(90);
      const angle = transformAngle(0, matrix as any);
      expect(angle).toBeCloseTo(90, 0);
    });

    it('应该处理 180 度旋转', () => {
      const matrix = Matrix2D.fromRotation(180);
      const angle = transformAngle(0, matrix as any);
      expect(Math.abs(angle)).toBeCloseTo(180, 0);
    });

    it('应该处理任意角度输入', () => {
      const matrix = new Matrix2D();
      
      expect(transformAngle(30, matrix as any)).toBeCloseTo(30, 0);
      expect(transformAngle(60, matrix as any)).toBeCloseTo(60, 0);
      expect(transformAngle(120, matrix as any)).toBeCloseTo(120, 0);
    });

    it('应该处理零角度', () => {
      const matrix = new Matrix2D();
      expect(transformAngle(0, matrix as any)).toBeCloseTo(0, 0);
    });

    it('应该处理 360 度', () => {
      const matrix = new Matrix2D();
      const angle = transformAngle(360, matrix as any);
      // 360 度等同于 0 度
      expect(Math.abs(angle) % 360).toBeCloseTo(0, 0);
    });
  });

  describe('transformScalar', () => {
    it('应该转换标量值', () => {
      const matrix = {
        m11: 1,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      expect(scalar).toBeCloseTo(10);
    });

    it('应该应用缩放变换', () => {
      const matrix = {
        m11: 2,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      expect(scalar).toBeCloseTo(20);
    });

    it('应该处理零值', () => {
      const matrix = {
        m11: 1,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(0, matrix);
      expect(scalar).toBe(0);
    });

    it('应该处理负缩放', () => {
      const matrix = {
        m11: -1,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      expect(scalar).toBeCloseTo(10);
    });

    it('应该处理非零 m12 值', () => {
      const matrix = {
        m11: 1,
        m12: 1,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      expect(scalar).toBeGreaterThan(10);
    });

    it('应该处理小数缩放', () => {
      const matrix = {
        m11: 0.5,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      expect(scalar).toBeCloseTo(5);
    });

    it('应该处理大缩放值', () => {
      const matrix = {
        m11: 10,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(5, matrix);
      expect(scalar).toBeCloseTo(50);
    });

    it('应该处理复杂矩阵', () => {
      const matrix = {
        m11: 2,
        m12: 1,
      } as DOMMatrix;
      
      const scalar = transformScalar(10, matrix);
      // magnitude = sqrt(2^2 + 1^2) = sqrt(5) ≈ 2.236
      expect(scalar).toBeCloseTo(22.36, 1);
    });

    it('应该处理负数标量', () => {
      const matrix = {
        m11: 2,
        m12: 0,
      } as DOMMatrix;
      
      const scalar = transformScalar(-10, matrix);
      expect(scalar).toBeCloseTo(-20);
    });

    it('应该处理单位矩阵', () => {
      const matrix = {
        m11: 1,
        m12: 0,
      } as DOMMatrix;
      
      expect(transformScalar(1, matrix)).toBe(1);
      expect(transformScalar(100, matrix)).toBe(100);
    });
  });
});
