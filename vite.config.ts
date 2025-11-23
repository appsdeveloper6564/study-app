import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env safely. 
      // Vercel puts secrets in process.env, so we expose them explicitly.
      // NOTE: Never expose secrets in CLIENT SIDE code if they are truly secret.
      // For Gemini, the API key is public-facing but restricted by Referrer usually.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      // Fallback for other usages
      'process.env': {}
    },
    build: {
      target: 'esnext'
    }
  };
});