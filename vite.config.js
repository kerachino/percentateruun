// vite.config.js
export default {
    build: {
      rollupOptions: {
            input: 'src/index.ts', // エントリーポイントのファイルパスに適宜変更
        },
        chunkSizeWarningLimit: 10000, // 警告の閾値を kBに設定
    },
  };
  