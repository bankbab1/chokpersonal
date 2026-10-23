/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('./web', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: { outDir: fileURLToPath(new URL('./dist', import.meta.url)), emptyOutDir: true },
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves the app under /<repo>/; the Pages workflow sets BASE_PATH. Locally it stays '/'.
  base: process.env.BASE_PATH ?? '/',
  // Listen on every interface so other devices on the LAN can open http://<this-PC-IPv4>:5220
  server: { host: true },
  preview: { host: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    environment: 'jsdom',
    globals: true,
    pool: 'threads',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
