import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { notesApiPlugin } from './src/vite-plugin-api'

export default defineConfig({
  plugins: [react(), notesApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@versions': path.resolve(__dirname, './versions'),
    },
  },
})
