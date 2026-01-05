import typescript from '@rollup/plugin-typescript'
import { readFileSync } from 'fs'

// Read package.json to get dependencies
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: false,
    preserveModules: true, // Keep file structure instead of bundling into one file
    preserveModulesRoot: 'src'
  },
  external: [
    // Don't bundle dependencies - they should be installed by consumers
    ...Object.keys(pkg.dependencies || {}),
    // Don't bundle Node.js built-ins
    'fs', 'path', 'util', 'stream', 'events', 'http', 'https', 'url',
    // Handle deep imports from dependencies (e.g., 'fp-ts/function', 'io-ts/PathReporter')
    /^fp-ts\//,
    /^io-ts\//,
    /^axios/
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      compilerOptions: {
        module: 'ESNext' // Override tsconfig - Rollup needs ES modules as input
      }
    })
  ]
}
