import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/products': { target: 'http://localhost:8000', changeOrigin: true },
      '/customers': { target: 'http://localhost:8000', changeOrigin: true },
      '/orders': { target: 'http://localhost:8000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8000', changeOrigin: true },
      '/health': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
