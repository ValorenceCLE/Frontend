import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer'; // Add this import

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'brotliCompress' }),
    visualizer({
      filename: 'dist/stats.html',
      open: true, // This will automatically open the visualization after build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Keep your existing build configuration
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue")) {
              return "vendor-vue";
            }
            if (id.includes("echarts")) {
              return "vendor-echarts";
            }
            return "vendor";
          }
        },
      },
    },
    target: 'es2015',
    chunkSizeWarningLimit: 500, 
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});