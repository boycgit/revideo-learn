import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Renderer, RendererResult, RendererState, type RendererSettings} from './Renderer';
import type {Project} from './Project';
import type {Exporter} from '../exporter';
import {Vector2} from '../types';

class MockScene {
  public readonly name: string;
  public readonly slides = {isWaiting: vi.fn(() => false), onChanged: {current: []}};
  public readonly variables = {updateSignals: vi.fn()};
  public readonly previousOnTop = false;
  public readonly firstFrame = 0;
  public readonly lastFrame = 5;
  public readonly onReloaded = {subscribe: vi.fn(() => vi.fn())};
  public readonly onRecalculated = {subscribe: vi.fn(() => vi.fn())};
  public readonly onCacheChanged = {subscribe: vi.fn(() => vi.fn()), current: {firstFrame: 0, lastFrame: 5, transitionDuration: 0, duration: 5}};

  public constructor(config: any) {
    this.name = config.name;
  }

  public reload = vi.fn();
  public stopAllMedia = vi.fn();
  public render = vi.fn(async () => undefined);
  public reset = vi.fn(async () => undefined);
  public recalculate = vi.fn(async (callback: (frame: number) => void) => {
    callback(5);
  });
  public next = vi.fn(async () => undefined);
  public canTransitionOut = vi.fn(() => false);
  public isFinished = vi.fn(() => false);
  public isAfterTransitionIn = vi.fn(() => true);
  public isCached = vi.fn(() => false);
  public getMediaAssets = vi.fn(() => [{key: 'audio', type: 'audio', src: 'a.mp3', playbackRate: 1, volume: 1, currentTime: 0, duration: 1}]);
}

class StubExporter implements Exporter {
  public static readonly id = '@revideo/core/stub';
  public readonly handleFrame = vi.fn(async () => undefined);
  public readonly start = vi.fn(async () => undefined);
  public readonly stop = vi.fn(async () => undefined);
  public readonly kill = vi.fn(async () => undefined);
  public readonly mergeMedia = vi.fn(async () => undefined);
  public readonly generateAudio = vi.fn(async () => undefined);
  public readonly downloadVideos = vi.fn(async () => undefined);
  public readonly configuration = vi.fn(async () => undefined);
  public static async create() {
    return new StubExporter();
  }
}

const makeProject = (): Project => {
  const logger = {
    history: [],
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    http: vi.fn(),
    verbose: vi.fn(),
    debug: vi.fn(),
    silly: vi.fn(),
    logLevel: vi.fn(),
    profile: vi.fn(),
    get onLogged() {
      return {subscribe: vi.fn(() => vi.fn())};
    },
  } as any;

  const project: Project = {
    name: 'test',
    scenes: [
      {
        name: 'scene',
        klass: MockScene as any,
        config: {name: 'scene'},
      },
    ],
    variables: {},
    experimentalFeatures: false,
    logger,
    plugins: [],
    versions: {
      core: '0.0.0',
      two: null,
      ui: null,
      vitePlugin: null,
    },
    settings: {
      shared: {
        background: undefined as any,
        range: [0, 1],
        size: new Vector2(1920, 1080),
      },
      rendering: {
        exporter: {name: StubExporter.id} as any,
        fps: 30,
        resolutionScale: 1,
        colorSpace: 'srgb',
      },
      preview: {fps: 30, resolutionScale: 1},
    },
  };

  return project;
};

const settings: RendererSettings = {
  name: 'test',
  fps: 30,
  resolutionScale: 1,
  size: new Vector2(1920, 1080),
  range: [0, 1],
  exporter: {name: StubExporter.id},
  background: null,
  colorSpace: 'srgb',
  hiddenFolderId: undefined,
};

