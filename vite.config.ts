import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Console uyarılarını gizle
    'console.warn': 'console.log',
  },
  server: {
    // Geliştirme sunucusu ayarları
    port: 3000,
    open: true,
  },
})
