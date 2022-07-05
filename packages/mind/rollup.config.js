import uglify from '@lopatnov/rollup-plugin-uglify'
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
      name: 'badeMind',
      strict: false
    },
    {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'badeMind',
      strict: false
    }
  ],
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    process.argv.includes('-cw') ? undefined : uglify()
  ]
}
