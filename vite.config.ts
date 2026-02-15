import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // 1. 기존의 'define' 블록을 통째로 삭제했습니다. 
  // (Vite가 VITE_API_KEY를 자동으로 인식하게 하기 위함)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
