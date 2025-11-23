import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env safely. 
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      // Fallback for other usages
      'process.env': {},
      // Polyfill global for libraries that expect it (common cause of Script Error)
      global: 'window',
    },
    build: {
      target: 'esnext'
    }
  };
});