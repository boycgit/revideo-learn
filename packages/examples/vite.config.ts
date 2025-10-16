import preact from '@preact/preset-vite';
import motionCanvas from '@revideo/vite-plugin';
import {defineConfig} from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@revideo/ui',
        replacement: '@revideo/ui/src/main.tsx',
      },
      {
        find: '@revideo/2d/editor',
        replacement: '@revideo/2d/src/editor',
      },
      {
        find: /@revideo\/2d(\/lib)?/,
        replacement: '@revideo/2d/src/lib',
      },
      {find: '@revideo/core', replacement: '@revideo/core/src'},
    ],
  },
  plugins: [
    preact({
      include: [
        /packages\/ui\/src\/(.*)\.tsx?$/,
        /packages\/2d\/src\/editor\/(.*)\.tsx?$/,
      ],
    }),
    motionCanvas({
      project: [
        './src/quickstart.ts',
        './src/tex.ts',
        './src/tweening-linear.ts',
        './src/tweening-cubic.ts',
        './src/tweening-color.ts',
        './src/tweening-vector.ts',
        './src/tweening-visualiser.ts',
        './src/node-signal.ts',
        './src/code-block.ts',
        './src/layout.ts',
        './src/layout-group.ts',
        './src/positioning.ts',
        './src/media-image.ts',
        './src/media-video.ts',
        './src/components.ts',
        './src/logging.ts',
        './src/transitions.ts',
        './src/tweening-spring.ts',
        './src/tweening-save-restore.ts',
        './src/presentation.ts',
        './src/euclidean-algorithm.ts',
        './src/quick-sort.ts',
      ],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        dir: '../docs/static/examples',
        entryFileNames: '[name].js',
      },
    },
  },
});
