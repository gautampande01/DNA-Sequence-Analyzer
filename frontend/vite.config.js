import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    
    base: isProduction ? '/DNA-Sequence-Analyzer/' : '/',
    
    build: {
      outDir: 'dist',
    },
    
    server: {
      port: 5173,
      host: true,
      open: true,
      watch: {
        usePolling: true
      }
    },
    
    preview: {
      port: 4173,
      host: true
    }
  }
})