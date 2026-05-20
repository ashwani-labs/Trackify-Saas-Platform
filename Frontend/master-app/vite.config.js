import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
      include: /master-app[\\/]src[\\/].*\.[jt]sx?$/,
    }),
  ],
  resolve: {
    alias: {
      '@trackify/shared': path.resolve(__dirname, '../packages/trackify-shared/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
});
