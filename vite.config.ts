import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tsconfigPaths from 'vite-tsconfig-paths';
import path from "path";



export default defineConfig({
	server:{port:5173},
  plugins: [
    vue(),
    vueDevTools(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      // '@': path.resolve(__dirname,"./src")
  '@': fileURLToPath(new URL('./src', import.meta.url))    
    },
    },
  
})
