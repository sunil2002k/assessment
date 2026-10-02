import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The proxy is only for `npm run dev`; in Docker, nginx proxies /api.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
});
