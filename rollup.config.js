/* eslint-disable filenames/match-exported, sort-keys */
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import {sizeSnapshot} from 'rollup-plugin-size-snapshot';
import sourcemaps from 'rollup-plugin-sourcemaps';
import pkg from './package.json';

// eslint-disable-next-line no-process-env
const production = process.env.NODE_ENV === 'production';

const plugins = [
  sourcemaps(),
  babel({
    babelHelpers: 'runtime',
    exclude: ['../../node_modules/**', 'node_modules/**']
  }),
  commonjs(),
  sizeSnapshot()
];

// NOTE: don't include external dependencies into esm/cjm bundles
const external = (id) => !id.startsWith('.') && !path.isAbsolute(id);

// NOTE: see https://github.com/rollup/rollup/issues/408 to understand why we silences `THIS_IS_UNDEFINED` warnings
const onwarn = (warning, warn) => {
  if (warning.code === 'THIS_IS_UNDEFINED') {
    return;
  }
  warn(warning);
};

const config = [
  {
    input: './src/index.js',
    onwarn,
    output: {
      sourcemap: true,
      name: pkg.name,
      file: pkg.unpkg,
      format: 'umd'
    },
    plugins: [resolve(), ...plugins, production && terser()]
  },
  {
    input: './src/index.js',
    onwarn,
    output: {
      sourcemap: true,
      file: pkg.module,
      format: 'es'
    },
    plugins,
    external
  },
  {
    input: './src/index.js',
    onwarn,
    output: {
      sourcemap: true,
      file: pkg.main,
      format: 'cjs'
    },
    plugins,
    external
  }
];

export default config;
