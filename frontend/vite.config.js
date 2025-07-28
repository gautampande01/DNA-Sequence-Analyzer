import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  base: '/DNA-Sequence-Analyzer/',
  build: {
    outDir: 'dist',
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})  
