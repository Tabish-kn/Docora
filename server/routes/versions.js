const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Get versions
router.get('/:documentId', async (req, res) => {
  try {
    const versions = await dataService.listVersions(req.params.documentId);
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create named version snapshot
router.post('/:documentId', async (req, res) => {
  try {
    const { name, description } = req.body;
    const doc = await dataService.findDocumentById(req.params.documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const existing = await dataService.listVersions(req.params.documentId);
    const versionNumber = existing.length + 1;

    const newVersion = {
      _id: `ver_${Date.now()}`,
      documentId: req.params.documentId,
      versionNumber,
      name: name || `Version ${versionNumber}`,
      description: description || 'Manual snapshot created',
      data: doc.data,
      authorId: req.user._id,
      authorName: req.user.name,
      createdAt: new Date(),
    };

    const created = await dataService.createVersion(newVersion);
    res.status(201).json({ version: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore version
router.post('/:documentId/restore/:versionId', async (req, res) => {
  try {
    const versions = await dataService.listVersions(req.params.documentId);
    const target = versions.find((v) => v._id === req.params.versionId);
    if (!target) return res.status(404).json({ error: 'Target version not found' });

    // Update document content to this version
    const updated = await dataService.updateDocument(req.params.documentId, {
      data: target.data,
      updatedAt: new Date(),
    });

    // Create a new version recording the restore action
    await dataService.createVersion({
      _id: `ver_${Date.now()}`,
      documentId: req.params.documentId,
      versionNumber: versions.length + 1,
      name: `Restored to ${target.name || `v${target.versionNumber}`}`,
      description: `Reverted back to snapshot from ${new Date(target.createdAt).toLocaleString()}`,
      data: target.data,
      authorId: req.user._id,
      authorName: req.user.name,
      createdAt: new Date(),
    });

    res.json({ success: true, document: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
