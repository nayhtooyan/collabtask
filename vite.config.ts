import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all environment variables from .env files
  const env = loadEnv(mode, process.cwd());

  // Optional: log to verify they are loaded
  console.log('Loaded Vite env:', env);

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // You do NOT need 'define' for Firebase environment variables.
    // Vite automatically exposes all VITE_* variables via import.meta.env
  };
});
