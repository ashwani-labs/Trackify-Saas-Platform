import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
      include: /tenant-app[\\/]src[\\/].*\.[jt]sx?$/,
    }),
  ],
  resolve: {
    alias: {
      '@trackify/shared': path.resolve(__dirname, '../packages/trackify-shared/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['@trackify/shared'],
  },
  server: {
    port: 5174,
    host: true, // Listen on all network interfaces
    allowedHosts: true, // Allow any hostname (e.g., techno.trackify.com)
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