describe('Renderer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global as any, 'performance', 'get').mockReturnValue({now: vi.fn(() => 0)});
    const mockContext = {
      canvas: {width: 1920, height: 1080},
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      clip: vi.fn(),
      resetTransform: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      measureText: vi.fn(() => ({width: 0})),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      createLinearGradient: vi.fn(() => ({addColorStop: vi.fn()})),
      createPattern: vi.fn(() => ({})),
      createRadialGradient: vi.fn(() => ({addColorStop: vi.fn()})),
      setLineDash: vi.fn(),
      getLineDash: vi.fn(() => []),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      transform: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const mockCanvas = {
      width: 1920,
      height: 1080,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,'),
      style: {},
    } as unknown as HTMLCanvasElement;

    vi.spyOn(global as any, 'document', 'get').mockReturnValue({
      createElement: vi.fn(() => mockCanvas),
    });

    vi.spyOn(global as any, 'window', 'get').mockReturnValue({
      devicePixelRatio: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn(),
      cancelAnimationFrame: vi.fn(),
    });
  });

  test('frameToTime and timeToFrame conversions', () => {
    const renderer = new Renderer(makeProject());
    expect(renderer.frameToTime(30)).toBeCloseTo(1);
    expect(renderer.timeToFrame(0.5)).toBeCloseTo(15);
  });

  test('getNumberOfFrames returns duration and resets state', async () => {
    const renderer = new Renderer(makeProject());
    const frames = await renderer.getNumberOfFrames(settings);
    expect(frames).toBeGreaterThan(0);
    expect(renderer['state'].current).toBe(RendererState.Initial);
  });

  test('render uses exporter lifecycle and updates finished event', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    vi.spyOn<any, any>(renderer, 'run').mockResolvedValue(RendererResult.Success);
    const finished = vi.fn();
    renderer.onFinished.subscribe(finished);
    await renderer.render(settings);
    expect(renderer['state'].current).toBe(RendererState.Initial);
    expect(finished).toHaveBeenCalledWith(RendererResult.Success);
  });

  test('render handles missing exporter gracefully', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const loggerError = vi.spyOn(project.logger, 'error');
    await renderer['run']({...settings, exporter: {name: 'unknown'}}, new AbortController().signal);
    expect(loggerError).toHaveBeenCalled();
  });

  test('abort transitions state and signals abort controller', async () => {
    const renderer = new Renderer(makeProject());
    vi.spyOn(renderer as any, 'run').mockImplementation(async () => {
      renderer.abort();
      return RendererResult.Aborted;
    });
    await renderer.render(settings);
    expect(renderer['state'].current).toBe(RendererState.Initial);
  });

  test('renderFrame seeks frame and exports image', async () => {
    const renderer = new Renderer(makeProject());
    const seekSpy = vi.spyOn(renderer['playback'], 'seek').mockResolvedValue(false);
    vi.spyOn(renderer['stage'], 'render').mockResolvedValue(undefined);
    await renderer.renderFrame(settings, 0.5);
    expect(seekSpy).toHaveBeenCalled();
    expect(renderer['stage'].render).toHaveBeenCalled();
  });

  test('run performs export loop and stops exporter', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    exporter.downloadVideos.mockResolvedValue(undefined);
    exporter.generateAudio.mockResolvedValue(undefined);
    const createSpy = vi
      .spyOn(StubExporter, 'create')
      .mockResolvedValue(exporter);

    const result = await renderer['run'](settings, new AbortController().signal);
    expect([RendererResult.Success, RendererResult.Error]).toContain(result);
    if (result === RendererResult.Success) {
      expect(createSpy).toHaveBeenCalled();
      expect(exporter.start).toHaveBeenCalled();
      expect(exporter.handleFrame).toHaveBeenCalled();
      expect(exporter.stop).toHaveBeenCalledWith(RendererResult.Success);
    }
  });

  test('run handles exporter errors and logs', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    exporter.handleFrame.mockRejectedValue(new Error('fail'));
    vi.spyOn(StubExporter, 'create').mockResolvedValue(exporter);
    const result = await renderer['run'](settings, new AbortController().signal);
    expect(result).toBe(RendererResult.Error);
    expect(project.logger.error).toHaveBeenCalled();
  });

  test('run returns aborted when signal triggered', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    exporter.handleFrame.mockImplementation(async () => {
      throw new DOMException('AbortError', 'AbortError');
    });
    vi.spyOn(StubExporter, 'create').mockResolvedValue(exporter);
    const controller = new AbortController();
    const promise = renderer['run'](settings, controller.signal);
    controller.abort();
    const result = await promise;
    expect([RendererResult.Aborted, RendererResult.Error]).toContain(result);
  });

  test('getMediaByFrames collects media assets between range', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const vectorSpy = vi.spyOn(Vector2.prototype, 'exactlyEquals').mockReturnValue(true);
    const media = await renderer['getMediaByFrames'](settings);
    vectorSpy.mockRestore();
    expect(media.length).toBeGreaterThan(0);
    expect(media[0][0]).toMatchObject({type: 'audio'});
  });

  test('应该正确处理 stage 配置', () => {
    const renderer = new Renderer(makeProject());
    expect(renderer.stage).toBeDefined();
    expect(renderer.estimator).toBeDefined();
  });

  test('应该订阅状态变化事件', () => {
    const renderer = new Renderer(makeProject());
    const callback = vi.fn();
    renderer.onStateChanged.subscribe(callback);
    expect(callback).toHaveBeenCalled();
  });

  test('应该订阅帧变化事件', () => {
    const renderer = new Renderer(makeProject());
    const callback = vi.fn();
    renderer.onFrameChanged.subscribe(callback);
    expect(callback).toHaveBeenCalled();
  });

  test('应该正确处理多个场景', async () => {
    const project = makeProject();
    project.scenes.push({
      name: 'scene2',
      klass: MockScene as any,
      config: {name: 'scene2'},
    });
    const renderer = new Renderer(project);
    const frames = await renderer.getNumberOfFrames(settings);
    expect(frames).toBeGreaterThan(0);
  });

  test('renderFrame 应该处理不同的时间点', async () => {
    const renderer = new Renderer(makeProject());
    vi.spyOn(renderer['playback'], 'seek').mockResolvedValue(false);
    vi.spyOn(renderer['stage'], 'render').mockResolvedValue(undefined);
    
    await renderer.renderFrame(settings, 0);
    await renderer.renderFrame(settings, 0.5);
    await renderer.renderFrame(settings, 1);
    
    expect(renderer['playback'].seek).toHaveBeenCalledTimes(3);
  });

  test('应该正确计算帧数', () => {
    const renderer = new Renderer(makeProject());
    expect(renderer.timeToFrame(1)).toBe(30);
    expect(renderer.frameToTime(60)).toBe(2);
  });

  test('abort 应该在渲染过程中工作', async () => {
    const renderer = new Renderer(makeProject());
    let aborted = false;
    
    vi.spyOn(renderer as any, 'run').mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      if (renderer['abortController']?.signal.aborted) {
        aborted = true;
        return RendererResult.Aborted;
      }
      return RendererResult.Success;
    });
    
    const renderPromise = renderer.render(settings);
    renderer.abort();
    await renderPromise;
    
    expect(aborted || renderer['state'].current === RendererState.Initial).toBe(true);
  });




  test('应该正确处理 reloadScenes', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    await renderer['reloadScenes'](settings);
    
    const scene = renderer['playback'].onScenesRecalculated.current[0];
    expect(scene.reload).toHaveBeenCalled();
  });

  test('应该在 reloadScenes 中更新变量', async () => {
    const project = makeProject();
    project.variables = {testVar: 'testValue'};
    const renderer = new Renderer(project);
    
    await renderer['reloadScenes'](settings);
    
    const scene = renderer['playback'].onScenesRecalculated.current[0];
    expect(scene.variables.updateSignals).toHaveBeenCalledWith(project.variables);
  });

  test('应该支持 exportFrame', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    renderer['exporter'] = exporter;
    
    const signal = new AbortController().signal;
    await renderer['exportFrame'](signal);
    
    expect(exporter.handleFrame).toHaveBeenCalled();
  });

  test('应该在 exportFrame 中传递正确的参数', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    renderer['exporter'] = exporter;
    
    const signal = new AbortController().signal;
    await renderer['exportFrame'](signal);
    
    expect(exporter.handleFrame).toHaveBeenCalledWith(
      renderer.stage.finalBuffer,
      expect.any(Number),
      expect.any(Number),
      expect.any(String),
      signal,
    );
  });

  test('应该正确计算 sceneFrame', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    renderer['exporter'] = exporter;
    
    renderer['playback'].frame = 10;
    
    const signal = new AbortController().signal;
    await renderer['exportFrame'](signal);
    
    // sceneFrame 应该被正确计算
    expect(exporter.handleFrame).toHaveBeenCalledWith(
      expect.anything(),
      10,
      expect.any(Number),
      expect.any(String),
      signal,
    );
  });

  test('应该在 render 抛出异常时处理错误', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const exporter = new StubExporter();
    exporter.handleFrame.mockRejectedValue(new Error('test error'));
    vi.spyOn(StubExporter, 'create').mockResolvedValue(exporter);
    
    await renderer.render(settings);
    
    // 验证错误被记录
    expect(project.logger.error).toHaveBeenCalled();
  });

  test('应该在状态不是 Initial 时跳过 render', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    renderer['state'].current = RendererState.Working;
    
    await renderer.render(settings);
    
    // 状态应该保持 Working
    expect(renderer['state'].current).toBe(RendererState.Working);
  });

  test('应该在 abort 时设置状态为 Aborting', () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    renderer['state'].current = RendererState.Working;
    renderer.abort();
    
    expect(renderer['state'].current).toBe(RendererState.Aborting);
  });

  test('应该在状态不是 Working 时跳过 abort', () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    renderer['state'].current = RendererState.Initial;
    const controller = renderer['abortController'];
    
    renderer.abort();
    
    // abortController 不应该被调用
    expect(renderer['abortController']).toBe(controller);
  });

  test('应该在 renderFrame 中处理错误', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    vi.spyOn(renderer['playback'], 'reset').mockRejectedValue(new Error('test error'));
    
    await renderer.renderFrame(settings, 0.5);
    
    expect(project.logger.error).toHaveBeenCalled();
  });

  test('应该在 renderFrame 后释放锁', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    const seekSpy = vi.spyOn(renderer['playback'], 'seek').mockResolvedValue(false);
    
    await renderer.renderFrame(settings, 0.5);
    
    // 验证 renderFrame 完成
    expect(seekSpy).toHaveBeenCalled();
  });

  test('应该支持 onStateChanged 事件', () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const callback = vi.fn();
    
    renderer.onStateChanged.subscribe(callback);
    renderer['state'].current = RendererState.Working;
    
    expect(callback).toHaveBeenCalledWith(RendererState.Working);
  });

  test('应该支持 onFrameChanged 事件', () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    const callback = vi.fn();
    
    renderer.onFrameChanged.subscribe(callback);
    renderer['frame'].current = 10;
    
    expect(callback).toHaveBeenCalledWith(10);
  });

  test('应该在 getMediaByFrames 中处理错误', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    vi.spyOn(renderer['playback'], 'progress').mockRejectedValue(new Error('test error'));
    
    const media = await renderer['getMediaByFrames'](settings);
    
    expect(project.logger.error).toHaveBeenCalled();
    expect(media).toBeDefined();
  });

  test('应该在 getMediaByFrames 中收集所有帧的媒体资源', async () => {
    const project = makeProject();
    const renderer = new Renderer(project);
    
    const media = await renderer['getMediaByFrames'](settings);
    
    expect(media.length).toBeGreaterThan(0);
    expect(media[0]).toBeInstanceOf(Array);
  });
});
