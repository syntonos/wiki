import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes dist/ work on GitHub Pages (or any sub-path) with no server config.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // mermaid is big but lazy-loaded (only fetched when a note has a diagram)
  },
})
