import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/lib/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      generatedCode: 'es2015',
      minifyInternalExports: false,
      compact: false,
    },
    plugins: [
      {
        resolveId(id) {
          if (id.startsWith('@revideo/core')) {
            return {
              id: '@revideo/core',
              external: true,
            };
          }
        },
      },
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './src/lib/tsconfig.json',
        compilerOptions: {
          composite: false,
          removeComments: false,
          pretty: true,
        },
      }),
    ],
  },
];
