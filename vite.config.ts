import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        home: resolve('home.html'),
        login: resolve('login.html'),
        register: resolve('register.html'),
        pedido: resolve('pedido.html'),
      },
    },
  },
  server: {
    proxy: {
      '/user': 'http://localhost:8787',
    },
  },
})
