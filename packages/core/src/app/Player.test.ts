import {beforeEach, describe, expect, test, vi} from 'vitest';
import {Player} from './Player';
import type {Project, PlayerSettings, PlayerState} from './Project';
import type {Logger} from './Logger';

class TestScene {
  public readonly name: string;
  public readonly slides = {isWaiting: () => false, onChanged: {current: []}};
  public readonly variables = {updateSignals: vi.fn()};
  public readonly previousOnTop = false;
  public readonly firstFrame = 0;
  public readonly lastFrame = 10;
  public calls: string[] = [];
  public readonly onReloaded = {subscribe: vi.fn(() => vi.fn())};
  public readonly onRecalculated = {subscribe: vi.fn(() => vi.fn())};
  public readonly onCacheChanged = {
    subscribe: vi.fn(() => vi.fn()),
    current: {firstFrame: 0, lastFrame: 10, transitionDuration: 0, duration: 10},
  };
  public reload = vi.fn();

  public constructor(config: any) {
    this.name = config?.name ?? 'testScene';
    this.calls.push('constructed');
  }

  public isCached() {
    return false;
  }

  public stopAllMedia = vi.fn();
  public render = vi.fn(async () => undefined);
  public reset = vi.fn(async () => undefined);
  public recalculate = vi.fn(async (cb: (frame: number) => void) => {
    cb(10);
  });
  public next = vi.fn(async () => undefined);
  public canTransitionOut() {
    return false;
  }
  public isFinished() {
    return false;
  }
  public isAfterTransitionIn() {
    return true;
  }
}

const createProject = () => {
  const logger: Logger = {
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
      return {subscribe: vi.fn(() => vi.fn())} as any;
    },
  } as any;

  const project: Project = {
    name: 'test',
    scenes: [
      {
        name: 'first',
        klass: TestScene as any,
        config: {name: 'first'},
      },
    ],
    variables: {value: 1},
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
        size: {x: 1920, y: 1080} as any,
      },
      rendering: {
        exporter: {name: '@revideo/core/wasm'} as any,
        fps: 60,
        resolutionScale: 1,
        colorSpace: 'srgb',
      },
      preview: {fps: 60, resolutionScale: 1},
    },
  };

  return {project, logger};
};

describe('Player', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setTimeout(() => cb(performance.now()), 0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  const createPlayer = (settings: Partial<PlayerSettings> = {}, state: Partial<PlayerState> = {}) => {
    const {project, logger} = createProject();
    const player = new Player(project, settings, state, 0);
    return {player, project, logger};
  };

  test('constructor initializes scenes and dispatchers', () => {
    const {player} = createPlayer();
    expect(player.playback.currentScene.name).toBe('first');
    expect(player.playback.fps).toBe(60);
    expect(player.status.frame).toBe(0);
  });

  test('configure updates range, fps and triggers recalculation', async () => {
    const {player} = createPlayer();
    const scene = player.playback.onScenesRecalculated.current[0] as TestScene;
    scene.reload = vi.fn();
    vi.spyOn(player.playback, 'reload');
    vi.spyOn(player.playback, 'seek').mockResolvedValue(false);
    const newSettings: PlayerSettings = {
      range: [0.2, 1],
      fps: 120,
      size: new (player as any).size.constructor(800, 600),
      resolutionScale: 2,
    } as any;

    await player.configure(newSettings);
    expect(player.playback.fps).toBe(120);
    expect(player.playback.reload).toHaveBeenCalled();
    expect(scene.reload).toHaveBeenCalled();
  });

  test('togglePlayback switches playback state and resets when finished', async () => {
    const {player} = createPlayer({}, {loop: false});
    player.playback.frame = player.playback.duration = 1;
    player.playback.finished = true;
    player.togglePlayback(true);
    await vi.waitFor(() => {
      expect((player as any).requestedSeek).toBe(0);
    });
    expect(player.playerState.current.paused).toBeFalsy();
  });

  test('setSpeed adjusts playback and requests recalculation', () => {
    const {player} = createPlayer();
    const scene = player.playback.onScenesRecalculated.current[0] as TestScene;
    scene.reload = vi.fn();
    vi.spyOn(player.playback, 'reload');
    const requestSpy = vi.spyOn(player as any, 'requestRecalculation');
    player.setSpeed(2);
    expect(player.playback.speed).toBe(2);
    expect(player.playback.reload).toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalled();
    expect(scene.reload).toHaveBeenCalled();
  });

  test('request loop manages seek and render', async () => {
    const {player} = createPlayer();
    const renderSpy = vi.spyOn(player['render'], 'dispatch');
    const seekSpy = vi.spyOn(player.playback, 'seek').mockResolvedValue(false);
    player.requestSeek(5);
    player.requestRender();
    await vi.waitFor(() => {
      expect(seekSpy).toHaveBeenCalled();
    });
    expect(renderSpy).toHaveBeenCalled();
  });

  test('deactivate stops animation frame and disposes shared context', () => {
    const {player} = createPlayer();
    const disposeSpy = vi.spyOn(player['sharedWebGLContext'], 'dispose');
    player.deactivate();
    expect(disposeSpy).toHaveBeenCalled();
  });

  test('clampRange respects start and end frame boundaries', () => {
    const {player} = createPlayer({range: [0, 1]});
    expect(player.clampRange(-10)).toBe(0);
    expect(player.clampRange(9999)).toBe(player.playback.duration);
  });

  test('应该支持获取当前帧', () => {
    const {player} = createPlayer();
    expect(player.status.frame).toBeGreaterThanOrEqual(0);
  });

  test('应该支持 onRender 事件', () => {
    const {player} = createPlayer();
    const callback = vi.fn();
    player.onRender.subscribe(callback);
    
    // 触发渲染
    player.requestRender();
  });

  test('应该支持 deactivate', () => {
    const {player} = createPlayer();
    player.deactivate();
    expect(player['active']).toBe(false);
  });

  test('应该支持 activate', () => {
    const {player} = createPlayer();
    player.activate();
    expect(player['active']).toBe(true);
  });

  test('应该支持 requestRender', () => {
    const {player} = createPlayer();
    player.requestRender();
    expect(player['requestedRender']).toBe(true);
  });

  test('应该支持 requestRecalculation', () => {
    const {player} = createPlayer();
    player.requestRecalculation();
    expect(player['requestedRecalculation']).toBe(true);
  });
});
