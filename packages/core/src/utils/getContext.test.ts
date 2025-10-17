import {describe, expect, it, vi} from 'vitest';
import {getContext} from './getContext';

describe('getContext', () => {
  it('应该创建 2D 上下文', () => {
    const context = getContext();
    expect(context).toBeDefined();
    expect(context).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it('应该支持自定义选项', () => {
    const context = getContext({alpha: false});
    expect(context).toBeDefined();
    expect(context).toBeInstanceOf(CanvasRenderingContext2D);
  });

  it('应该支持自定义画布', () => {
    const canvas = document.createElement('canvas');
    const context = getContext(undefined, canvas);
    expect(context).toBeDefined();
    expect(context.canvas).toBe(canvas);
  });

  it('应该在无法创建上下文时抛出错误', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
    
    expect(() => getContext()).toThrow('Could not create a 2D context.');
    
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it('应该使用默认画布', () => {
    const context = getContext();
    expect(context.canvas).toBeDefined();
    expect(context.canvas.width).toBeGreaterThan(0);
    expect(context.canvas.height).toBeGreaterThan(0);
  });

  it('应该支持传入选项参数', () => {
    const options: CanvasRenderingContext2DSettings = {
      alpha: false,
      desynchronized: true,
    };
    const context = getContext(options);
    expect(context).toBeDefined();
  });

  it('应该使用提供的 canvas 元素', () => {
    const customCanvas = document.createElement('canvas');
    customCanvas.width = 800;
    customCanvas.height = 600;
    
    const context = getContext(undefined, customCanvas);
    expect(context.canvas).toBe(customCanvas);
    expect(context.canvas.width).toBe(800);
    expect(context.canvas.height).toBe(600);
  });

  it('应该支持不同的上下文选项组合', () => {
    const options1 = {alpha: true, willReadFrequently: true};
    const context1 = getContext(options1);
    expect(context1).toBeDefined();

    const options2 = {desynchronized: false};
    const context2 = getContext(options2);
    expect(context2).toBeDefined();
  });
});
