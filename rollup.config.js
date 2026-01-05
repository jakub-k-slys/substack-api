import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

// Read package.json to get dependencies
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const external = [
  // Don't bundle dependencies - they should be installed by consumers
  ...Object.keys(pkg.dependencies || {}),
  // Don't bundle Node.js built-ins
  'fs', 'path', 'util', 'stream', 'events', 'http', 'https', 'url',
  // Handle deep imports from dependencies (e.g., 'fp-ts/function', 'io-ts/PathReporter')
  /^fp-ts\//,
  /^io-ts\//,
  /^axios/
]

export default [
  // JavaScript bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: false
    },
    external,
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // dts plugin handles declarations
        compilerOptions: {
          module: 'ESNext' // Override tsconfig - Rollup needs ES modules as input
        }
      })
    ]
  },
  // TypeScript declarations bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts({ tsconfig: './tsconfig.json' })]
  }
]
