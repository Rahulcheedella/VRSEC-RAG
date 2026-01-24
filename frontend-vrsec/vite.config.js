// vite.config.js   (or vite.config.ts)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // All requests starting with /chat go to Flask
      '/chat': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // secure: false,          // uncomment only if you get SSL errors (rare)
      },
      // Optional: also proxy /health if you use it
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})