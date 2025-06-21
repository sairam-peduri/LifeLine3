import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost", // 👈 ensures it runs at localhost
    port: 5174         // 👈 match this with Flask CORS origin
  }
})
