import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PWA PROYECTO ESCUELA',
        short_name: 'PPE',
        description: 'Aplicacion Web Progresiva hecha en la uni xd',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffff',
        theme_color: '#333aa2',
        lang: 'es',
        icons: [
          {
          src: 'images/icons/jugger.png',
          sizes: '128x128',
          type: 'image/png'
      },
      {
          src: 'images/icons/tap.png',
          sizes: '512x512',
          type: 'image/png'
      }
    ]

      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
