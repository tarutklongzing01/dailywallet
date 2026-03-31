import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('tesseract.js')) {
            return 'ocr';
          }

          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          if (id.includes('firebase')) {
            return 'firebase';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }

          return null;
        },
      },
    },
  },
});
