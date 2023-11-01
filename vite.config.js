import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/socket.io': {
        target: 'https://wed-socketbackend.juanflow04flore.repl.co',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    }
  }
})
