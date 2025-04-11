import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'brotliCompress' }), // Keep the working compression
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Keep your working chunk configuration
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
    // These optimizations should be compatible
    target: 'es2015',
    chunkSizeWarningLimit: 500, 
    sourcemap: false,
    minify: 'esbuild',
  },
});