import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor-vue'; // Separate Vue core libraries
            }
            if (id.includes('echarts')) {
              return 'vendor-echarts'; // Separate ECharts if used
            }
            return 'vendor'; // Put other node_modules into "vendor"
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // Avoid unnecessary warnings
  },
});
