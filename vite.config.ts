import path from "path";
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from "./package.json";

const getPackageName = () => {
  return packageJson.name.split('/')[1];
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `${getPackageName()}.mjs`,
  cjs: `${getPackageName()}.cjs`,
  iife: `${getPackageName()}.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

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
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats,
      fileName: (format) => fileName[format],
    },
  },
});
