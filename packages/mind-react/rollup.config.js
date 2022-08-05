import * as reactDom from 'react-dom'

import uglify from '@lopatnov/rollup-plugin-uglify'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  input: './index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
      strict: false
    },
    {
      file: 'lib/index.module.js',
      format: 'es',
      strict: false
    },
    {
      file: 'lib/index.min.js',
      format: 'iife',
      // sourcemap: !production,
      name: 'mindReact',
      strict: false
    },
    {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'mindReact',
      strict: false
    }
  ],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    postcss({
      modules: true,
      use: ['sass']
    }),
    commonjs(),
    process.argv.includes('-cw') ? undefined : uglify()
  ]
}
