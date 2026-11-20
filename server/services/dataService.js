const { memoryStore, saveCollection, getIsConnected } = require('../db');
const Document = require('../document');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Folder = require('../models/Folder');
const Comment = require('../models/Comment');
const Version = require('../models/Version');
const Activity = require('../models/Activity');
const FileAttachment = require('../models/FileAttachment');
const Notification = require('../models/Notification');

// Seed default initial data if empty
function initializeSeedData() {
  if (memoryStore.users.size === 0) {
    const adminUser = {
      _id: 'usr_admin',
      name: 'Alex Vance',
      email: 'alex.vance@docora.internal',
      password: '$2a$10$YourHashedPasswordPlaceholderDocora2026', // bcrypt placeholder
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      twoFactorEnabled: false,
      bio: 'VP of Product & Lead Architect at Docora',
      preferences: {
        theme: 'light',
        emailNotifications: true,
        compactView: false,
        autoSaveIntervalMs: 2000,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.set(adminUser._id, adminUser);
    saveCollection('users');
  }

  if (memoryStore.workspaces.size === 0) {
    const defaultWorkspace = {
      _id: 'ws_default',
      name: 'Acme Product Workspace',
      slug: 'acme-product',
      ownerId: 'usr_admin',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      plan: 'pro',
      storageLimitBytes: 21474836480, // 20GB
      storageUsedBytes: 4823449600, // 4.5GB
      members: [
        {
          userId: 'usr_admin',
          name: 'Alex Vance',
          email: 'alex.vance@docora.internal',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'owner',
          joinedAt: new Date(Date.now() - 60 * 86400000),
        },
        {
          userId: 'usr_sarah',
          name: 'Sarah Connor',
          email: 'sarah.c@acme.inc',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          joinedAt: new Date(Date.now() - 45 * 86400000),
        },
        {
          userId: 'usr_marcus',
          name: 'Marcus Miller',
          email: 'marcus.m@acme.inc',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'editor',
          joinedAt: new Date(Date.now() - 30 * 86400000),
        },
        {
          userId: 'usr_elena',
          name: 'Elena Rostova',
          email: 'elena.r@acme.inc',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          role: 'commenter',
          joinedAt: new Date(Date.now() - 10 * 86400000),
        },
      ],
      createdAt: new Date(Date.now() - 60 * 86400000),
      updatedAt: new Date(),
    };
    memoryStore.workspaces.set(defaultWorkspace._id, defaultWorkspace);
    saveCollection('workspaces');
  }

  if (memoryStore.folders.size === 0) {
    const folders = [
      {
        _id: 'fld_design',
        name: 'Design System & UI',
        color: '#7657E8',
        icon: '🎨',
        parentId: null,
        workspaceId: 'ws_default',
        ownerId: 'usr_admin',
        isFavorite: true,
        createdAt: new Date(Date.now() - 25 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: 'fld_roadmap',
        name: 'Product Roadmap 2026',
        color: '#159B77',
        icon: '🗺️',
        parentId: null,
        workspaceId: 'ws_default',
        ownerId: 'usr_admin',
        isFavorite: true,
        createdAt: new Date(Date.now() - 20 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: 'fld_engineering',
        name: 'Engineering Specs',
        color: '#3B82F6',
        icon: '⚙️',
        parentId: null,
        workspaceId: 'ws_default',
        ownerId: 'usr_admin',
        isFavorite: false,
        createdAt: new Date(Date.now() - 18 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: 'fld_growth',
        name: 'Marketing & Growth',
        color: '#F1A34A',
        icon: '🚀',
        parentId: null,
        workspaceId: 'ws_default',
        ownerId: 'usr_admin',
        isFavorite: false,
        createdAt: new Date(Date.now() - 12 * 86400000),
        updatedAt: new Date(),
      },
    ];
    folders.forEach((f) => memoryStore.folders.set(f._id, f));
    saveCollection('folders');
  }

  if (memoryStore.documents.size === 0) {
    const docs = [
      {
        _id: 'doc_getting_started',
        title: 'Welcome to Docora: Intelligent Document Workspace',
        data: {
          ops: [
            { insert: 'Welcome to Docora ⚡\n', attributes: { header: 1 } },
            { insert: 'Docora is your modern, unified workspace that fuses the elegance of Notion, the speed of Linear, the collaboration of Google Docs, and the security of Dropbox.\n\n' },
            { insert: 'Key Capabilities\n', attributes: { header: 2 } },
            { insert: 'Real-time multi-user editing with cursor and presence tracking.\n', attributes: { list: 'bullet' } },
            { insert: 'Threaded inline comments with mentions and resolutions.\n', attributes: { list: 'bullet' } },
            { insert: 'Notion-style slash commands: type / anywhere in the page.\n', attributes: { list: 'bullet' } },
            { insert: 'Integrated AI assistant for summarizing, rewriting, and querying documents.\n', attributes: { list: 'bullet' } },
            { insert: 'Time-machine version history with zero-loss rollback.\n', attributes: { list: 'bullet' } },
            { insert: 'Enterprise-grade sharing, password access, and permission controls.\n', attributes: { list: 'bullet' } },
            { insert: '\nKeyboard Shortcuts\n', attributes: { header: 2 } },
            { insert: 'Press ' },
            { insert: 'Cmd/Ctrl + K', attributes: { bold: true, code: true } },
            { insert: ' anywhere to open the Global Command Palette.\n' },
            { insert: 'Press ' },
            { insert: 'Slash (/)', attributes: { bold: true, code: true } },
            { insert: ' on an empty line in the editor to insert headings, lists, quotes, or code blocks.\n\n' },
            { insert: 'Start creating by clicking the + New Document button in the top bar!', attributes: { italic: true } },
            { insert: '\n' }
          ]
        },
        ownerId: 'usr_admin',
        ownerName: 'Alex Vance',
        ownerEmail: 'alex.vance@docora.internal',
        workspaceId: 'ws_default',
        folderId: 'fld_design',
        isStarred: true,
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['Welcome', 'Guide', 'Productivity'],
        icon: '⚡',
        coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
        wordCount: 164,
        characterCount: 1042,
        sharing: {
          isPublic: true,
          publicRole: 'viewer',
          shareToken: 'share_welcome_docora_2026',
          password: '',
          expiresAt: null,
          allowComments: true,
          allowDownload: true,
          collaborators: [
            { userId: 'usr_sarah', name: 'Sarah Connor', email: 'sarah.c@acme.inc', role: 'editor' },
            { userId: 'usr_marcus', name: 'Marcus Miller', email: 'marcus.m@acme.inc', role: 'commenter' },
          ],
        },
        createdAt: new Date(Date.now() - 14 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        _id: 'doc_arch_spec',
        title: 'Docora SaaS Architecture & System Design',
        data: {
          ops: [
            { insert: 'Docora SaaS Architecture & Design Specs\n', attributes: { header: 1 } },
            { insert: 'This document defines the high-availability architecture of Docora, covering frontend ergonomics, backend reliability, and real-time delta replication.\n\n' },
            { insert: 'Core Components\n', attributes: { header: 2 } },
            { insert: 'Frontend Client: Vite + React 18 + Tailwind CSS + Lucide React.\n', attributes: { list: 'bullet' } },
            { insert: 'Rich Text Delta Engine: Quill Delta format with bidirectional Socket.IO synchronization.\n', attributes: { list: 'bullet' } },
            { insert: 'Backend Service: Node.js Express REST API + Socket.IO server on unified HTTP port.\n', attributes: { list: 'bullet' } },
            { insert: 'Database Tier: Mongoose MongoDB with auto-recovering memory/disk persistent layer.\n', attributes: { list: 'bullet' } },
            { insert: 'AI Integration: Context-aware LLM engine for writing, summarization, and document chat.\n', attributes: { list: 'bullet' } },
          ]
        },
        ownerId: 'usr_admin',
        ownerName: 'Alex Vance',
        ownerEmail: 'alex.vance@docora.internal',
        workspaceId: 'ws_default',
        folderId: 'fld_engineering',
        isStarred: true,
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['Architecture', 'Engineering', 'API'],
        icon: '📐',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        wordCount: 110,
        characterCount: 780,
        sharing: {
          isPublic: false,
          publicRole: 'viewer',
          shareToken: 'share_arch_spec_2026',
          password: '',
          expiresAt: null,
          allowComments: true,
          allowDownload: true,
          collaborators: [],
        },
        createdAt: new Date(Date.now() - 10 * 86400000),
        updatedAt: new Date(Date.now() - 8 * 3600000),
      },
      {
        _id: 'doc_q4_launch',
        title: 'Q4 Product Launch & Go-To-Market Plan',
        data: {
          ops: [
            { insert: 'Q4 Product Launch & Marketing Strategy\n', attributes: { header: 1 } },
            { insert: 'Target Launch Date: December 15, 2026\n', attributes: { bold: true } },
            { insert: 'Milestones and Deliverables\n', attributes: { header: 2 } },
            { insert: 'Finalize brand identity and design tokens (Completed)\n', attributes: { list: 'check' } },
            { insert: 'Implement real-time collaboration with presence tracking (Completed)\n', attributes: { list: 'check' } },
            { insert: 'Deploy AI contextual sidecar and document chat (Completed)\n', attributes: { list: 'check' } },
            { insert: 'Run full security audit and role-based permissions validation\n', attributes: { list: 'check' } },
          ]
        },
        ownerId: 'usr_admin',
        ownerName: 'Alex Vance',
        ownerEmail: 'alex.vance@docora.internal',
        workspaceId: 'ws_default',
        folderId: 'fld_roadmap',
        isStarred: false,
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['Product', 'Launch', 'Marketing'],
        icon: '🚀',
        coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
        wordCount: 88,
        characterCount: 520,
        sharing: {
          isPublic: false,
          publicRole: 'viewer',
          shareToken: '',
          password: '',
          expiresAt: null,
          allowComments: true,
          allowDownload: true,
          collaborators: [],
        },
        createdAt: new Date(Date.now() - 7 * 86400000),
        updatedAt: new Date(Date.now() - 24 * 3600000),
      },
      {
        _id: 'doc_brand_guide',
        title: 'Docora Brand Design System & Typography Guidelines',
        data: {
          ops: [
            { insert: 'Docora Brand Style Guide\n', attributes: { header: 1 } },
            { insert: 'Clean, minimal, intelligent, and focused on high user productivity.\n\n' },
            { insert: 'Color Tokens:\n', attributes: { header: 2 } },
            { insert: 'Primary Brand Violet: #7657E8\n', attributes: { list: 'bullet' } },
            { insert: 'Canvas Light Background: #F8F7FF\n', attributes: { list: 'bullet' } },
            { insert: 'Dark Studio Background: #11101B\n', attributes: { list: 'bullet' } },
            { insert: 'Success Mint: #159B77\n', attributes: { list: 'bullet' } },
            { insert: 'Warm Amber Accent: #F1A34A\n', attributes: { list: 'bullet' } },
          ]
        },
        ownerId: 'usr_admin',
        ownerName: 'Alex Vance',
        ownerEmail: 'alex.vance@docora.internal',
        workspaceId: 'ws_default',
        folderId: 'fld_design',
        isStarred: true,
        isArchived: false,
        isDeleted: false,
        deletedAt: null,
        tags: ['Design', 'Brand', 'Tokens'],
        icon: '🎨',
        coverImage: '',
        wordCount: 65,
        characterCount: 410,
        sharing: {
          isPublic: true,
          publicRole: 'viewer',
          shareToken: 'share_brand_guide_2026',
          password: '',
          expiresAt: null,
          allowComments: true,
          allowDownload: true,
          collaborators: [],
        },
        createdAt: new Date(Date.now() - 5 * 86400000),
        updatedAt: new Date(Date.now() - 12 * 3600000),
      },
    ];
    docs.forEach((d) => memoryStore.documents.set(d._id, d));
    saveCollection('documents');
  }

  if (memoryStore.comments.size === 0) {
    const comments = [
      {
        _id: 'cmt_1',
        documentId: 'doc_getting_started',
        userId: 'usr_sarah',
        userName: 'Sarah Connor',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'The new slash commands menu makes formatting blocks so much faster!',
        highlightedText: 'Notion-style slash commands',
        position: { index: 180, length: 27 },
        resolved: false,
        resolvedBy: null,
        replies: [
          {
            _id: 'rpl_1',
            userId: 'usr_admin',
            userName: 'Alex Vance',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: 'Agreed! We also hooked it up to keyboard shortcuts so you never have to leave the home row.',
            createdAt: new Date(Date.now() - 3600000),
          },
        ],
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        _id: 'cmt_2',
        documentId: 'doc_getting_started',
        userId: 'usr_marcus',
        userName: 'Marcus Miller',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Can we add an option to customize the cover photo gradient?',
        highlightedText: 'Time-machine version history',
        position: { index: 280, length: 28 },
        resolved: true,
        resolvedBy: 'Alex Vance',
        replies: [],
        createdAt: new Date(Date.now() - 86400000),
      },
    ];
    comments.forEach((c) => memoryStore.comments.set(c._id, c));
    saveCollection('comments');
  }

  if (memoryStore.versions.size === 0) {
    const versions = [
      {
        _id: 'ver_1',
        documentId: 'doc_getting_started',
        versionNumber: 1,
        name: 'Initial Draft',
        description: 'First draft created with initial welcome content',
        data: { ops: [{ insert: 'Welcome to Docora\n' }] },
        authorId: 'usr_admin',
        authorName: 'Alex Vance',
        createdAt: new Date(Date.now() - 14 * 86400000),
      },
      {
        _id: 'ver_2',
        documentId: 'doc_getting_started',
        versionNumber: 2,
        name: 'Added Shortcuts & Slash Menu',
        description: 'Documented slash commands and keyboard shortcuts',
        data: memoryStore.documents.get('doc_getting_started')?.data || {},
        authorId: 'usr_sarah',
        authorName: 'Sarah Connor',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
    ];
    versions.forEach((v) => memoryStore.versions.set(v._id, v));
    saveCollection('versions');
  }

  if (memoryStore.activities.size === 0) {
    const activities = [
      {
        _id: 'act_1',
        workspaceId: 'ws_default',
        userId: 'usr_admin',
        userName: 'Alex Vance',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        action: 'edited',
        targetType: 'document',
        targetId: 'doc_getting_started',
        targetTitle: 'Welcome to Docora: Intelligent Document Workspace',
        metadata: { wordCount: 164 },
        createdAt: new Date(Date.now() - 15 * 60000),
      },
      {
        _id: 'act_2',
        workspaceId: 'ws_default',
        userId: 'usr_sarah',
        userName: 'Sarah Connor',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        action: 'commented',
        targetType: 'document',
        targetId: 'doc_getting_started',
        targetTitle: 'Welcome to Docora: Intelligent Document Workspace',
        metadata: { snippet: 'The new slash commands menu makes formatting blocks so much faster!' },
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        _id: 'act_3',
        workspaceId: 'ws_default',
        userId: 'usr_marcus',
        userName: 'Marcus Miller',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        action: 'starred',
        targetType: 'document',
        targetId: 'doc_arch_spec',
        targetTitle: 'Docora SaaS Architecture & System Design',
        metadata: {},
        createdAt: new Date(Date.now() - 5 * 3600000),
      },
      {
        _id: 'act_4',
        workspaceId: 'ws_default',
        userId: 'usr_admin',
        userName: 'Alex Vance',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        action: 'created',
        targetType: 'document',
        targetId: 'doc_brand_guide',
        targetTitle: 'Docora Brand Design System & Typography Guidelines',
        metadata: {},
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
      {
        _id: 'act_5',
        workspaceId: 'ws_default',
        userId: 'usr_admin',
        userName: 'Alex Vance',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        action: 'created',
        targetType: 'folder',
        targetId: 'fld_design',
        targetTitle: 'Design System & UI',
        metadata: {},
        createdAt: new Date(Date.now() - 25 * 86400000),
      },
    ];
    activities.forEach((a) => memoryStore.activities.set(a._id, a));
    saveCollection('activities');
  }

  if (memoryStore.notifications.size === 0) {
    const notifs = [
      {
        _id: 'notif_1',
        userId: 'usr_admin',
        title: 'New comment on Welcome Guide',
        message: 'Sarah Connor left a comment on "Welcome to Docora".',
        type: 'comment',
        read: false,
        link: '/documents/doc_getting_started',
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        _id: 'notif_2',
        userId: 'usr_admin',
        title: 'Team Member Joined',
        message: 'Elena Rostova accepted your workspace invitation.',
        type: 'info',
        read: true,
        link: '/settings/workspace',
        createdAt: new Date(Date.now() - 24 * 3600000),
      },
    ];
    notifs.forEach((n) => memoryStore.notifications.set(n._id, n));
    saveCollection('notifications');
  }
}

initializeSeedData();

// Data access operations that work transparently across MongoDB & Memory Store
const dataService = {
  // Document Operations
  async findDocumentById(id) {
    if (getIsConnected()) {
      try {
        const doc = await Document.findById(id).lean();
        if (doc) return doc;
      } catch (err) {
        // fallback
      }
    }
    return memoryStore.documents.get(id) || null;
  },

  async findOrCreateDocument(id, initialData = '') {
    if (!id) return null;
    let doc = await this.findDocumentById(id);
    if (doc) return doc;

    const newDoc = {
      _id: id,
      title: 'Untitled Document',
      data: initialData,
      ownerId: 'usr_admin',
      ownerName: 'Alex Vance',
      ownerEmail: 'alex.vance@docora.internal',
      workspaceId: 'ws_default',
      folderId: null,
      isStarred: false,
      isArchived: false,
      isDeleted: false,
      deletedAt: null,
      tags: [],
      icon: '📄',
      coverImage: '',
      wordCount: 0,
      characterCount: 0,
      sharing: {
        isPublic: false,
        publicRole: 'viewer',
        shareToken: '',
        password: '',
        expiresAt: null,
        allowComments: true,
        allowDownload: true,
        collaborators: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (getIsConnected()) {
      try {
        await Document.create(newDoc);
      } catch (err) {
        // fallback
      }
    }
    memoryStore.documents.set(id, newDoc);
    saveCollection('documents');
    return newDoc;
  },

  async updateDocument(id, updates) {
    updates.updatedAt = new Date();
    if (getIsConnected()) {
      try {
        await Document.findByIdAndUpdate(id, updates, { new: true });
      } catch (err) {
        // fallback
      }
    }
    const current = memoryStore.documents.get(id) || { _id: id, createdAt: new Date() };
    const merged = { ...current, ...updates };
    memoryStore.documents.set(id, merged);
    saveCollection('documents');
    return merged;
  },

  async listDocuments(query = {}) {
    let docs = [];
    if (getIsConnected()) {
      try {
        const filter = {};
        if (query.workspaceId) filter.workspaceId = query.workspaceId;
        if (query.folderId !== undefined) filter.folderId = query.folderId === 'null' ? null : query.folderId;
        if (query.isStarred !== undefined) filter.isStarred = query.isStarred === 'true' || query.isStarred === true;
        if (query.isArchived !== undefined) filter.isArchived = query.isArchived === 'true' || query.isArchived === true;
        if (query.isDeleted !== undefined) filter.isDeleted = query.isDeleted === 'true' || query.isDeleted === true;
        docs = await Document.find(filter).sort({ updatedAt: -1 }).lean();
        if (docs.length > 0) return docs;
      } catch (err) {
        // fallback
      }
    }

    docs = Array.from(memoryStore.documents.values());
    return docs.filter((d) => {
      if (query.workspaceId && d.workspaceId !== query.workspaceId) return false;
      if (query.folderId !== undefined) {
        const target = query.folderId === 'null' ? null : query.folderId;
        if (d.folderId !== target) return false;
      }
      if (query.isStarred !== undefined) {
        const expected = query.isStarred === 'true' || query.isStarred === true;
        if (Boolean(d.isStarred) !== expected) return false;
      }
      if (query.isArchived !== undefined) {
        const expected = query.isArchived === 'true' || query.isArchived === true;
        if (Boolean(d.isArchived) !== expected) return false;
      }
      if (query.isDeleted !== undefined) {
        const expected = query.isDeleted === 'true' || query.isDeleted === true;
        if (Boolean(d.isDeleted) !== expected) return false;
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        const titleMatch = (d.title || '').toLowerCase().includes(s);
        const tagMatch = (d.tags || []).some((t) => t.toLowerCase().includes(s));
        if (!titleMatch && !tagMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  },

  async deleteDocument(id, permanent = false) {
    if (permanent) {
      if (getIsConnected()) {
        try {
          await Document.findByIdAndDelete(id);
        } catch (e) {}
      }
      memoryStore.documents.delete(id);
      saveCollection('documents');
      return true;
    } else {
      return this.updateDocument(id, { isDeleted: true, deletedAt: new Date() });
    }
  },

  // Folder Operations
  async listFolders(workspaceId = 'ws_default') {
    return Array.from(memoryStore.folders.values()).filter((f) => !workspaceId || f.workspaceId === workspaceId);
  },

  async createFolder(folder) {
    memoryStore.folders.set(folder._id, folder);
    saveCollection('folders');
    return folder;
  },

  async updateFolder(id, updates) {
    const current = memoryStore.folders.get(id);
    if (!current) return null;
    const merged = { ...current, ...updates, updatedAt: new Date() };
    memoryStore.folders.set(id, merged);
    saveCollection('folders');
    return merged;
  },

  async deleteFolder(id) {
    memoryStore.folders.delete(id);
    saveCollection('folders');
    return true;
  },

  // Workspace Operations
  async getWorkspace(id = 'ws_default') {
    return memoryStore.workspaces.get(id) || null;
  },

  async updateWorkspace(id, updates) {
    const current = memoryStore.workspaces.get(id);
    if (!current) return null;
    const merged = { ...current, ...updates, updatedAt: new Date() };
    memoryStore.workspaces.set(id, merged);
    saveCollection('workspaces');
    return merged;
  },

  // Users & Auth
  async findUserByEmail(email) {
    return Array.from(memoryStore.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id) {
    return memoryStore.users.get(id) || null;
  },

  async createUser(user) {
    memoryStore.users.set(user._id, user);
    saveCollection('users');
    return user;
  },

  async updateUser(id, updates) {
    const current = memoryStore.users.get(id);
    if (!current) return null;
    const merged = { ...current, ...updates, updatedAt: new Date() };
    memoryStore.users.set(id, merged);
    saveCollection('users');
    return merged;
  },

  // Comments
  async listComments(documentId) {
    return Array.from(memoryStore.comments.values())
      .filter((c) => c.documentId === documentId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async createComment(comment) {
    memoryStore.comments.set(comment._id, comment);
    saveCollection('comments');
    return comment;
  },

  async updateComment(id, updates) {
    const current = memoryStore.comments.get(id);
    if (!current) return null;
    const merged = { ...current, ...updates };
    memoryStore.comments.set(id, merged);
    saveCollection('comments');
    return merged;
  },

  async deleteComment(id) {
    memoryStore.comments.delete(id);
    saveCollection('comments');
    return true;
  },

  // Version Control
  async listVersions(documentId) {
    return Array.from(memoryStore.versions.values())
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  async createVersion(version) {
    memoryStore.versions.set(version._id, version);
    saveCollection('versions');
    return version;
  },

  // Activities
  async listActivities(workspaceId = 'ws_default', limit = 20) {
    return Array.from(memoryStore.activities.values())
      .filter((a) => !workspaceId || a.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  async logActivity(activity) {
    memoryStore.activities.set(activity._id, activity);
    saveCollection('activities');
    return activity;
  },

  // Files
  async listFiles(workspaceId = 'ws_default') {
    return Array.from(memoryStore.files.values()).filter((f) => !workspaceId || f.workspaceId === workspaceId);
  },

  async saveFileAttachment(file) {
    memoryStore.files.set(file._id, file);
    saveCollection('files');
    return file;
  },

  async deleteFileAttachment(id) {
    memoryStore.files.delete(id);
    saveCollection('files');
    return true;
  },

  // Notifications
  async listNotifications(userId = 'usr_admin') {
    return Array.from(memoryStore.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async markNotificationRead(id) {
    const notif = memoryStore.notifications.get(id);
    if (notif) {
      notif.read = true;
      saveCollection('notifications');
    }
    return notif;
  },
};

module.exports = dataService;
