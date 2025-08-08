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
  build: {
    // Build optimizasyonları
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk'ları ayır
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Firebase chunk'ı ayır
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          // PDF chunk'ı ayır
          pdf: ['jspdf', 'html2canvas']
        }
      }
    },
    // Chunk boyutu uyarı limitini artır
    chunkSizeWarningLimit: 1000,
    // Source map'leri production'da kapat
    sourcemap: false
  },
  // Mobil optimizasyonları
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
