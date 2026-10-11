import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build:{
    outDir: fileURLToPath(new URL('../static/er-changelog/', import.meta.url)),
  },
  base: './',
})
