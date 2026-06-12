import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'es2020',
  outDir: 'dist',
  // fp-ts and io-ts ship no "exports" map, so their deep imports
  // (fp-ts/function, io-ts/PathReporter) break Node ESM resolution when
  // left external. Inline the (tree-shaken) parts we use instead.
  noExternal: ['fp-ts', 'io-ts']
})
