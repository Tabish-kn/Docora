const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DocNest';
let isConnected = false;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log('Successfully connected to MongoDB:', MONGODB_URI);
  } catch (err) {
    console.warn('MongoDB connection failed or not available:', err.message);
    console.log('Docora resilient memory/disk fallback activated.');
  }
};

// Simple embedded persistence fallback to ensure Docora functions 100% reliably in any environment
const dataDir = path.join(__dirname, 'data_store');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

const memoryStore = {
  users: new Map(),
  workspaces: new Map(),
  documents: new Map(),
  folders: new Map(),
  comments: new Map(),
  versions: new Map(),
  activities: new Map(),
  files: new Map(),
  notifications: new Map(),
};

// Load existing persisted files if any
const loadCollection = (name) => {
  const filePath = path.join(dataDir, `${name}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const items = JSON.parse(raw);
      const map = new Map();
      items.forEach((item) => map.set(item._id || item.id, item));
      memoryStore[name] = map;
    } catch (e) {
      console.error(`Failed to load ${name} store:`, e);
    }
  }
};

['users', 'workspaces', 'documents', 'folders', 'comments', 'versions', 'activities', 'files', 'notifications'].forEach(loadCollection);

const saveCollection = (name) => {
  try {
    const filePath = path.join(dataDir, `${name}.json`);
    const items = Array.from(memoryStore[name].values());
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    // best-effort
  }
};

module.exports = {
  connectToDatabase,
  getIsConnected: () => isConnected,
  memoryStore,
  saveCollection,
};
