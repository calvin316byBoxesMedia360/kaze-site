import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../kaze-site-local/wrapstudio'),
    emptyOutDir: true,
  },
  preview: {
    allowedHosts: true,
  },
})
