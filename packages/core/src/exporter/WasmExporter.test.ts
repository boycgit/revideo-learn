import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import type {Project} from '../app/Project';
import type {RendererSettings} from '../app/Renderer';
import type {Logger} from '../app/Logger';
import {WasmExporter} from './WasmExporter';
import * as downloadModule from './download-videos';

const downloadSpy = vi
  .spyOn(downloadModule, 'download')
  .mockResolvedValue(undefined);

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
  name: 'project',
  scenes: [],
  variables: {},
  experimentalFeatures: false,
  logger: makeLogger(),
  plugins: [],
  versions: {core: '0.0.0', two: null, ui: null, vitePlugin: null},
  settings: {
    shared: {
      background: null,
      range: [0, 1],
      size: {x: 1920, y: 1080} as any,
    },
    rendering: {
      exporter: {name: '@revideo/core/wasm'} as any,
      fps: 30,
      resolutionScale: 1,
      colorSpace: 'srgb',
    },
    preview: {fps: 30, resolutionScale: 1},
  },
});

const settings: RendererSettings = {
  name: 'project',
  fps: 30,
  resolutionScale: 1,
  size: {x: 1920, y: 1080} as any,
  range: [0, 1],
  exporter: {
    name: '@revideo/core/wasm',
  },
  background: null,
  colorSpace: 'srgb',
  hiddenFolderId: '123',
};

const encoderMock = {
  addFrame: vi.fn(),
  end: vi.fn(async () => new ArrayBuffer(8)),
};

const encoderFactory = vi.fn(() => encoderMock);

beforeEach(() => {
  downloadSpy.mockClear();
  encoderFactory.mockClear();
  encoderMock.addFrame.mockClear();
  encoderMock.end.mockClear();

  const fetchMock = vi.fn<globalThis.FetchType>().mockImplementation(
    async (url: RequestInfo | URL) => {
      if (typeof url === 'string' && url.includes('download-video-chunks')) {
        return {
          ok: true,
          json: async () => ({success: true}),
        } as Response;
      }

      if (typeof url === 'string' && url === '/@mp4-wasm') {
        return {
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(8),
          json: async () => ({success: true}),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({success: true}),
      } as Response;
    },
  );

  vi.stubGlobal('fetch', fetchMock);

  class VideoFrameStub {
    public constructor(_canvas: HTMLCanvasElement, _options: any) {}
    public close() {}
  }

  vi.stubGlobal('VideoFrame', VideoFrameStub as any);

  vi.mock('mp4-wasm', () => ({
    default: vi.fn(async () => ({createWebCodecsEncoder: encoderFactory})),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const makeCanvas = () => ({
  width: 1920,
  height: 1080,
} as unknown as HTMLCanvasElement);

describe('WasmExporter', () => {
  test('start loads wasm and creates encoder', async () => {
    const exporter = await WasmExporter.create(makeProject(), settings);
    await exporter.start();
    expect(fetch).toHaveBeenCalledWith('/@mp4-wasm');
    expect(encoderFactory).toHaveBeenCalledWith({
      width: settings.size.x,
      height: settings.size.y,
      fps: makeProject().settings.rendering.fps,
    });
  });

  test('handleFrame delegates to encoder', async () => {
    const exporter = await WasmExporter.create(makeProject(), settings);
    await exporter.start();
    await exporter.handleFrame(makeCanvas());
    expect(encoderMock.addFrame).toHaveBeenCalled();
  });

  test('stop uploads encoded buffer and notifies decoder', async () => {
    encoderMock.end.mockResolvedValueOnce(new Uint8Array([1, 2, 3]).buffer);
    const exporter = await WasmExporter.create(makeProject(), settings);
    await exporter.start();
    await exporter.stop();
    expect(fetch).toHaveBeenCalledWith('/revideo-ffmpeg-decoder/finished', expect.objectContaining({method: 'POST'}));
    expect(fetch).toHaveBeenCalledWith('/uploadVideoFile', expect.objectContaining({method: 'POST'}));
  });

  test('generateAudio posts audio payload', async () => {
    const exporter = await WasmExporter.create(makeProject(), settings);
    await exporter.generateAudio([], 0, 10);
    expect(fetch).toHaveBeenCalledWith('/audio-processing/generate-audio', expect.objectContaining({method: 'POST'}));
  });

  test('mergeMedia posts merge request', async () => {
    const exporter = await WasmExporter.create(makeProject(), settings);
    await exporter.mergeMedia();
    expect(fetch).toHaveBeenCalledWith('/audio-processing/merge-media', expect.objectContaining({method: 'POST'}));
  });

  test('downloadVideos delegates to helper', async () => {
    const exporter = await WasmExporter.create(makeProject(), settings);
    const assets: any = [[{type: 'video'}]];
    await exporter.downloadVideos(assets);
    expect(downloadModule.download).toHaveBeenCalledWith(assets);
  });
});
