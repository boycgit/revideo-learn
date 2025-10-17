import {describe, expect, test, vi, beforeEach, afterEach} from 'vitest';
import {download} from './download-videos';
import type {AssetInfo} from '../app';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({success: true}),
  } as Response));
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('download', () => {
  test('aggregates video ranges and posts to endpoint', async () => {
    const assets: AssetInfo[][] = [
      [
        {
          key: 'v1',
          type: 'video',
          src: 'video-a.mp4',
          playbackRate: 1,
          volume: 1,
          currentTime: 0,
          duration: 10,
          decoder: 'ffmpeg',
        },
        {
          key: 'a1',
          type: 'audio',
          src: 'audio.mp3',
          playbackRate: 1,
          volume: 1,
          currentTime: 0,
          duration: 5,
        },
      ],
      [
        {
          key: 'v1',
          type: 'video',
          src: 'video-a.mp4',
          playbackRate: 1,
          volume: 1,
          currentTime: 2,
          duration: 10,
          decoder: 'ffmpeg',
        },
      ],
      [
        {
          key: 'v2',
          type: 'video',
          src: 'video-b.mp4',
          playbackRate: 1,
          volume: 1,
          currentTime: 4,
          duration: 8,
          decoder: 'ffmpeg',
        },
      ],
    ];

    await download(assets);

    expect(fetch).toHaveBeenCalledWith(
      '/revideo-ffmpeg-decoder/download-video-chunks',
      expect.objectContaining({method: 'POST'}),
    );

    const call = (fetch as vi.Mock).mock.calls[0][1];
    const payload = JSON.parse(call.body as string);
    expect(payload).toEqual([
      {src: 'video-a.mp4', startTime: 0, endTime: 2},
      {src: 'video-b.mp4', startTime: 4, endTime: 4},
    ]);
  });

  test('throws when response not ok', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ok: false, status: 500} as Response);
    await expect(download([])).rejects.toThrow('HTTP error! status: 500');
  });

  test('throws when server returns error payload', async () => {
    (fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({success: false, error: 'fail'}),
      } as Response);
    await expect(download([])).rejects.toThrow('Error downloading video chunks: fail');
  });
});
