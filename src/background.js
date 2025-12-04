// 建立右鍵選單項目
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'kaomoji-helper',
    title: '顏文字助手',
    contexts: ['editable']  // 只在可編輯區域顯示
  });
});

// 監聽右鍵選單項目的點擊事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'kaomoji-helper') {
    // 向當前分頁的 content script 發送消息，要求開啟顏文字助手
    chrome.tabs.sendMessage(tab.id, { action: 'openKaomojiHelper' });
  }
});

// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadFile') {
    // 使用 chrome.downloads API 下載檔案
    chrome.downloads.download({
      url: request.dataUrl,
      filename: request.filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download error:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    return true; // 保持消息通道開啟以便異步回應
  }
});
