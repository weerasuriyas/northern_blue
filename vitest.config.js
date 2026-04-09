import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    exclude: ['node_modules', '.claude', '.next'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
