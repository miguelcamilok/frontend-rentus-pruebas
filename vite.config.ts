import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    host: '0.0.0.0', // Permite conexiones externas en desarrollo
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0', // CRÍTICO: Railway necesita esto
    port: 4173,
    strictPort: false,
    allowedHosts: true, // Permite todos los hosts (necesario para Railway)
  },
})