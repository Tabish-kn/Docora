const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Get current workspace
router.get('/current', async (req, res) => {
  try {
    const ws = await dataService.getWorkspace('ws_default');
    res.json({ workspace: ws });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List user workspaces
router.get('/', async (req, res) => {
  try {
    const ws = await dataService.getWorkspace('ws_default');
    res.json({ workspaces: [ws] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update workspace
router.put('/current', async (req, res) => {
  try {
    const { name, slug, logo, plan } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (logo) updates.logo = logo;
    if (plan) updates.plan = plan;

    const updated = await dataService.updateWorkspace('ws_default', updates);
    res.json({ workspace: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invite member
router.post('/current/members', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const ws = await dataService.getWorkspace('ws_default');
    const existingMember = ws.members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      return res.status(409).json({ error: 'Member already in workspace' });
    }

    const newMember = {
      userId: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=7657E8`,
      role: role || 'editor',
      joinedAt: new Date(),
    };

    ws.members.push(newMember);
    await dataService.updateWorkspace('ws_default', { members: ws.members });
    res.status(201).json({ member: newMember, members: ws.members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member role
router.patch('/current/members/:userId', async (req, res) => {
  try {
    const { role } = req.body;
    const ws = await dataService.getWorkspace('ws_default');
    const member = ws.members.find((m) => m.userId === req.params.userId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.role = role;
    await dataService.updateWorkspace('ws_default', { members: ws.members });
    res.json({ members: ws.members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member
router.delete('/current/members/:userId', async (req, res) => {
  try {
    const ws = await dataService.getWorkspace('ws_default');
    const filtered = ws.members.filter((m) => m.userId !== req.params.userId);
    await dataService.updateWorkspace('ws_default', { members: filtered });
    res.json({ success: true, members: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
