# VibeCode ⚡

> AI-Powered Vibe Coding Environment — Build complete apps by just describing them.

## 🚀 Quick Start

### Windows (Recommended)
```
Right-click start.ps1 → "Run with PowerShell"
```
or in a terminal:
```powershell
.\start.ps1
```

### Manual
```bash
npm install
npm start
```

Opens at **http://localhost:3000**

## 🔑 Login
| Field | Value |
|-------|-------|
| Username | `testuser` |
| Password | `test@123` |

## ✨ Features
- **AI Chat** — Describe any app in plain English
- **Live Preview** — See your app render instantly in the iframe
- **Code View** — Browse all generated files with syntax highlighting
- **Streaming** — Watch the AI write code in real-time
- **Persistent** — Chat + project saved across sessions (localStorage)

## 💡 Example prompts
- "Build a stunning SaaS landing page with hero, features, pricing"
- "Create an analytics dashboard with charts and KPI cards"
- "Build a task manager with add/edit/delete and filtering"
- "Make a snake game with score tracking"
- "Build a calculator with a premium dark UI"

## 🏗️ Tech Stack
- React 18
- React Router v6
- Anthropic Claude API (streaming)
- localStorage for persistence
- CSS Modules + custom design system

## 📁 Structure
```
vibecode/
├── src/
│   ├── components/
│   │   ├── ChatPanel.js       # AI chat interface
│   │   ├── MessageBubble.js   # Chat message renderer
│   │   ├── PreviewPanel.js    # Live preview + code view
│   │   └── TopBar.js          # App header
│   ├── hooks/
│   │   ├── useAuth.js         # Auth with localStorage
│   │   └── useProject.js      # Project state management
│   ├── pages/
│   │   ├── LoginPage.js       # Login screen
│   │   └── WorkspacePage.js   # Main workspace
│   ├── utils/
│   │   └── aiService.js       # Anthropic API integration
│   └── styles/
│       └── global.css         # Design system + variables
├── start.ps1                  # Windows auto-start script
└── package.json
```
