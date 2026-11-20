const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dataService = require('../services/dataService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload multiple files or single file
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const savedFiles = [];
    for (const file of req.files) {
      const fileRecord = {
        _id: `fil_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        documentId: req.body.documentId || null,
        workspaceId: 'ws_default',
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        uploadedBy: req.user.name,
        uploadedById: req.user._id,
        createdAt: new Date(),
      };
      await dataService.saveFileAttachment(fileRecord);
      savedFiles.push(fileRecord);
    }

    res.status(201).json({ files: savedFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List files
router.get('/', async (req, res) => {
  try {
    const files = await dataService.listFiles('ws_default');
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
router.delete('/:id', async (req, res) => {
  try {
    const files = await dataService.listFiles('ws_default');
    const target = files.find((f) => f._id === req.params.id);
    if (target) {
      const filePath = path.join(uploadsDir, target.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
      await dataService.deleteFileAttachment(req.params.id);
    }
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
