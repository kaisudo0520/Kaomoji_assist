import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 輸出目錄設為 dist，這是 Chrome 擴充功能讀取的資料夾
    outDir: 'dist',
    // 禁用 CSS 程式碼分割,確保 CSS 內聯到 JS 中
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/main.jsx'),
        background: resolve(__dirname, 'src/background.js')
      },
      output: {
        // 讓輸出的檔名固定，方便 manifest.json 引用
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/index.js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})