import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Production build için explicit değer
  const isProduction = mode === 'production'
  const apiUrl = isProduction ? 'https://app.ehliyet.pro' : 'http://localhost:3002'
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    host: 'localhost',
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
  }
})
