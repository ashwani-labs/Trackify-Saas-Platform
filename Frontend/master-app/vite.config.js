import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '../..'),
  // Vitest can emit classic JSX unless this is set (plugin-react oxc defaults are skipped).
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@trackify/shared': path.resolve(__dirname, '../packages/trackify-shared/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@trackify/shared'],
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    server: {
      deps: {
        inline: ['@trackify/shared'],
      },
    },
  },
});
