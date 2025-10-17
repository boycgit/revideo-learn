import {beforeEach, afterEach, describe, expect, test, vi} from 'vitest';
import type {Project} from '../app/Project';
import type {RendererSettings} from '../app/Renderer';
import {RendererResult} from '../app/Renderer';
import type {Logger} from '../app/Logger';
import {FFmpegExporterClient} from './FFmpegExporter';
import * as downloadModule from './download-videos';

const downloadMock = vi.fn();
vi.spyOn(downloadModule, 'download').mockImplementation(downloadMock);

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
  name: 'project-name',
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
      exporter: {name: '@revideo/core/ffmpeg'} as any,
      fps: 30,
      resolutionScale: 1,
      colorSpace: 'srgb',
    },
    preview: {fps: 30, resolutionScale: 1},
  },
});

const settings: RendererSettings = {
  name: 'project-name',
  fps: 30,
  resolutionScale: 1,
  size: {x: 1920, y: 1080} as any,
  range: [0, 1],
  exporter: {
    name: '@revideo/core/ffmpeg',
    options: {format: 'mp4'},
  },
  background: null,
  colorSpace: 'srgb',
  hiddenFolderId: 'abc',
};

beforeEach(() => {
  downloadMock.mockReset();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({success: true}),
    }) as Response,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('FFmpegExporterClient', () => {
  test('constructor throws for invalid exporter name', () => {
    expect(
      () =>
        new FFmpegExporterClient({
          ...settings,
          exporter: {name: 'invalid', options: {format: 'mp4'}},
        }),
    ).toThrow('Invalid exporter');
  });

  test('downloadVideos delegates to helper', async () => {
    const exporter = new FFmpegExporterClient(settings);
    const assets: any = [[{type: 'video'}]];
    await exporter.downloadVideos(assets);
    expect(downloadModule.download).toHaveBeenCalledWith(assets);
  });

  test('generateAudio posts audio payload', async () => {
    const exporter = new FFmpegExporterClient(settings);
    await exporter.generateAudio([], 0, 10);
    expect(fetch).toHaveBeenCalledWith(
      '/audio-processing/generate-audio',
      expect.objectContaining({method: 'POST'}),
    );
    const body = JSON.parse((fetch as vi.Mock).mock.calls[0][1].body as string);
    expect(body).toMatchObject({startFrame: 0, endFrame: 10, fps: 30});
  });

  test('mergeMedia posts merge request', async () => {
    const exporter = new FFmpegExporterClient(settings);
    await exporter.mergeMedia();
    expect(fetch).toHaveBeenCalledWith(
      '/audio-processing/merge-media',
      expect.objectContaining({method: 'POST'}),
    );
    const body = JSON.parse((fetch as vi.Mock).mock.calls[0][1].body as string);
    expect(body).toMatchObject({outputFilename: 'project-name', format: 'mp4'});
  });

  test('stop invokes remote end and notifies decoder', async () => {
    const exporter = new FFmpegExporterClient(settings);
    const invokeSpy = vi
      .spyOn(FFmpegExporterClient.prototype as any, 'invoke')
      .mockResolvedValue(undefined);
    await exporter.stop(RendererResult.Success);
    expect(invokeSpy).toHaveBeenCalledWith('end', RendererResult.Success);
    expect(fetch).toHaveBeenCalledWith(
      '/revideo-ffmpeg-decoder/finished',
      expect.objectContaining({method: 'POST'}),
    );
  });

  test('handleFrame throws when canvas cannot produce blob', async () => {
    const exporter = new FFmpegExporterClient(settings);
    vi.spyOn(FFmpegExporterClient.prototype as any, 'invoke').mockResolvedValue(
      undefined,
    );
    const canvas = {
      toBlob: (cb: (blob: Blob | null) => void) => cb(null),
    } as unknown as HTMLCanvasElement;
    await expect(exporter.handleFrame(canvas)).rejects.toThrow(
      'Failed to convert canvas to Blob.',
    );
  });

  test('handleFrame converts blob and sends encoded data', async () => {
    const exporter = new FFmpegExporterClient(settings);
    const invokeSpy = vi
      .spyOn(FFmpegExporterClient.prototype as any, 'invoke')
      .mockResolvedValue(undefined);
    const blob = new Blob(['test'], {type: 'image/png'});
    const canvas = {
      toBlob: (cb: (blob: Blob | null) => void) => cb(blob),
    } as unknown as HTMLCanvasElement;

    class FileReaderStub {
      public result: string | ArrayBuffer | null = null;
      public onloadend: (() => void) | null = null;
      public readAsDataURL(input: Blob) {
        this.result = `data:${input.type};base64,xyz`;
        this.onloadend?.();
      }
      public onerror: (() => void) | null = null;
    }

    vi.stubGlobal('FileReader', FileReaderStub);

    await exporter.handleFrame(canvas);

    expect(invokeSpy).toHaveBeenCalledWith(
      'handleFrame',
      expect.objectContaining({data: expect.stringMatching(/^data:image\/png/)}),
    );
  });
});
