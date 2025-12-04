import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, X, Smile, Frown, Angry, Laugh, MoreHorizontal,
  Settings, Edit2, Check, Star, Clock, ArrowUp, ArrowDown, Download, Upload
} from 'lucide-react';

// 語言字典 (與之前相同，省略重複部分以節省空間，邏輯不變)
const translations = {
  'zh-TW': {
    title: '顏文字助手', // 標題簡化
    selectKaomoji: '選擇顏文字',
    manageCategories: '管理分類',
    settings: '設定',
    addCategoryLabel: '新增分類',
    addCategoryPlaceholder: '分類名稱',
    add: '新增',
    existingCategories: '現有分類',
    emptyCategory: '此分類目前沒有顏文字',
    emptyRecent: '這裡會顯示最近使用',
    addTo: '新增到',
    systemDefault: '系統預設',
    alertDuplicate: '分類名稱已存在',
    alertMinOne: '至少要保留一個分類',
    alertDeleteConfirm: '確定要刪除此分類及其所有顏文字嗎？',
    confirmDelete: '刪除',
    exportData: '匯出資料',
    importData: '匯入資料',
    backupRestore: '備份與還原',
    exportSuccess: '資料已成功匯出！',
    importSuccess: '資料已成功匯入！',
    importError: '匯入失敗：檔案格式不正確',
    importConfirm: '匯入資料會覆蓋目前所有設定，確定要繼續嗎？',
    '喜': '喜', '怒': '怒', '哀': '哀', '樂': '樂', '其他': '其他',
    '最近使用': '最近使用', '我的最愛': '我的最愛'
  },
  'en': {
    title: 'Kaomoji Helper',
    selectKaomoji: 'Select Kaomoji',
    manageCategories: 'Manage Categories',
    settings: 'Settings',
    addCategoryLabel: 'Add Category',
    addCategoryPlaceholder: 'Category Name',
    add: 'Add',
    existingCategories: 'Existing Categories',
    emptyCategory: 'No kaomoji here yet',
    emptyRecent: 'Recents appear here',
    addTo: 'Add to',
    systemDefault: 'System Default',
    alertDuplicate: 'Category name already exists',
    alertMinOne: 'Must keep at least one category',
    alertDeleteConfirm: 'Delete this category?',
    confirmDelete: 'Delete',
    exportData: 'Export Data',
    importData: 'Import Data',
    backupRestore: 'Backup & Restore',
    exportSuccess: 'Data exported successfully!',
    importSuccess: 'Data imported successfully!',
    importError: 'Import failed: Invalid file format',
    importConfirm: 'Importing will overwrite all current settings. Continue?',
    '喜': 'Joy', '怒': 'Anger', '哀': 'Sadness', '樂': 'Fun', '其他': 'Others',
    '最近使用': 'Recent', '我的最愛': 'Favorites'
  }
};

