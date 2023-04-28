import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      "@reef-defi/evm-provider": './node_modules/@reef-defi/evm-provider/index.js',
    },
  },
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
  },
});
