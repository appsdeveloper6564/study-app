import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for Vercel/Node environments in the browser
    'process.env': process.env
  },
  build: {
    target: 'esnext'
  }
});