const App = () => {
  const RECENT_KEY = '最近使用';
  const FAV_KEY = '我的最愛';

  const defaultCategories = {
    [RECENT_KEY]: [],
    [FAV_KEY]: ['(⁠•⁠‿⁠•⁠)', '(⁠≧⁠▽⁠≦⁠)'],
    喜: ['(⁠•⁠‿⁠•⁠)', '(⁠^⁠‿⁠^⁠)', '(⁠≧⁠▽⁠≦⁠)', '(*^▽^*)', '(o^∀^o)'],
    怒: ['(⁠╬⁠☉⁠д⁠⊙⁠)⊰', '(⁠ノ⁠ಠ⁠益⁠ಠ⁠)⁠ノ', '(╬ Ò ‸ Ó)', 'ヽ(｀Д´)ﾉ', '(＃`Д´)'],
    哀: ['(⁠ ⁠；⁠∀⁠；⁠)', '(⁠´⁠;⁠︵⁠;⁠`⁠)', '(╥_╥)', '(T_T)', '(;´༎ຶД༎ຶ`)'],
    樂: ['(⁠~⁠‾⁠▿⁠‾⁠)⁠~', '♪⁠～⁠(⁠´⁠ε⁠｀⁠ ⁠)', '└( ＾ω＾ )」', '(*￣0￣)θ～♪', 'ᕕ( ᐛ )ᕗ'],
    其他: ['(・_・)', '(O_O)', '(._.)', '(;´Д`)', '(･ω･)b']
  };

  // 檢查 extension context 是否有效
  const isExtensionContextValid = () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
      }
      // 嘗試訪問 chrome.runtime.id 來檢查 context 是否有效
      return !!chrome.runtime.id;
    } catch (error) {
      console.warn('Extension context invalidated:', error);
      return false;
    }
  };

  // --- 狀態管理 ---
  const [categories, setCategories] = useState(defaultCategories);
  const [menuPosition, setMenuPosition] = useState(null); 
  const [activeTab, setActiveTab] = useState('喜'); 
  const [newItem, setNewItem] = useState('');
  const [lang, setLang] = useState('zh-TW');

  // 設定相關狀態
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); 
  const [editValue, setEditValue] = useState(''); 

  // 紀錄最後一個被右鍵點擊的目標元素
  const targetElementRef = useRef(null);
  const menuRef = useRef(null);

  // 拖動相關狀態
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 儲存上次的選單位置
  const [lastMenuPosition, setLastMenuPosition] = useState(null);

  // 分類標籤拖動排序相關狀態
  const [categoryOrder, setCategoryOrder] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // --- 初始化與儲存 ---
  useEffect(() => {
    // 1. 偵測語言
    const browserLang = navigator.language || navigator.userLanguage;
    setLang(browserLang.toLowerCase().includes('zh') ? 'zh-TW' : 'en');

    // 2. 從 Chrome Storage 讀取資料
    if (isExtensionContextValid() && chrome.storage) {
      try {
        chrome.storage.local.get(['myKaomojiData_v2', 'categoryOrder_v2', 'lastMenuPosition_v2'], (result) => {
          // 檢查是否有錯誤
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage get error:', chrome.runtime.lastError);
            return;
          }

          if (result.myKaomojiData_v2) {
            let parsedData = result.myKaomojiData_v2; // Chrome storage 自動處理 JSON
            if (!parsedData[RECENT_KEY]) parsedData[RECENT_KEY] = [];
            if (!parsedData[FAV_KEY]) parsedData[FAV_KEY] = [];
            setCategories(parsedData);
          } else {
            setActiveTab(FAV_KEY);
          }
          // 載入自訂分類順序
          if (result.categoryOrder_v2) {
            setCategoryOrder(result.categoryOrder_v2);
          }
          // 載入上次的選單位置
          if (result.lastMenuPosition_v2) {
            setLastMenuPosition(result.lastMenuPosition_v2);
          }
        });
      } catch (error) {
        console.warn('Failed to read from chrome storage:', error);
      }
    }
  }, []);

  // 當 categories 改變時，存入 Chrome Storage
  useEffect(() => {
    if (isExtensionContextValid() && chrome.storage) {
      try {
        chrome.storage.local.set({ 'myKaomojiData_v2': categories }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage set error:', chrome.runtime.lastError);
          }
        });
      } catch (error) {
        console.warn('Failed to write categories to chrome storage:', error);
      }
    }
  }, [categories]);

  // 當 categoryOrder 改變時，存入 Chrome Storage
  useEffect(() => {
    if (categoryOrder && isExtensionContextValid() && chrome.storage) {
      try {
        chrome.storage.local.set({ 'categoryOrder_v2': categoryOrder }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage set error:', chrome.runtime.lastError);
          }
        });
      } catch (error) {
        console.warn('Failed to write categoryOrder to chrome storage:', error);
      }
    }
  }, [categoryOrder]);

  // 當 menuPosition 改變時，保存到 lastMenuPosition 和 Chrome Storage
  useEffect(() => {
    if (menuPosition && isExtensionContextValid() && chrome.storage) {
      setLastMenuPosition(menuPosition);
      try {
        chrome.storage.local.set({ 'lastMenuPosition_v2': menuPosition }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage set error:', chrome.runtime.lastError);
          }
        });
      } catch (error) {
        console.warn('Failed to write menuPosition to chrome storage:', error);
      }
    }
  }, [menuPosition]);

  // --- 監聽來自 background script 的消息 ---
  useEffect(() => {
    const handleMessage = (request, sender, sendResponse) => {
      if (request.action === 'openKaomojiHelper') {
        // 獲取當前焦點的元素
        const target = document.activeElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (isInput) {
          targetElementRef.current = target;

          // 優先使用上次的位置，否則計算新位置
          if (lastMenuPosition) {
            setMenuPosition(lastMenuPosition);
          } else {
            // 計算位置並開啟助手
            const rect = target.getBoundingClientRect();
            const menuWidth = 320;
            const menuHeight = 400;
            const padding = 8;

            let x = rect.right + padding + window.scrollX;
            let y = rect.top + window.scrollY;

            if (x + menuWidth > window.innerWidth + window.scrollX) {
              x = rect.left - menuWidth - padding + window.scrollX;
            }
            if (x < window.scrollX) {
              x = rect.left + padding + window.scrollX;
            }
            if (y + menuHeight > window.innerHeight + window.scrollY) {
              y = Math.max(window.scrollY + padding, rect.bottom - menuHeight + window.scrollY);
            }
            y = Math.max(window.scrollY + padding, y);

            setMenuPosition({ x, y });
          }
        }
      }
    };

    if (isExtensionContextValid() && chrome.runtime.onMessage) {
      try {
        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
          try {
            chrome.runtime.onMessage.removeListener(handleMessage);
          } catch (error) {
            // 忽略清理時的錯誤
            console.warn('Failed to remove message listener:', error);
          }
        };
      } catch (error) {
        console.warn('Failed to add message listener:', error);
      }
    }
  }, [lastMenuPosition]);

  // --- 事件監聽：全域右鍵 ---
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // 只有按住 Shift 鍵時，才開啟顏文字助手
      if (!e.shiftKey) return;

      // 檢查是否點擊在可輸入的區域 (Input, Textarea, ContentEditable)
      // 如果你希望在「任何地方」都跳出來，可以把這個檢查拿掉
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInput) {
        e.preventDefault(); // 阻止預設選單
        targetElementRef.current = target; // 記住這個目標

        // 優先使用上次的位置，否則計算新位置
        if (lastMenuPosition) {
          setMenuPosition(lastMenuPosition);
        } else {
          // 計算輸入框的位置
          const rect = target.getBoundingClientRect();
          const menuWidth = 320; // 選單寬度 (w-80 = 320px)
          const menuHeight = 400; // 選單最大高度
          const padding = 8; // 與輸入框的間距

          let x, y;

          // 優先顯示在輸入框右上方
          x = rect.right + padding + window.scrollX;
          y = rect.top + window.scrollY;

          // 如果右邊空間不夠，顯示在左邊
          if (x + menuWidth > window.innerWidth + window.scrollX) {
            x = rect.left - menuWidth - padding + window.scrollX;
          }

          // 如果左邊也不夠，就顯示在輸入框內部右側
          if (x < window.scrollX) {
            x = rect.left + padding + window.scrollX;
          }

          // 檢查下方空間，如果不夠則向上顯示
          if (y + menuHeight > window.innerHeight + window.scrollY) {
            y = Math.max(window.scrollY + padding, rect.bottom - menuHeight + window.scrollY);
          }

          // 確保不超出上邊界
          y = Math.max(window.scrollY + padding, y);

          setMenuPosition({ x, y });
        }
      }
    };

    // 移除點擊外部關閉選單的邏輯,改為只能透過 X 按鈕手動關閉
    // 這樣方便使用者連續插入多個顏文字而不會被意外關閉

    document.addEventListener('contextmenu', handleGlobalContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [lastMenuPosition]);

  // --- 拖動功能 ---
  const handleDragStart = (e) => {
    // 只有在標頭區域才能拖動
    if (!e.target.closest('.drag-handle')) return;

    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - menuPosition.x,
      y: e.clientY - menuPosition.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      setMenuPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, menuPosition]);

  // --- 核心功能：插入文字到網頁 ---
  const insertAtCursor = (text) => {
    const target = targetElementRef.current;
    if (!target) {
      // 如果沒有目標，嘗試複製到剪貼簿
      navigator.clipboard.writeText(text).then(() => alert('已複製到剪貼簿！'));
      return;
    }

    target.focus();

    // 情況 1: 標準 Input 或 Textarea
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      
      // 插入文字
      target.value = val.slice(0, start) + text + val.slice(end);
      
      // 還原游標位置
      target.selectionStart = target.selectionEnd = start + text.length;
      
      // 觸發 Input 事件 (這很重要，否則 React/Vue寫的網頁可能偵測不到值改變)
      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
    } 
    // 情況 2: ContentEditable (例如 Gmail, Facebook)
    else if (target.isContentEditable) {
      // 這是比較舊但相容性最好的方法
      document.execCommand('insertText', false, text);
    }
  };

  // --- 以下邏輯與原本大致相同 ---
  const t = (key) => translations[lang][key] || key;
  const getCategoryDisplayName = (catKey) => translations[lang][catKey] || catKey;

  const getSortedCategories = () => {
    const keys = Object.keys(categories);

    // 如果有自訂順序，使用自訂順序
    if (categoryOrder) {
      // 過濾出仍然存在的分類，並加上新增的分類
      const existingOrdered = categoryOrder.filter(k => keys.includes(k));
      const newKeys = keys.filter(k => !categoryOrder.includes(k));
      return [...existingOrdered, ...newKeys];
    }

    // 否則使用預設順序
    const specialKeys = [RECENT_KEY, FAV_KEY];
    const predefinedOrder = ['喜', '怒', '哀', '樂', '其他'];
    const customKeys = keys.filter(k => !specialKeys.includes(k) && !predefinedOrder.includes(k));
    const orderedPredefined = predefinedOrder.filter(k => keys.includes(k));
    return [...specialKeys.filter(k => keys.includes(k)), ...orderedPredefined, ...customKeys];
  };

  const insertKaomoji = (kaomoji) => {
    // 1. 執行插入
    insertAtCursor(kaomoji);

    // 2. 更新最近使用
    setCategories(prev => {
        const currentRecents = prev[RECENT_KEY] || [];
        const newRecents = [kaomoji, ...currentRecents.filter(k => k !== kaomoji)].slice(0, 10);
        return { ...prev, [RECENT_KEY]: newRecents };
    });

    // 3. 不再自動關閉選單，讓使用者可以連續插入多個顏文字
    // setMenuPosition(null);
  };

  const toggleFavorite = (e, kaomoji) => {
    e.stopPropagation();
    const favList = categories[FAV_KEY] || [];
    const isFav = favList.includes(kaomoji);
    let newFavList = isFav ? favList.filter(item => item !== kaomoji) : [...favList, kaomoji];
    setCategories({ ...categories, [FAV_KEY]: newFavList });
  };

  const moveItem = (e, index, direction) => {
    e.stopPropagation();
    const currentList = [...categories[activeTab]];
    if (direction === 'up' && index > 0) {
        [currentList[index], currentList[index - 1]] = [currentList[index - 1], currentList[index]];
    } else if (direction === 'down' && index < currentList.length - 1) {
        [currentList[index], currentList[index + 1]] = [currentList[index + 1], currentList[index]];
    }
    setCategories({ ...categories, [activeTab]: currentList });
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const updatedCategories = {
      ...categories,
      [activeTab]: [...categories[activeTab], newItem]
    };
    setCategories(updatedCategories);
    setNewItem('');
  };

  const handleDeleteItem = (e, indexToDelete) => {
    e.stopPropagation();
    const updatedList = categories[activeTab].filter((_, index) => index !== indexToDelete);
    setCategories({ ...categories, [activeTab]: updatedList });
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories[name]) { alert(t('alertDuplicate')); return; }
    setCategories({ ...categories, [name]: [] });
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catName) => {
    if (catName === RECENT_KEY || catName === FAV_KEY) {
        alert(t('systemDefault') + ' ' + t('confirmDelete'));
        return;
    }
    if (confirm(`${t('alertDeleteConfirm')} (${getCategoryDisplayName(catName)})`)) {
      const newCategories = { ...categories };
      delete newCategories[catName];
      setCategories(newCategories);
    }
  };

  const startEditing = (catName) => {
    if (catName === RECENT_KEY || catName === FAV_KEY) return;
    setEditingCategory(catName);
    setEditValue(catName);
  };

  const saveCategoryName = (oldName) => {
    const newName = editValue.trim();
    if (!newName || newName === oldName) { setEditingCategory(null); return; }
    if (categories[newName]) { alert(t('alertDuplicate')); return; }
    const entries = Object.entries(categories);
    const newEntries = entries.map(([key, val]) => {
      if (key === oldName) return [newName, val];
      return [key, val];
    });
    setCategories(Object.fromEntries(newEntries));
    setEditingCategory(null);
  };

  const getIcon = (cat) => {
    switch(cat) {
      case RECENT_KEY: return <Clock size={16} />;
      case FAV_KEY: return <Star size={16} className="fill-current" />;
      case '喜': return <Smile size={16} />;
      case '怒': return <Angry size={16} />;
      case '哀': return <Frown size={16} />;
      case '樂': return <Laugh size={16} />;
      case '其他': return <MoreHorizontal size={16} />;
      default: return <Smile size={16} />;
    }
  };
  const isFavorite = (item) => categories[FAV_KEY]?.includes(item);

  // --- 分類標籤拖曳排序功能 ---
  const handleCategoryDragStart = (e, category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e, category) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCategory && draggedCategory !== category) {
      setDragOverCategory(category);
    }
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleCategoryDrop = (e, targetCategory) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory === targetCategory) {
      setDraggedCategory(null);
      setDragOverCategory(null);
      return;
    }

    const currentOrder = getSortedCategories();
    const draggedIndex = currentOrder.indexOf(draggedCategory);
    const targetIndex = currentOrder.indexOf(targetCategory);

    // 重新排序
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategory);

    setCategoryOrder(newOrder);
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  // --- 匯入匯出功能 ---
  const handleExportData = () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          categories: categories,
          categoryOrder: categoryOrder
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `kaomoji-backup-${timestamp}.json`;
      const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      // 發送消息給 background script 來處理下載
      if (isExtensionContextValid()) {
        try {
          chrome.runtime.sendMessage({
            action: 'downloadFile',
            dataUrl: dataUrl,
            filename: filename
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Message error:', chrome.runtime.lastError);
              // 降級使用 data URI
              fallbackDownload(dataUrl, filename);
            } else if (response && response.success) {
              alert(t('exportSuccess'));
            } else {
              // 降級使用 data URI
              fallbackDownload(dataUrl, filename);
            }
          });
        } catch (error) {
          console.warn('Failed to send download message:', error);
          fallbackDownload(dataUrl, filename);
        }
      } else {
        // 降級使用 data URI
        fallbackDownload(dataUrl, filename);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('匯出時發生錯誤');
    }
  };

  const fallbackDownload = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(t('exportSuccess'));
  };

  const handleImportData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm(t('importConfirm'))) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // 驗證資料格式
        if (!importData.data || !importData.data.categories) {
          alert(t('importError'));
          return;
        }

        const { categories: importedCategories, categoryOrder: importedOrder } = importData.data;

        // 確保必要的分類存在
        if (!importedCategories[RECENT_KEY]) importedCategories[RECENT_KEY] = [];
        if (!importedCategories[FAV_KEY]) importedCategories[FAV_KEY] = [];

        // 更新狀態
        setCategories(importedCategories);
        if (importedOrder) {
          setCategoryOrder(importedOrder);
        }

        // 儲存到 Chrome Storage
        if (isExtensionContextValid() && chrome.storage) {
          try {
            chrome.storage.local.set({
              'myKaomojiData_v2': importedCategories,
              'categoryOrder_v2': importedOrder || null
            }, () => {
              if (chrome.runtime.lastError) {
                console.warn('Chrome storage set error:', chrome.runtime.lastError);
              }
            });
          } catch (error) {
            console.warn('Failed to write import data to chrome storage:', error);
          }
        }

        alert(t('importSuccess'));

        // 切換到第一個分類
        const firstCategory = getSortedCategories()[0];
        if (firstCategory) setActiveTab(firstCategory);
      } catch (error) {
        console.error('Import error:', error);
        alert(t('importError'));
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // 如果沒有 menuPosition，就不渲染任何東西 (除了外殼)
  if (!menuPosition) return null;

  return (
    // 使用 pointer-events-auto 恢復滑鼠互動
    <div
      ref={menuRef}
      style={{
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
        pointerEvents: 'auto', // 關鍵：恢復點擊事件
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      className="fixed w-80 bg-white shadow-2xl rounded-lg border border-slate-100 overflow-hidden z-[2147483647] animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[600px] text-left font-sans text-slate-800"
    >
       {/* 標頭 - 可拖動 */}
       <div
         className="drag-handle bg-slate-100 p-2 flex justify-between items-center border-b border-slate-200 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
         onMouseDown={handleDragStart}
       >
          <span className="text-xs font-bold text-slate-500 px-2 pointer-events-none">
            {activeTab === 'settings' ? t('manageCategories') : t('title')}
          </span>
          <button
            onClick={() => setMenuPosition(null)}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-red-500 transition-colors z-10"
          >
            <X size={16} />
          </button>
        </div>

        {/* 分類籤頁 */}
        <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar flex-shrink-0">
          {getSortedCategories().map((cat) => (
            <button
              key={cat}
              draggable
              onDragStart={(e) => handleCategoryDragStart(e, cat)}
              onDragOver={(e) => handleCategoryDragOver(e, cat)}
              onDragLeave={handleCategoryDragLeave}
              onDrop={(e) => handleCategoryDrop(e, cat)}
              onDragEnd={handleCategoryDragEnd}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 py-2 min-w-[40px] text-sm font-medium flex justify-center items-center gap-1 transition-all whitespace-nowrap px-3 ${
                activeTab === cat
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              } ${
                draggedCategory === cat
                  ? 'opacity-50 cursor-grabbing'
                  : 'cursor-grab'
              } ${
                dragOverCategory === cat
                  ? 'border-l-2 border-blue-400'
                  : ''
              }`}
              title={getCategoryDisplayName(cat)}
            >
              {getIcon(cat)}
              {cat !== RECENT_KEY && cat !== FAV_KEY && (
                <span>{getCategoryDisplayName(cat)}</span>
              )}
            </button>
          ))}
          <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 min-w-[60px] text-sm font-medium flex justify-center items-center gap-1 transition-colors whitespace-nowrap px-3 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-800 border-b-2 border-slate-600' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={t('settings')}
            >
              <Settings size={14} />
          </button>
        </div>

        {/* 內容區域 (列表或設定) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === 'settings' ? (
            <div className="p-3">
              {/* 備份與還原區塊 */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">{t('backupRestore')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportData}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    {t('exportData')}
                  </button>
                  <label className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Download size={16} />
                    {t('importData')}
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 設定頁面內容 (新增分類) */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">{t('addCategoryLabel')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('addCategoryPlaceholder')}
                    className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                  />
                  <button 
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>

              {/* 設定頁面內容 (現有分類) */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">{t('existingCategories')}</label>
                <div className="space-y-2">
                  {getSortedCategories().map((cat) => (
                    <div key={cat} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                      {editingCategory === cat ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            autoFocus type="text" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-1 py-0.5 text-sm border border-blue-300 rounded focus:outline-none"
                          />
                          <button onClick={() => saveCategoryName(cat)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14}/></button>
                          <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X size={14}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                          <span className="text-slate-500">{getIcon(cat)}</span>
                          <span className="text-sm font-medium truncate">{getCategoryDisplayName(cat)}</span>
                          <span className="text-xs text-slate-400">({categories[cat].length})</span>
                        </div>
                      )}

                      {editingCategory !== cat && (
                        <div className="flex gap-1">
                            {cat !== RECENT_KEY && cat !== FAV_KEY && (
                              <>
                                <button onClick={() => startEditing(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                              </>
                            )}
                            {(cat === RECENT_KEY || cat === FAV_KEY) && (
                                <span className="text-xs text-slate-300 px-2 italic">{t('systemDefault')}</span>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 列表頁面 */
            <div className="p-2 grid grid-cols-1 gap-1">
              {categories[activeTab]?.map((item, index) => {
                const isFav = isFavorite(item);
                return (
                  <div 
                    key={index}
                    onClick={() => insertKaomoji(item)}
                    className="group flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer transition-all border border-transparent hover:border-blue-100 relative"
                  >
                    <span className="text-slate-700 font-medium truncate flex-1 pr-16">{item}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all absolute right-2 bg-blue-50 pl-2">
                        {activeTab !== RECENT_KEY && (
                            <div className="flex flex-col mr-1">
                                <button onClick={(e) => moveItem(e, index, 'up')} disabled={index === 0} className="p-0.5 hover:text-blue-600 disabled:opacity-20"><ArrowUp size={10} /></button>
                                <button onClick={(e) => moveItem(e, index, 'down')} disabled={index === categories[activeTab].length - 1} className="p-0.5 hover:text-blue-600 disabled:opacity-20"><ArrowDown size={10} /></button>
                            </div>
                        )}
                        <button onClick={(e) => toggleFavorite(e, item)} className={`p-1 hover:scale-110 transition-transform ${isFav ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}><Star size={14} className={isFav ? "fill-current" : ""} /></button>
                        <button onClick={(e) => handleDeleteItem(e, index)} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    {isFav && <Star size={10} className="absolute right-2 top-2 text-yellow-400 fill-current opacity-40 group-hover:opacity-0" />}
                  </div>
                );
              })}
              {categories[activeTab]?.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {activeTab === RECENT_KEY ? t('emptyRecent') : t('emptyCategory')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部輸入框 */}
        {activeTab !== 'settings' && activeTab !== RECENT_KEY && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`${t('addTo')}「${getCategoryDisplayName(activeTab)}」...`}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button 
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default App;