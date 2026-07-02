import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.FRONTEND_PORT || process.env.PORT) || 5173,
    proxy: (() => {
      const target = process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:4000';
      const socketTarget = process.env.VITE_SOCKET_URL || process.env.BACKEND_URL || 'http://localhost:4000';
      return {
        '/api': target,
        '/socket.io': {
          target: socketTarget,
          ws: true,
        },
      };
    })(),
  },
});
