require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { connectToDatabase } = require('./db');
const dataService = require('./services/dataService');
const { authMiddleware } = require('./middleware/auth');

// Initialize database (with auto-resilient fallback)
connectToDatabase();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Attach auth middleware to API routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/versions', require('./routes/versions'));
app.use('/api/files', require('./routes/files'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/share', require('./routes/share'));
app.use('/api/search', require('./routes/search'));
app.use('/api/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'Docora',
    version: '2.0.0-saas',
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO Server Setup (Attached to Express HTTP server)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Active presence tracking: Map<documentId, Map<socketId, UserPresence>>
const presenceMap = new Map();

io.on('connection', (socket) => {
  let currentDocumentId = null;
  let currentUser = null;

  // Preserved backwards-compatible event: get-document
  socket.on('get-document', async (documentId) => {
    if (!documentId) return;
    currentDocumentId = documentId;
    const document = await dataService.findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    // Send current active collaborators in this document room
    const roomPresence = presenceMap.get(documentId);
    const usersInRoom = roomPresence ? Array.from(roomPresence.values()) : [];
    socket.emit('presence-state', usersInRoom);

    // Preserved backwards-compatible event: send-changes
    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    // Preserved backwards-compatible event: save-document
    socket.on('save-document', async (data) => {
      await dataService.updateDocument(documentId, { data });
    });
  });

  // Real-time Collaboration: User Presence Tracking
  socket.on('join-presence', ({ documentId, user }) => {
    if (!documentId || !user) return;
    currentDocumentId = documentId;
    currentUser = {
      socketId: socket.id,
      userId: user.id || user._id || 'guest',
      name: user.name || 'Anonymous Collaborator',
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Guest')}`,
      color: user.color || '#7657E8',
      joinedAt: new Date(),
    };

    if (!presenceMap.has(documentId)) {
      presenceMap.set(documentId, new Map());
    }
    presenceMap.get(documentId).set(socket.id, currentUser);

    socket.join(documentId);
    const users = Array.from(presenceMap.get(documentId).values());
    io.to(documentId).emit('presence-state', users);
    socket.broadcast.to(documentId).emit('user-joined', currentUser);
  });

  // Real-time Collaboration: Live Cursors
  socket.on('cursor-move', ({ documentId, cursor, user }) => {
    if (!documentId) return;
    socket.broadcast.to(documentId).emit('cursor-update', {
      socketId: socket.id,
      user,
      cursor,
    });
  });

  // Real-time Collaboration: Live Comments Broadcast
  socket.on('send-comment', ({ documentId, comment }) => {
    if (!documentId) return;
    socket.broadcast.to(documentId).emit('new-comment', comment);
  });

  // Handle Disconnection
  socket.on('disconnect', () => {
    if (currentDocumentId && presenceMap.has(currentDocumentId)) {
      const room = presenceMap.get(currentDocumentId);
      const leavingUser = room.get(socket.id);
      room.delete(socket.id);
      if (room.size === 0) {
        presenceMap.delete(currentDocumentId);
      } else {
        io.to(currentDocumentId).emit('presence-state', Array.from(room.values()));
      }
      if (leavingUser) {
        socket.broadcast.to(currentDocumentId).emit('user-left', leavingUser);
      }
    }
  });
});

// Error handling
io.on('error', (err) => {
  console.error('Socket.IO error:', err);
});

server.listen(PORT, () => {
  console.log(`Docora unified REST and Socket.IO server running on port ${PORT}`);
});

module.exports = { app, server };
