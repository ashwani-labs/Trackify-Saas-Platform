import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 5174,
    host: true, // Listen on all network interfaces
    allowedHosts: true // Allow any hostname (e.g., techno.trackify.com)
  }
})
