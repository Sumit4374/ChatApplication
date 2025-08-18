import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@stomp/stompjs', 'sockjs-client'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy SockJS/STOMP endpoint as same-origin to avoid browser CORS
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        // don't rewrite, SockJS uses relative paths under /ws
      },
    },
  },
})
