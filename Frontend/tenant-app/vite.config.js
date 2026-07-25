import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '../..'),
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@trackify/shared': path.resolve(__dirname, '../packages/trackify-shared/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Source-linked workspace package; pre-bundling caches stale exports.
    exclude: ['@trackify/shared'],
  },
  server: {
    port: 5174,
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
