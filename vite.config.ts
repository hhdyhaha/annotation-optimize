import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 关键代码
import tailwindcss from  'tailwindcss'
import autoprefixer from 'autoprefixer'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ]
    }
  },
  server:{
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://123.56.15.95:8000',
        changeOrigin: true,
        secure:false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      // 关键代码
      '@': path.resolve(__dirname, './src')
    }
  }
})
