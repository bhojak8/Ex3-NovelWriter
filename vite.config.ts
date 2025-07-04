import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: true,
    host: 'localhost',
    port: 5173
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})