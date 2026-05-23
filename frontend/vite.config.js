import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('fflate')) {
              return 'document-utilities';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-core';
            }
            return 'vendor'; // other third-party dependencies
          }
        }
      }
    },
    chunkSizeWarningLimit: 800, // relax warning threshold for robust bundle structure
  }
})
