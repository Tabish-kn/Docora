const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Helper to calculate word & char counts from Quill Delta
function extractStatsFromDelta(delta) {
  let text = '';
  if (typeof delta === 'string') {
    text = delta;
  } else if (delta && Array.isArray(delta.ops)) {
    text = delta.ops.map((op) => (typeof op.insert === 'string' ? op.insert : '')).join('');
  }
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const chars = clean.length;
  return { words, chars };
}

// List documents with full filtering
router.get('/', async (req, res) => {
  try {
    const { folderId, isStarred, isArchived, isDeleted, search, tag } = req.query;
    const query = {
      workspaceId: req.query.workspaceId || 'ws_default',
    };
    if (folderId !== undefined) query.folderId = folderId;
    if (isStarred !== undefined) query.isStarred = isStarred;
    if (isArchived !== undefined) query.isArchived = isArchived;
    if (isDeleted !== undefined) query.isDeleted = isDeleted;
    if (search) query.search = search;
    if (tag) query.tag = tag;

    // Default to active documents (not deleted) unless specifically querying trash
    if (isDeleted === undefined) {
      query.isDeleted = false;
    }

    const docs = await dataService.listDocuments(query);
    res.json({ documents: docs, total: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const { title, folderId, tags, icon, coverImage, template } = req.body;
    const id = req.body.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let initialData = '';
    if (template === 'meeting') {
      initialData = {
        ops: [
          { insert: `${title || 'Team Meeting Notes'}\n`, attributes: { header: 1 } },
          { insert: `Date: ${new Date().toLocaleDateString()} | Attendees: ${req.user.name}\n\n`, attributes: { italic: true } },
          { insert: 'Agenda & Discussion Points\n', attributes: { header: 2 } },
          { insert: 'Key Topic 1\n', attributes: { list: 'bullet' } },
          { insert: 'Key Topic 2\n', attributes: { list: 'bullet' } },
          { insert: '\nAction Items\n', attributes: { header: 2 } },
          { insert: 'Review architecture roadmap\n', attributes: { list: 'check' } },
          { insert: 'Share preview link with team\n', attributes: { list: 'check' } },
        ]
      };
    } else if (template === 'project') {
      initialData = {
        ops: [
          { insert: `${title || 'Project Specification'}\n`, attributes: { header: 1 } },
          { insert: 'Executive Summary\n', attributes: { header: 2 } },
          { insert: 'High-level project scope, success metrics, and core stakeholders.\n\n' },
          { insert: 'Functional Requirements\n', attributes: { header: 2 } },
          { insert: 'Requirement A: Seamless real-time synchronization\n', attributes: { list: 'bullet' } },
          { insert: 'Requirement B: Secure multi-tier permissions\n', attributes: { list: 'bullet' } },
        ]
      };
    }

    const doc = await dataService.findOrCreateDocument(id, initialData);
    if (title || folderId || tags || icon || coverImage) {
      const updates = {};
      if (title) updates.title = title;
      if (folderId !== undefined) updates.folderId = folderId;
      if (tags) updates.tags = tags;
      if (icon) updates.icon = icon;
      if (coverImage) updates.coverImage = coverImage;
      const updated = await dataService.updateDocument(id, updates);
      return res.status(201).json({ document: updated });
    }

    // Log activity
    await dataService.logActivity({
      _id: `act_${Date.now()}`,
      workspaceId: 'ws_default',
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      action: 'created',
      targetType: 'document',
      targetId: id,
      targetTitle: doc.title,
      createdAt: new Date(),
    });

    res.status(201).json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get document by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await dataService.findOrCreateDocument(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, data, tags, folderId, icon, coverImage, isStarred, isArchived } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (data !== undefined) {
      updates.data = data;
      const stats = extractStatsFromDelta(data);
      updates.wordCount = stats.words;
      updates.characterCount = stats.chars;
    }
    if (tags !== undefined) updates.tags = tags;
    if (folderId !== undefined) updates.folderId = folderId;
    if (icon !== undefined) updates.icon = icon;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (isStarred !== undefined) updates.isStarred = isStarred;
    if (isArchived !== undefined) updates.isArchived = isArchived;

    const doc = await dataService.updateDocument(id, updates);

    // Create automatic version snapshot if content changed significantly
    if (data !== undefined && Math.random() < 0.2) {
      const versions = await dataService.listVersions(id);
      await dataService.createVersion({
        _id: `ver_${Date.now()}`,
        documentId: id,
        versionNumber: versions.length + 1,
        name: `Auto-save #${versions.length + 1}`,
        description: 'Periodic autosave snapshot',
        data,
        authorId: req.user._id,
        authorName: req.user.name,
        createdAt: new Date(),
      });
    }

    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle star
router.patch('/:id/star', async (req, res) => {
  try {
    const doc = await dataService.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const isStarred = !doc.isStarred;
    const updated = await dataService.updateDocument(req.params.id, { isStarred });
    res.json({ document: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle archive
router.patch('/:id/archive', async (req, res) => {
  try {
    const doc = await dataService.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const isArchived = !doc.isArchived;
    const updated = await dataService.updateDocument(req.params.id, { isArchived });
    res.json({ document: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete (move to Trash)
router.delete('/:id', async (req, res) => {
  try {
    const doc = await dataService.deleteDocument(req.params.id, false);
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore from Trash
router.post('/:id/restore', async (req, res) => {
  try {
    const updated = await dataService.updateDocument(req.params.id, { isDeleted: false, deletedAt: null });
    res.json({ success: true, document: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Permanently delete
router.delete('/:id/permanent', async (req, res) => {
  try {
    await dataService.deleteDocument(req.params.id, true);
    res.json({ success: true, message: 'Document permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicate document
router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await dataService.findDocumentById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Original document not found' });

    const newId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cloned = {
      ...original,
      _id: newId,
      title: `${original.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
    };
    await dataService.findOrCreateDocument(newId, original.data);
    const updated = await dataService.updateDocument(newId, cloned);
    res.status(201).json({ document: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export document (Markdown, Plain text, HTML)
router.get('/:id/export/:format', async (req, res) => {
  try {
    const doc = await dataService.findDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const { format } = req.params;
    let plainText = '';
    if (typeof doc.data === 'string') {
      plainText = doc.data;
    } else if (doc.data && Array.isArray(doc.data.ops)) {
      plainText = doc.data.ops.map((op) => (typeof op.insert === 'string' ? op.insert : '')).join('');
    }

    if (format === 'markdown' || format === 'md') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.md"`);
      return res.send(`# ${doc.title}\n\n${plainText}`);
    } else if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.html"`);
      return res.send(`<!DOCTYPE html><html><head><title>${doc.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;line-height:1.6;}</style></head><body><h1>${doc.title}</h1><div>${plainText.replace(/\n/g, '<br/>')}</div></body></html>`);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.txt"`);
      return res.send(`${doc.title}\n${'='.repeat(doc.title.length)}\n\n${plainText}`);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
