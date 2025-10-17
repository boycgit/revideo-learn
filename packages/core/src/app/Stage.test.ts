import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Color, Vector2} from '../types';
import * as utils from '../utils';
import {Stage} from './Stage';

interface FakeContext {
  canvas: {width: number; height: number};
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fillStyle: string;
}

function createContext(): FakeContext {
  return {
    canvas: {width: 0, height: 0},
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: '',
  } as FakeContext;
}

describe('Stage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(utils, 'getContext').mockImplementation((_, __) =>
      createContext() as unknown as CanvasRenderingContext2D,
    );
  });

  test('configure updates contexts and background', () => {
    const stage = new Stage();

    stage.configure({
      colorSpace: 'display-p3',
      size: new Vector2(800, 600),
      resolutionScale: 2,
      background: '#123456',
    });

    expect(utils.getContext).toHaveBeenCalledTimes(6);
    const scaledSize = (stage as any).context.canvas;
    expect(scaledSize.width).toBe(1600);
    expect(scaledSize.height).toBe(1200);

    const color = new Color('#010101');
    stage.configure({background: color});
    expect(stage['background']).toBe(color.serialize());
  });

  test('render draws previous and current scenes respecting background', async () => {
    const stage = new Stage();
    stage.configure({
      size: new Vector2(100, 50),
      resolutionScale: 1,
      background: '#ffffff',
    });

    const currentRender = vi.fn();
    const previousRender = vi.fn();
    const currentScene = {render: currentRender, previousOnTop: false} as any;
    const previousScene = {render: previousRender, previousOnTop: false} as any;

    await stage.render(currentScene, previousScene);

    expect(previousRender).toHaveBeenCalled();
    expect(currentRender).toHaveBeenCalled();
    const finalCtx = (stage as any).context as FakeContext;
    const currentCtx = (stage as any).currentContext as FakeContext;
    const previousCtx = (stage as any).previousContext as FakeContext;
    expect(finalCtx!.clearRect).toHaveBeenCalledWith(0, 0, 100, 50);
    expect(finalCtx!.drawImage).toHaveBeenCalledTimes(2);
    expect(currentCtx!.drawImage).not.toHaveBeenCalled();
    expect(previousCtx!.drawImage).not.toHaveBeenCalled();
  });

  test('resizeCanvas adjusts width and height based on scale', () => {
    const stage = new Stage();
    stage.configure({resolutionScale: 0.5, size: new Vector2(200, 100)});
    const finalCtx = (stage as any).context as FakeContext;
    stage.resizeCanvas(finalCtx as unknown as CanvasRenderingContext2D);
    expect(finalCtx!.canvas.width).toBe(100);
    expect(finalCtx!.canvas.height).toBe(50);
  });
});
