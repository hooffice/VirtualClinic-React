import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'Components': path.resolve(__dirname, './src/Components'),
      'slices': path.resolve(__dirname, './src/slices'),
      'pages': path.resolve(__dirname, './src/pages'),
      'helpers': path.resolve(__dirname, './src/helpers'),
      'assets': path.resolve(__dirname, './src/assets'),
      'common': path.resolve(__dirname, './src/common'),
      'config': path.resolve(__dirname, './src/config'),
      'store': path.resolve(__dirname, './src/store'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit', 'redux'],
        },
      },
    },
  },
})
