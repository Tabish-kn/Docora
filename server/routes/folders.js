const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// List folders
router.get('/', async (req, res) => {
  try {
    const folders = await dataService.listFolders('ws_default');
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create folder
router.post('/', async (req, res) => {
  try {
    const { name, color, icon, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const newFolder = {
      _id: `fld_${Date.now()}`,
      name,
      color: color || '#7657E8',
      icon: icon || '📁',
      parentId: parentId || null,
      workspaceId: 'ws_default',
      ownerId: req.user._id,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await dataService.createFolder(newFolder);
    res.status(201).json({ folder: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const { name, color, icon, isFavorite } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (isFavorite !== undefined) updates.isFavorite = isFavorite;

    const updated = await dataService.updateFolder(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Folder not found' });
    res.json({ folder: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    await dataService.deleteFolder(req.params.id);
    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
