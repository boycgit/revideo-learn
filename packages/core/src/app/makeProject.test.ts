import {describe, expect, test, vi} from 'vitest';
import {Color, Vector2} from '../types';
import {makeProject, addEditorToProject} from './makeProject';
import {getFullPreviewSettings, getFullRenderingSettings} from './project-settings';

vi.mock('/@id/@revideo/2d/editor', () => ({
  default: () => () => 'mock-plugin',
}));

describe('makeProject and settings helpers', () => {
  const baseProject = makeProject({
    name: 'demo',
    scenes: [],
    variables: {count: 1},
    experimentalFeatures: true,
    settings: {
      shared: {
        background: 'FF0000',
        range: [1, 5],
        size: {x: 1280, y: 720},
      },
      rendering: {
        fps: 120,
        resolutionScale: 2,
        exporter: {name: '@revideo/core/image-sequence', options: {format: 'png'}},
        colorSpace: 'display-p3',
      },
      preview: {
        fps: 45,
        resolutionScale: 0.75,
      },
    },
  });

  test('makeProject converts user settings and fills defaults', () => {
    expect(baseProject.name).toBe('demo');
    expect(baseProject.plugins).toEqual([]);
    expect(baseProject.logger).toBeTruthy();
    expect(baseProject.settings.shared.background).toBeInstanceOf(Color);
    expect(baseProject.settings.shared.background.serialize()).toBe(
      'rgba(255, 0, 0, 1.000)',
    );
    expect(baseProject.settings.shared.size).toBeInstanceOf(Vector2);
    expect(baseProject.settings.shared.size.x).toBe(1280);
    expect(baseProject.settings.shared.size.y).toBe(720);
    expect(baseProject.settings.preview.fps).toBe(45);
    expect(baseProject.settings.rendering.fps).toBe(120);
    expect(baseProject.settings.rendering.exporter.name).toBe('@revideo/core/image-sequence');
    expect(baseProject.versions.core).toBe('0.10.4');
  });

  test('project-settings helpers merge shared settings', () => {
    const preview = getFullPreviewSettings(baseProject);
    expect(preview.background).toBe(baseProject.settings.shared.background);
    expect(preview.range).toEqual([1, 5]);
    expect(preview.fps).toBe(45);

    const rendering = getFullRenderingSettings(baseProject);
    expect(rendering.size).toBe(baseProject.settings.shared.size);
    expect(rendering.fps).toBe(120);
    expect(rendering.exporter.name).toBe('@revideo/core/image-sequence');
  });

  test('addEditorToProject appends editor plugin', async () => {
    const withEditor = await addEditorToProject(baseProject);
    const pluginFactory = withEditor.plugins.at(-1) as () => string;
    expect(pluginFactory()).toBe('mock-plugin');
    expect(withEditor.plugins).toHaveLength(baseProject.plugins.length + 1);
  });
});
