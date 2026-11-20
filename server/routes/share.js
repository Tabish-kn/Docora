const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Get document share settings
router.get('/:id', async (req, res) => {
  try {
    const doc = await dataService.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    res.json({
      sharing: doc.sharing || {
        isPublic: false,
        publicRole: 'viewer',
        shareToken: '',
        password: '',
        expiresAt: null,
        allowComments: true,
        allowDownload: true,
        collaborators: [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document share settings
router.put('/:id', async (req, res) => {
  try {
    const { isPublic, publicRole, password, expiresAt, allowComments, allowDownload, collaborators } = req.body;
    const doc = await dataService.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    let shareToken = doc.sharing?.shareToken;
    if (!shareToken) {
      shareToken = `docora_sh_${Math.random().toString(36).substring(2, 10)}`;
    }

    const sharing = {
      isPublic: isPublic !== undefined ? isPublic : doc.sharing?.isPublic || false,
      publicRole: publicRole || doc.sharing?.publicRole || 'viewer',
      shareToken,
      password: password !== undefined ? password : doc.sharing?.password || '',
      expiresAt: expiresAt !== undefined ? expiresAt : doc.sharing?.expiresAt || null,
      allowComments: allowComments !== undefined ? allowComments : doc.sharing?.allowComments !== false,
      allowDownload: allowDownload !== undefined ? allowDownload : doc.sharing?.allowDownload !== false,
      collaborators: collaborators || doc.sharing?.collaborators || [],
    };

    const updated = await dataService.updateDocument(req.params.id, { sharing });
    res.json({ sharing: updated.sharing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Access public document by token
router.get('/public/:token', async (req, res) => {
  try {
    const docs = await dataService.listDocuments();
    const doc = docs.find((d) => d.sharing?.shareToken === req.params.token);
    if (!doc) return res.status(404).json({ error: 'Shared document not found or link expired' });

    if (!doc.sharing.isPublic) {
      return res.status(403).json({ error: 'This document is no longer publicly shared' });
    }

    if (doc.sharing.expiresAt && new Date(doc.sharing.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }

    // Don't return password hash to client
    const safeDoc = {
      ...doc,
      sharing: {
        ...doc.sharing,
        passwordRequired: Boolean(doc.sharing.password),
        password: '',
      },
    };

    res.json({ document: safeDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
