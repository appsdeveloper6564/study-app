import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for Vercel/Node environments in the browser
    // We must stringify it to prevent "process is not defined" in browser
    'process.env': JSON.stringify(process.env)
  },
  build: {
    target: 'esnext'
  }
});