import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        pedido: resolve('pedido.html'),
      },
    },
  },
})
