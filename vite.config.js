import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // En dev : le front Vite redirige /api vers le Worker local (wrangler dev :8787)
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
