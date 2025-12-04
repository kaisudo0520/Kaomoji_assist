import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import styles from './index.css?inline'

// 1. 建立一個容器 div
const rootId = 'my-kaomoji-extension-root';
let hostElement = document.getElementById(rootId);

if (!hostElement) {
  hostElement = document.createElement('div');
  hostElement.id = rootId;
  // 設定高層級的 z-index 確保它浮在最上層，並且不干擾原本版面
  hostElement.style.position = 'absolute';
  hostElement.style.top = '0';
  hostElement.style.left = '0';
  hostElement.style.zIndex = '2147483647'; // Max z-index
  hostElement.style.pointerEvents = 'none'; // 預設不擋住滑鼠，只有選單出現時才互動
  document.body.appendChild(hostElement);
}

// 2. 建立 Shadow DOM 來隔離樣式
let shadowRoot = hostElement.shadowRoot;
if (!shadowRoot) {
  shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // 3. 將 CSS 注入到 Shadow DOM 中
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // 4. 建立 React 根容器
  const reactRoot = document.createElement('div');
  reactRoot.id = 'react-root';
  shadowRoot.appendChild(reactRoot);
}

// 5. 渲染 React App 到 Shadow DOM 內
const reactRoot = shadowRoot.querySelector('#react-root');
ReactDOM.createRoot(reactRoot).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)