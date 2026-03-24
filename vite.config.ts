import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': 'http://127.0.0.1:3333',
      '/login': 'http://127.0.0.1:3333',
      '/register': 'http://127.0.0.1:3333',
      '/api': 'http://127.0.0.1:3333',
      '/docs': 'http://127.0.0.1:3333',
      '/openapi.yaml': 'http://127.0.0.1:3333',
    },
  },
})
