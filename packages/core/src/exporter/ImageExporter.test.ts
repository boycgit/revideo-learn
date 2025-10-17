import {describe, expect, test, vi, beforeEach, afterEach} from 'vitest';
import {ImageExporter} from './ImageExporter';
import type {Project} from '../app/Project';
import type {RendererSettings} from '../app/Renderer';
import type {Logger} from '../app/Logger';
import type {AssetInfo} from '../app';

const makeLogger = (): Logger => ({
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
});

const makeProject = (): Project => ({
  name: 'test-project',
  scenes: [],
  variables: {},
  experimentalFeatures: false,
  logger: makeLogger(),
  plugins: [],
  versions: {
    core: '0.0.0',
    two: null,
    ui: null,
    vitePlugin: null,
  },
  settings: {
    shared: {
      background: null,
      range: [0, 1],
      size: {x: 1920, y: 1080} as any,
    },
    rendering: {
      exporter: {name: ImageExporter.id} as any,
      fps: 30,
      resolutionScale: 1,
      colorSpace: 'srgb',
    },
    preview: {fps: 30, resolutionScale: 1},
  },
});

const settings: RendererSettings = {
  name: 'test-project',
  fps: 30,
  resolutionScale: 1,
  size: {x: 1920, y: 1080} as any,
  range: [0, 1],
  exporter: {
    name: ImageExporter.id,
    options: {
      quality: 80,
      fileType: 'image/png',
      groupByScene: false,
    },
  },
  background: null,
  colorSpace: 'srgb',
};

const makeCanvas = () => {
  const buffer = {
    width: 1920,
    height: 1080,
    toDataURL: vi.fn(() => 'data:image/png;base64,test'),
  } as unknown as HTMLCanvasElement & {
    toDataURL: ReturnType<typeof vi.fn>;
  };
  return buffer;
};

describe('ImageExporter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (global as any).window = {devicePixelRatio: 1};
    (global as any).document = {
      createElement: vi.fn(() => makeCanvas()),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({success: true}),
    } as Response));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('create validates exporter name', async () => {
    const project = makeProject();
    const exporter = await ImageExporter.create(project, settings);
    expect(exporter).toBeInstanceOf(ImageExporter);
  });

  test('handleFrame generates image data for frame', async () => {
    const project = makeProject();
    const exporter = await ImageExporter.create(project, settings);
    await exporter.start();
    const canvas = makeCanvas();
    await exporter.handleFrame(canvas, 1, 0, 'scene', new AbortController().signal);
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png', expect.any(Number));
    expect(project.logger.warn).not.toHaveBeenCalled();
  });

  test('handleFrame warns on duplicate frames', async () => {
    const project = makeProject();
    const exporter = await ImageExporter.create(project, settings);
    await exporter.start();
    const canvas = makeCanvas();
    await exporter.handleFrame(canvas, 2, 1, 'scene', new AbortController().signal);
    await exporter.handleFrame(canvas, 2, 1, 'scene', new AbortController().signal);
    expect(project.logger.warn).toHaveBeenCalledWith('Frame no. 2 is already being exported.');
  });

  test('downloadVideos forwards to server endpoint', async () => {
    const exporter = await ImageExporter.create(makeProject(), settings);
    const assets: AssetInfo[][] = [[{key: 'v', type: 'video', src: 'src', playbackRate: 1, volume: 1, currentTime: 1, duration: 10, decoder: 'ffmpeg'}]];
    await exporter.downloadVideos(assets);
    expect(fetch).toHaveBeenCalledWith('/revideo-ffmpeg-decoder/download-video-chunks', expect.any(Object));
  });
});
