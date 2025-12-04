import { copyFileSync } from 'fs';

// 建置後將 manifest.json 複製到 dist 目錄
copyFileSync('manifest.json', 'dist/manifest.json');
console.log('✓ manifest.json copied to dist/');
