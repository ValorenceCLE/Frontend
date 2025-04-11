import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    // Enable both Brotli and Gzip compression for broader browser support
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Target for browser compatibility
    target: 'es2015',
    // Optimize chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log and debugger statements in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Improved chunking strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Group key framework libraries
          'vendor-core': ['vue', 'vue-router', 'pinia'],
          // Separate chart libraries which are large
          'vendor-charts': ['echarts', 'vue-echarts'],
          // Auth-related libraries
          'vendor-auth': ['jwt-decode', 'axios'],
          // UI components
          'vendor-ui': [
            '@heroicons/vue',
            /tailwind/
          ],
          // All other dependencies
          'vendor-misc': [id => {
            return id.includes('node_modules') && 
              !id.includes('vue') && 
              !id.includes('echarts') && 
              !id.includes('jwt-decode') && 
              !id.includes('axios') && 
              !id.includes('@heroicons') && 
              !id.includes('tailwind');
          }]
        },
        // Optimize asset filenames for better caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
    },
    // Source maps in production - disabled for security and performance
    sourcemap: false,
  },
});