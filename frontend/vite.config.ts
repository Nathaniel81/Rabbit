// vite.config.ts
import path from "path"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/media': 'http://127.0.0.1:8000',
      // '/image': 'http://127.0.0.1:8000',
        '/image/': {
          target: 'http://res.cloudinary.com/dpzvkmwpb',
          changeOrigin: true,
        },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
