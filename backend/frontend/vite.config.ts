import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/image': 'http://res.cloudinary.com/dpzvkmwpb',
      '/api': 'http://127.0.0.1:8000'
    }
  }
})
// http://res.cloudinary.com/dpzvkmwpb/image/upload/v1709720868/shps2g9udkkjncoghedc.jpg