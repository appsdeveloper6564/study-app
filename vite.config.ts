import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast process to any to avoid property 'cwd' does not exist error
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env safely for client-side usage
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env': JSON.stringify({}), // Fallback for other accesses
      // Polyfill global for libraries that expect it (common cause of Script Error in PDF.js/Ads)
      global: 'window',
    },
    build: {
      target: 'esnext',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
  };
});