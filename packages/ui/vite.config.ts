import preact from '@preact/preset-vite';
import * as fs from 'fs';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@revideo/ui': '/src/main.tsx',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@revideo/2d/editor': '@revideo/2d/src/editor',
    },
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: 'main',
    },
    rollupOptions: {
      external: [/^@revideo\/core/, /^@?preact/],
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    preact(),
    dts({
      // NOTE: consider enabling it always once api-extractor can generate
      // declaration maps: https://github.com/microsoft/rushstack/issues/1886
      rollupTypes: process.env.CI === 'true',
    }),
    {
      name: 'copy-files',
      async buildStart() {
        this.emitFile({
          type: 'asset',
          fileName: 'editor.html',
          source: await fs.promises.readFile('./editor.html'),
        });
      },
    },
  ],
});
