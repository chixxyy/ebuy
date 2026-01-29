import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { intlayerPlugin } from 'vite-intlayer';
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    intlayerPlugin(),
    {
      name: 'force-intlayer-resolution',
      enforce: 'pre',
      resolveId(source) {
        if (source.includes('.intlayer/dictionary/app-content.json')) {
          return fileURLToPath(new URL('./src/manual-dictionary.json', import.meta.url))
        }
      }
    }
  ],
  resolve: {
    alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
