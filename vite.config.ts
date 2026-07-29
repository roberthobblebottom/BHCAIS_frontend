import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "path";
import { join } from 'node:path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  server: { port: 5173 },
  plugins: [
    vue(),
    vueDevTools(),
    tsconfigPaths(),
    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
    })
  ],
  resolve: {
    alias: {
      // '@': path.resolve(__dirname,"./src")
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

})
