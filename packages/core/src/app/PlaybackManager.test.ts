import {describe, expect, test} from 'vitest';
import {PlaybackManager, PlaybackState} from './PlaybackManager';

class MockScene {
  public slides = {onChanged: {current: [] as string[]}, isWaiting: () => false};
  public variables = {updateSignals: (_: Record<string, unknown>) => undefined};
  public firstFrame: number;
  public lastFrame: number;
  public name: string;
  public frame = 0;
  public finished = false;
  public cached = false;
  public reloadArgs: any[] = [];
  public constructor(
    private manager: PlaybackManager,
    id: string,
    range: [number, number],
    cached = false,
  ) {
    this.name = id;
    this.firstFrame = range[0];
    this.lastFrame = range[1];
    this.cached = cached;
  }

  public isCached() {
    return this.cached;
  }

  public async reset() {
    this.frame = this.firstFrame;
    this.finished = false;
    this.manager.frame = this.firstFrame;
  }

  public async recalculate(cb: (frame: number) => void) {
    this.slides.onChanged.current = [`${this.name}-slide`];
    cb(this.lastFrame);
  }

  public async next() {
    this.frame = this.manager.frame;
    this.finished = this.frame >= this.lastFrame;
  }

  public stopAllMedia() {
    /* noop */
  }

  public canTransitionOut() {
    return this.manager.frame >= this.lastFrame - 1;
  }

  public isAfterTransitionIn() {
    return this.manager.frame > this.firstFrame;
  }

  public isFinished() {
    return this.manager.frame >= this.lastFrame && this.finished;
  }

  public reload(arg?: unknown) {
    this.reloadArgs.push(arg);
  }
}

const createManager = () => {
  const manager = new PlaybackManager();
  const scenes = [
    new MockScene(manager, 'a', [0, 5]),
    new MockScene(manager, 'b', [5, 10]),
  ];
  manager.setup(scenes as any);
  return {manager, scenes};
};

describe('PlaybackManager', () => {
  test('setup initializes scenes and allows subscribing', () => {
    const {manager, scenes} = createManager();
    expect(manager.onScenesRecalculated.current).toEqual(scenes);
    expect(manager.currentScene).toBe(scenes[0]);

    const dispose = manager.onSceneChanged.subscribe(
      scene => {
        expect(scene).toBe(scenes[1]);
      },
      false,
    );
    manager.currentScene = scenes[1] as any;
    dispose();
  });

  test('progress transitions between scenes', async () => {
    const {manager, scenes} = createManager();
    manager.speed = 1;
    manager.state = PlaybackState.Rendering;
    await manager.progress();
    expect(manager.frame).toBe(1);

    await manager.seek(6);
    expect(manager.currentScene).toBe(scenes[1]);
    expect(manager.frame).toBe(6);
  });

  test('seek rewinds when requesting earlier frame', async () => {
    const {manager} = createManager();
    await manager.seek(4);
    expect(manager.frame).toBe(5);
    await manager.seek(0);
    expect(manager.frame).toBe(0);
  });

  test('recalculate updates slides and duration restoring speed', async () => {
    const {manager, scenes} = createManager();
    manager.speed = 3;
    await manager.recalculate();
    expect(manager.duration).toBe(scenes.at(-1)!.lastFrame);
    expect(manager.speed).toBe(3);
    expect(manager.slides).toHaveLength(2);
  });

  test('reset switches back to first scene', async () => {
    const {manager, scenes} = createManager();
    await manager.seek(6);
    await manager.reset();
    expect(manager.currentScene).toBe(scenes[0]);
    expect(manager.frame).toBe(0);
  });

  test('findBestScene selects last cached scene with valid frame', async () => {
    const manager = new PlaybackManager();
    const scenes = [
      new MockScene(manager, 'cached', [0, 2], true),
      new MockScene(manager, 'other', [2, 4], true),
    ];
    manager.setup(scenes as any);
    await manager.seek(3);
    expect(manager.currentScene).toBe(scenes[1]);
  });
});
