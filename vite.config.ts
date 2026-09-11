import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The app runs Vite in Express middleware mode. The preview proxy does not
      // own Vite's HMR WebSocket, so leave HMR off to avoid failed socket retries.
      hmr: false,
      watch: null,
    },
  };
});
