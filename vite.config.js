import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'brotliCompress' }), // Enable Brotli Compression
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
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
    chunkSizeWarningLimit: 500, // Adjust chunk size warning
  },
});
