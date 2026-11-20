# Docora — Your Intelligent Document Workspace

Docora is an enterprise-grade, modern document management and real-time collaboration SaaS platform inspired by **Notion**, **Linear**, **Google Docs**, and **Dropbox**.

Docora combines the block-based editing and structured workspaces of Notion, the visual elegance and speed of Linear, the multi-user synchronization and comments of Google Docs, and the security and file management of Dropbox—amplified with contextual document AI workflows.

---

## ⚡ Key Highlights & Capabilities

### 1. 🎨 Notion + Linear Inspired Design System
- **Brand Palette:** Primary `#7657E8`, Light Canvas `#F8F7FF`, Dark Studio `#11101B`, Success Mint `#159B77`, Warm Accent `#F1A34A`, Crisp Borders `#EAE8F0`.
- **Themes:** First-class support for Light, Dark, and System modes with instant toggle.
- **Typography & Icons:** Built with Inter and Lucide React.
- **Linear-Style Collapsible Sidebar:** Grouped by Main, Workspace, Management, Tools, and Settings with cloud storage gauges and active route pills.
- **Global Command Palette:** Press `⌘K` or `Ctrl+K` anywhere to search documents, folders, tags, or trigger workspace actions.

### 2. 📝 Advanced Real-Time Document Editor
- **Rich Text & Delta Persistence:** Built on Quill Delta with bidirectional real-time Socket.IO replication.
- **Notion-Style Slash Commands:** Type `/` on an empty line to insert Headings (H1–H3), Bulleted Lists, Numbered Lists, Checklists, Code Blocks, and Blockquotes.
- **Live Presence & Collaborator Avatars:** Real-time collaborator badges in the header showing active users editing the document simultaneously.
- **Time-Machine Version Control:** Named snapshots, revision timestamps, editor attribution, and one-click version restoration without losing history.
- **Threaded Inline Comments:** Text highlighting, threaded discussion replies, resolution tracking, and real-time synchronization.
- **Continuous Autosave:** Real-time saving status indicators (`Saving...` / `All changes saved`).
- **Multi-Format Export:** 1-click export to Markdown (`.md`), HTML (`.html`), Plain Text (`.txt`), and Print/PDF.

### 3. 🤖 Contextual Document AI Assistant
- **Writing Assistance:** Rewrite text adapting tone (Professional, Casual, Concise, Academic).
- **Document Intelligence:** Generate executive briefings, extract structured checklists and action items, and fix grammar and spelling.
- **Contextual Document Chat:** Ask questions directly about the active document with local semantic intelligence or external LLMs (Google Gemini API / OpenAI API).
- **Instant Insertion:** 1-click "Insert into Document" appends AI results directly into the Quill editor canvas.

### 4. 📂 Advanced Document & Folder Management
- **Views:** Grid View and List View with column sorting (Last Modified, Title, Created Date, Word Count).
- **Filtering & Search:** Real-time search across titles, content deltas, custom `#tags`, and folders.
- **Bulk Operations:** Multi-select documents to bulk star, bulk delete, or bulk restore.
- **Folder Trees:** Create folders with customizable color tokens and emoji icons.
- **Drag-and-Drop File Uploads:** Upload PDFs, images, docs, and spreadsheets up to 50MB with file validation and progress tracking.

### 5. 👥 Team Workspaces & Document Sharing
- **Role-Based Access Control (RBAC):** Owner, Admin, Editor, Commenter, and Viewer roles.
- **Document Sharing:** Invite team members by email or toggle public share links with optional password protection and expiration dates.
- **Public Share View:** Accessible via `/share/:token` for friction-free sharing.

### 6. 📊 Real-Time Analytics & SaaS Billing
- **Real Metrics:** Storage utilization gauges, monthly creation trends, asset distribution charts, and recent audit activity feed.
- **Commercial SaaS Plans:** Starter (Free), Pro Collaborator ($12/mo), and Enterprise ($39/mo) with usage meters, monthly/yearly toggles, and invoice receipts.

---

## 🏗️ Architecture

```
Docora
├── client/                     # Vite + React 18 Single-Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Dropdown, Avatar, CommandPalette
│   │   │   ├── layout/         # AppLayout, Sidebar, TopNav
│   │   │   ├── dashboard/      # Personalized Executive Dashboard
│   │   │   ├── documents/      # DocumentList, FolderView, FileUploadModal, ShareModal
│   │   │   ├── editor/         # EditorHeader, SlashCommandMenu, AIAssistantDrawer, CommentsDrawer, VersionHistoryDrawer
│   │   │   ├── analytics/      # Analytics dashboard & reports
│   │   │   ├── settings/       # Profile, Security, Preferences, Workspace, SaaS Billing
│   │   │   └── templates/      # Document template library
│   │   ├── context/            # AuthContext, ThemeContext, WorkspaceContext, ToastContext
│   │   ├── services/           # Unified API client
│   │   ├── TextEditor.jsx      # Core rich document editor with Socket.IO delta sync
│   │   └── App.jsx             # Comprehensive routing
│   ├── tailwind.config.js      # Docora design tokens & styling
│   └── package.json
│
└── server/                     # Unified Express REST API + Socket.IO Server
    ├── models/                 # Document, Folder, Workspace, User, Comment, Version, Activity
    ├── routes/                 # auth, documents, folders, workspaces, comments, versions, files, ai, analytics, share, settings
    ├── middleware/             # JWT auth verification & role permissions
    ├── services/               # dataService (resilient MongoDB + disk-backed persistence)
    ├── test/                   # Automated unit and integration test suite
    ├── server.js               # Entry point mounting REST APIs and Socket.IO
    └── package.json
```

---

## 🛠️ Environment Variables

### Client (`client/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_SERVER_URL` | Base URL for Docora backend REST API and Socket.IO server | `http://localhost:3002` |

### Server (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3002` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/DocNest` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `docora_jwt_secret_dev_key_2026` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API key for external LLM AI workflows | `None` (uses intelligent local semantic engine) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested on Node.js v22)
- npm or yarn

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
The server will run on `http://localhost:3002` serving both the REST API and Socket.IO.

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests
```bash
cd server
npm test
```

---

## 📜 License
Docora is open-source under the ISC License.
