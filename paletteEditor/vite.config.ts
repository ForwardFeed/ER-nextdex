import { fileURLToPath, URL } from 'node:url'

import { defineConfig, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { join } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build:{
    outDir: fileURLToPath(new URL('../static/palette_editor/', import.meta.url)),
  },
  base: './',
  server: {
    proxy: {
      '/sprites': {
        target: "http://localhost:5173/",
        changeOrigin: true,
        rewrite: (path) => join('../static', path)
      }
    },
    fs:{
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        './static/sprites/'
      ]
    }
  }
})
