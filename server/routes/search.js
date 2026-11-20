const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || !q.trim()) {
      return res.json({ documents: [], folders: [], total: 0 });
    }

    const query = q.toLowerCase().trim();
    const docs = await dataService.listDocuments({ workspaceId: 'ws_default', isDeleted: false });
    const folders = await dataService.listFolders('ws_default');

    const matchedDocs = docs.filter((d) => {
      const titleMatch = (d.title || '').toLowerCase().includes(query);
      const tagMatch = (d.tags || []).some((t) => t.toLowerCase().includes(query));
      let contentMatch = false;
      if (typeof d.data === 'string') {
        contentMatch = d.data.toLowerCase().includes(query);
      } else if (d.data?.ops) {
        const text = d.data.ops.map((o) => (typeof o.insert === 'string' ? o.insert : '')).join('');
        contentMatch = text.toLowerCase().includes(query);
      }
      return titleMatch || tagMatch || contentMatch;
    }).map((d) => ({
      ...d,
      matchedField: (d.title || '').toLowerCase().includes(query) ? 'title' : 'content',
    }));

    const matchedFolders = folders.filter((f) => (f.name || '').toLowerCase().includes(query));

    res.json({
      documents: matchedDocs,
      folders: matchedFolders,
      total: matchedDocs.length + matchedFolders.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
