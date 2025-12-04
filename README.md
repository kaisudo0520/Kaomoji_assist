[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

---

# Kaomoji Assistant - Chrome Extension

Insert cute kaomoji (emoticons) on any webpage with a right-click!

## Features

✨ **Dual Trigger** - Shift+Right-click to open directly / Select "Kaomoji Assistant" from context menu
📂 **Category Management** - 5 built-in categories (Joy, Anger, Sadness, Fun, Other) + Favorites + Recent
⭐ **Favorites** - Mark frequently used kaomoji for quick access
🕐 **Recent** - Auto-records the last 10 used kaomoji
🎨 **Customization** - Add, edit, and delete categories and kaomoji
🔁 **Continuous Insert** - Menu stays open after clicking kaomoji for consecutive insertions
📍 **Position Memory** - Remembers last menu position for next opening
🎯 **Draggable Interface** - Freely drag the menu to your preferred position
🌏 **Multi-language** - Auto-detects language (Traditional Chinese/English)
💾 **Data Sync** - Settings stored in Chrome Storage

## Installation

### 1. Build the Project (if not already built)

```bash
npm install
npm run build
```

### 2. Load into Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `dist` folder from the project
6. Done! Extension installed successfully 🎉

## Usage

### Basic Usage

**Method 1: Shift + Right-click (Quick Open)**
1. Press `Shift + Right-click` on any **input field** or **text area** on any webpage
2. The menu will appear at the last saved position (first use will show near the input field)
3. Click a kaomoji to insert it at the cursor position
4. Menu stays open for additional selections
5. Click the ✕ button in the top right to close

**Method 2: Context Menu**
1. Right-click on any **input field** or **text area** on any webpage
2. Select "Kaomoji Assistant" from the browser context menu
3. Menu will appear at the last remembered position

**Dragging the Menu**
- Hold and drag the gray title bar at the top of the menu
- Position is saved for next opening

### Managing Kaomoji

1. Right-click to open the menu
2. Click the "⚙️ Settings" tab in the top right
3. You can:
   - Add custom categories
   - Rename categories (except system defaults)
   - Delete categories
4. Within each category, you can:
   - Add kaomoji (input field at bottom)
   - Mark as favorite (⭐ icon)
   - Adjust order (↑↓ arrows)
   - Delete items (🗑️ icon)

## Default Kaomoji

### 😊 Joy
(•‿•) | (^‿^) | (≧▽≦) | (*^▽^*) | (o^∀^o)

### 😠 Anger
(╬☉д⊙)⊰ | (ノಠ益ಠ)ノ | (╬ Ò ‸ Ó) | ヽ(｀Д´)ﾉ | (＃`Д´)

### 😢 Sadness
( ；∀；) | (´;︵;`) | (╥_╥) | (T_T) | (;´༎ຶД༎ຶ`)

### 😄 Fun
(~‾▿‾)~ | ♪～(´ε` ) | └( ＾ω＾ )」 | (*￣0￣)θ～♪ | ᕕ( ᐛ )ᕗ

### 🤔 Other
(・_・) | (O_O) | (._.) | (;´Д`) | (･ω･)b

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload not supported)
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Extension Version**: Manifest V3
- **Storage**: Chrome Storage API

## Project Structure

```
├── dist/                 # Build output (load this into Chrome)
│   ├── manifest.json
│   ├── background.js    # Context menu handler
│   └── assets/
│       ├── index.js
│       └── index.css
├── src/
│   ├── main.jsx         # Entry point
│   ├── App.jsx          # Main component (UI + logic)
│   ├── background.js    # Background script (context menu registration)
│   └── index.css        # Global styles (including scrollbar optimization)
├── manifest.json        # Chrome extension config
├── vite.config.js       # Vite config (multi-entry build)
├── tailwind.config.js   # Tailwind config
└── package.json         # Project config
```

## FAQ

### Q: Kaomoji Assistant not appearing?
A: Please check:
- Extension is properly installed and enabled
- You are clicking on an **editable area** (input, textarea, contentEditable)
- Use `Shift + Right-click` to open directly, or select "Kaomoji Assistant" from context menu

### Q: Menu position is wrong or not visible?
A: You can:
- First use will auto-calculate position near the input field
- Drag the title bar to move to preferred position
- Position is saved for next opening
- To reset position, remove and reinstall from `chrome://extensions/`

### Q: How to close the menu?
A:
- Click the ✕ button in the top right corner
- Or click anywhere outside the menu

### Q: How to update the extension?
A:
1. After code changes, run `npm run build`
2. Go to `chrome://extensions/`
3. Click the refresh icon 🔄 on the extension card

### Q: Will my data be preserved?
A: Yes! All custom categories, kaomoji, and menu positions are stored in Chrome Storage and won't be lost when reloading the extension.

### Q: Why doesn't the menu close after clicking a kaomoji?
A: This is a feature! It allows you to insert multiple kaomoji consecutively without reopening the menu. Click the ✕ button in the top right corner when done.

## License

This project is open source. Feel free to use and modify.

## Contributing

Issues and Pull Requests are welcome!

---

**Enjoy using kaomoji!** (｡◕‿◕｡)
