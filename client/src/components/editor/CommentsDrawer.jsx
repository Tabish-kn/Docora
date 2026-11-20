import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  CheckCircle,
  CornerDownRight,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const CommentsDrawer = ({ isOpen, onClose, documentId, selectedText, onCommentAdded }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [filterResolved, setFilterResolved] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      loadComments();
    }
  }, [isOpen, documentId]);

  const loadComments = async () => {
    try {
      const res = await api.getComments(documentId);
      setComments(res.comments || []);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    }
  };

  if (!isOpen) return null;

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await api.createComment(documentId, {
        content: newCommentText.trim(),
        highlightedText: selectedText || '',
      });
      setComments((prev) => [...prev, res.comment]);
      setNewCommentText('');
      showToast('Comment posted', 'success');
      onCommentAdded?.(res.comment);
    } catch (err) {
      showToast('Failed to post comment', 'error');
    }
  };

  const handleReplySubmit = async (commentId) => {
    const text = replyTexts[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.replyComment(documentId, commentId, { content: text.trim() });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.comment : c))
      );
      setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      showToast('Reply added', 'success');
    } catch (err) {
      showToast('Failed to add reply', 'error');
    }
  };

  const handleToggleResolve = async (commentId) => {
    try {
      const res = await api.resolveComment(documentId, commentId);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.comment : c))
      );
      showToast(res.comment.resolved ? 'Comment resolved' : 'Comment re-opened', 'info');
    } catch (err) {
      showToast('Failed to toggle comment resolution', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(documentId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast('Comment deleted', 'info');
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  const displayedComments = comments.filter((c) => (filterResolved ? true : !c.resolved));

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-[#191728] border-l border-[#EAE8F0] dark:border-[#282440] shadow-floating z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8F0] dark:border-[#282440]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#7657E8]" />
          <span className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
            Comments & Discussions ({comments.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter resolved toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#141221] text-[11px] text-[#77738B]">
        <span>Show resolved ({comments.filter((c) => c.resolved).length})</span>
        <input
          type="checkbox"
          checked={filterResolved}
          onChange={(e) => setFilterResolved(e.target.checked)}
          className="accent-[#7657E8] rounded"
        />
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {displayedComments.length === 0 ? (
          <div className="py-16 text-center text-[#77738B] dark:text-[#A39EBC]">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#7657E8]" />
            <p>No active comments on this document.</p>
            <p className="text-[11px] mt-1">Select text or use the box below to start a thread.</p>
          </div>
        ) : (
          displayedComments.map((comment) => (
            <div
              key={comment._id}
              className={`p-3.5 rounded-xl border transition-colors ${
                comment.resolved
                  ? 'border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 opacity-75'
                  : 'border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#1E1B2E]'
              }`}
            >
              {/* Highlighted text snippet */}
              {comment.highlightedText && (
                <div className="text-[11px] font-medium text-[#7657E8] border-l-2 border-[#7657E8] pl-2 mb-2 italic">
                  "{comment.highlightedText}"
                </div>
              )}

              {/* Author & Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar src={comment.userAvatar} name={comment.userName} size="xs" />
                  <span className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                    {comment.userName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#77738B]">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleToggleResolve(comment._id)}
                    className="p-1 hover:text-emerald-600 transition-colors"
                    title={comment.resolved ? 'Reopen' : 'Mark resolved'}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        comment.resolved ? 'text-emerald-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-1 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs text-[#242039] dark:text-[#F1EFFF] leading-relaxed">
                {comment.content}
              </p>

              {/* Reply threads */}
              {(comment.replies || []).length > 0 && (
                <div className="mt-3 pl-3 border-l-2 border-[#EAE8F0] dark:border-[#282440] space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#242039] dark:text-[#F1EFFF]">
                        <span>{reply.userName}</span>
                        <span className="text-[9px] text-[#77738B] font-normal">
                          {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#5B5675] dark:text-[#B6B1CE] mt-0.5">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input trigger */}
              <div className="mt-3 pt-2 border-t border-[#EAE8F0]/60 dark:border-[#282440]/60">
                {activeReplyId === comment._id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyTexts[comment._id] || ''}
                      onChange={(e) =>
                        setReplyTexts({ ...replyTexts, [comment._id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)}
                      className="flex-1 py-1 px-2.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#161424] text-xs focus:outline-none focus:border-[#7657E8]"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReplySubmit(comment._id)}
                    >
                      Reply
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReplyId(comment._id)}
                    className="text-[11px] text-[#7657E8] font-medium hover:underline flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" /> Reply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form Footer */}
      <form onSubmit={handleCreateComment} className="p-3 border-t border-[#EAE8F0] dark:border-[#282440] space-y-2">
        {selectedText && (
          <div className="text-[11px] text-[#7657E8] truncate bg-[#F0EDFF] dark:bg-[#7657E8]/20 px-2 py-1 rounded">
            Commenting on: "{selectedText}"
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a comment or @mention..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 py-2 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none focus:border-[#7657E8]"
          />
          <Button type="submit" variant="primary" size="sm" disabled={!newCommentText.trim()}>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommentsDrawer;
