const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Get comments for a document
router.get('/:documentId', async (req, res) => {
  try {
    const comments = await dataService.listComments(req.params.documentId);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create comment
router.post('/:documentId', async (req, res) => {
  try {
    const { content, highlightedText, position } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    const newComment = {
      _id: `cmt_${Date.now()}`,
      documentId: req.params.documentId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      content,
      highlightedText: highlightedText || '',
      position: position || { index: 0, length: 0 },
      resolved: false,
      resolvedBy: null,
      replies: [],
      createdAt: new Date(),
    };

    const created = await dataService.createComment(newComment);
    res.status(201).json({ comment: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to comment
router.post('/:documentId/:commentId/reply', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Reply content is required' });

    const comments = await dataService.listComments(req.params.documentId);
    const comment = comments.find((c) => c._id === req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = {
      _id: `rpl_${Date.now()}`,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      content,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await dataService.updateComment(comment._id, { replies: comment.replies });
    res.status(201).json({ reply, comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle resolve
router.patch('/:documentId/:commentId/resolve', async (req, res) => {
  try {
    const comments = await dataService.listComments(req.params.documentId);
    const comment = comments.find((c) => c._id === req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const resolved = !comment.resolved;
    const resolvedBy = resolved ? req.user.name : null;
    const updated = await dataService.updateComment(comment._id, { resolved, resolvedBy });
    res.json({ comment: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:documentId/:commentId', async (req, res) => {
  try {
    await dataService.deleteComment(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
