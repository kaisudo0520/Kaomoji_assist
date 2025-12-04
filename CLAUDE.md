# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

**Language**: Always respond in Traditional Chinese (繁體中文) when working in this repository.

## Project Overview

This is a Chrome Extension (Manifest V3) that provides a kaomoji (emoticon) helper accessible via right-click context menu. Built with React 18, Vite 5, and Tailwind CSS.

## Build System

### Building for Production
```bash
npm run build
```
This runs Vite build followed by copying manifest.json to dist/. The build process:
1. Compiles two entry points: `src/main.jsx` → `dist/assets/index.js` (content script) and `src/background.js` → `dist/background.js` (service worker)
2. Outputs fixed filenames (no hashes) as required by manifest.json
3. Copies manifest.json to dist/ via `copy-manifest.js`

### Development
```bash
npm run dev
```
Note: Hot reload is not fully functional for Chrome extensions. After code changes, rebuild and click the refresh icon in `chrome://extensions/`.

### Testing the Extension
1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder

## Architecture

### Multi-Entry Build Configuration
The project uses a custom Vite config to handle two separate entry points:
- **Content Script** (`src/main.jsx`): Renders the React UI overlay on web pages
- **Background Script** (`src/background.js`): Registers context menu items and handles inter-script messaging

The `entryFileNames` function in `vite.config.js` ensures background.js outputs to root (not assets/) to match manifest.json expectations.

### Chrome Extension Communication Flow
1. User right-clicks in an editable field → native context menu shows "顏文字助手" option
2. User clicks menu item → `background.js` sends message via `chrome.runtime.sendMessage()`
3. `App.jsx` receives message via `chrome.runtime.onMessage` listener → opens kaomoji picker
4. Alternatively, user can press `Shift + Right-click` to directly open picker (bypasses context menu)

### State Management & Persistence
- **Categories & Kaomoji**: Stored in `chrome.storage.local` under key `myKaomojiData_v2`
- **Category Order**: Custom drag-drop order stored under `categoryOrder_v2`
- **Menu Position**: Last menu coordinates stored under `lastMenuPosition_v2` for persistent positioning
- All state syncs to Chrome Storage automatically via useEffect hooks

### UI Overlay System
The React app injects itself into the host page:
1. `main.jsx` creates a root div with max z-index (2147483647)
2. Uses `pointer-events: none` by default to avoid interfering with page interactions
3. When menu opens, `pointer-events: auto` is restored to the menu container
4. Menu calculates position based on input field bounds, viewport space, or last saved position

### Key Behavioral Features
- **Non-closing Menu**: Clicking a kaomoji inserts text but keeps menu open for consecutive insertions (closed only via X button or outside click)
- **Position Memory**: Menu remembers drag position across sessions
- **Dual Trigger**: Shift+Right-click (direct) or Right-click menu item (via background script)

## Important Implementation Details

### Text Insertion Logic (`insertAtCursor` function in App.jsx)
Handles three scenarios:
1. **Standard inputs** (input/textarea): Uses `selectionStart`/`selectionEnd` and dispatches synthetic `input` event for React/Vue compatibility
2. **ContentEditable** (Gmail, Facebook): Uses `document.execCommand('insertText')` for broad compatibility
3. **Fallback**: Copies to clipboard if no target element

### Chrome Storage Keys
Never change these keys without migration logic:
- `myKaomojiData_v2`
- `categoryOrder_v2`
- `lastMenuPosition_v2`

### Manifest.json & Build Coupling
The manifest.json references hardcoded paths:
- `content_scripts[0].js`: `["assets/index.js"]`
- `background.service_worker`: `"background.js"`

If you modify output paths in `vite.config.js`, update manifest.json accordingly or adjust the entryFileNames function.

### Styling Notes
- Tailwind utility classes handle most styling
- Custom scrollbar styles in `src/index.css` use webkit-specific pseudo-elements
- `custom-scrollbar` class applied to scrollable containers
- Menu uses fixed width (w-80 = 320px) and max-height (max-h-[600px])

## Language System
Auto-detects browser language via `navigator.language`:
- Contains 'zh' → Traditional Chinese (`zh-TW`)
- Otherwise → English (`en`)

Translations defined in `translations` object in `App.jsx`. Category names (喜怒哀樂其他) have both key and display name translations.

## Common Pitfalls

### Manifest Changes
After modifying manifest.json, you must:
1. Run `npm run build` (copies manifest to dist/)
2. Reload extension in Chrome

### Storage API Async Pattern
Chrome Storage API is async but wrapped in callback style. When adding new storage keys, follow the pattern in existing useEffect hooks.

### Context Menu Permissions
The extension requires `contextMenus` permission in manifest.json. If adding new context menu items, register them in `background.js` via `chrome.contextMenus.create()` in the `onInstalled` listener.

### Drag Functionality
Menu dragging is implemented via mousedown/mousemove/mouseup listeners on the header. The `.drag-handle` class gates drag initiation to prevent conflicts with button clicks.
