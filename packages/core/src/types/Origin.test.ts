import {describe, expect, it} from 'vitest';
import {flipOrigin, originToOffset} from './Origin';
import {Center, Direction, Origin} from './alignment-enums';
import {Vector2} from './Vector';

describe('Origin', () => {
  describe('flipOrigin', () => {
    it('应该垂直翻转 Top 到 Bottom', () => {
      const result = flipOrigin(Direction.Top, Center.Vertical);
      expect(result).toBe(Direction.Bottom);
    });

    it('应该垂直翻转 Bottom 到 Top', () => {
      const result = flipOrigin(Direction.Bottom, Center.Vertical);
      expect(result).toBe(Direction.Top);
    });

    it('应该水平翻转 Left 到 Right', () => {
      const result = flipOrigin(Direction.Left, Center.Horizontal);
      expect(result).toBe(Direction.Right);
    });

    it('应该水平翻转 Right 到 Left', () => {
      const result = flipOrigin(Direction.Right, Center.Horizontal);
      expect(result).toBe(Direction.Left);
    });

    it('应该同时翻转两个轴', () => {
      const result = flipOrigin(Origin.TopLeft);
      expect(result).toBe(Origin.BottomRight);
    });

    it('应该翻转 TopRight 到 BottomLeft', () => {
      const result = flipOrigin(Origin.TopRight);
      expect(result).toBe(Origin.BottomLeft);
    });

    it('应该只翻转指定的轴', () => {
      const result = flipOrigin(Origin.TopLeft, Center.Horizontal);
      expect(result).toBe(Origin.TopRight);
    });

    it('应该保持 Middle 不变', () => {
      const result = flipOrigin(Origin.Middle);
      expect(result).toBe(Origin.Middle);
    });
  });

  describe('originToOffset', () => {
    it('应该将 Middle 转换为零向量', () => {
      const offset = originToOffset(Origin.Middle);
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(0);
    });

    it('应该将 TopLeft 转换为 (-1, -1)', () => {
      const offset = originToOffset(Origin.TopLeft);
      expect(offset.x).toBe(-1);
      expect(offset.y).toBe(-1);
    });

    it('应该将 TopRight 转换为 (1, -1)', () => {
      const offset = originToOffset(Origin.TopRight);
      expect(offset.x).toBe(1);
      expect(offset.y).toBe(-1);
    });

    it('应该将 BottomLeft 转换为 (-1, 1)', () => {
      const offset = originToOffset(Origin.BottomLeft);
      expect(offset.x).toBe(-1);
      expect(offset.y).toBe(1);
    });

    it('应该将 BottomRight 转换为 (1, 1)', () => {
      const offset = originToOffset(Origin.BottomRight);
      expect(offset.x).toBe(1);
      expect(offset.y).toBe(1);
    });

    it('应该将 Top 转换为 (0, -1)', () => {
      const offset = originToOffset(Direction.Top);
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(-1);
    });

    it('应该将 Bottom 转换为 (0, 1)', () => {
      const offset = originToOffset(Direction.Bottom);
      expect(offset.x).toBe(0);
      expect(offset.y).toBe(1);
    });

    it('应该将 Left 转换为 (-1, 0)', () => {
      const offset = originToOffset(Direction.Left);
      expect(offset.x).toBe(-1);
      expect(offset.y).toBe(0);
    });

    it('应该将 Right 转换为 (1, 0)', () => {
      const offset = originToOffset(Direction.Right);
      expect(offset.x).toBe(1);
      expect(offset.y).toBe(0);
    });
  });
});
