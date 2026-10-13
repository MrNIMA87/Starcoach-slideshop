import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base: './'` keeps the production build portable (can be opened from any sub-path / static host).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: false },
});
