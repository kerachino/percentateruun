import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
});

/*// vite.config.js
export default {
    build: {
      rollupOptions: {
        input: 'src/main.ts', // エントリーポイントのファイルパスに適宜変更
        chunkSizeWarningLimit: 10000, // 警告の閾値を kBに設定
    },
    },
  };
   */