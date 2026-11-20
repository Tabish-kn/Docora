import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  Shield,
  Clock,
  Eye,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ShareModal = ({ isOpen, onClose, documentId, documentTitle }) => {
  const [sharing, setSharing] = useState({
    isPublic: false,
    publicRole: 'viewer',
    shareToken: '',
    password: '',
    expiresAt: null,
    collaborators: [],
  });
  const [emailInvite, setEmailInvite] = useState('');
  const [roleInvite, setRoleInvite] = useState('editor');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      api.getShareSettings(documentId).then((res) => {
        if (res.sharing) setSharing(res.sharing);
      });
    }
  }, [isOpen, documentId]);

  const publicUrl = `${window.location.origin}/share/${sharing.shareToken || documentId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast('Share link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTogglePublic = async () => {
    const updated = { ...sharing, isPublic: !sharing.isPublic };
    setSharing(updated);
    await api.updateShareSettings(documentId, updated);
    showToast(updated.isPublic ? 'Public link enabled' : 'Public link disabled', 'info');
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!emailInvite.trim()) return;

    const newCollaborator = {
      userId: `collab_${Date.now()}`,
      email: emailInvite.trim(),
      name: emailInvite.split('@')[0],
      role: roleInvite,
    };

    const updated = {
      ...sharing,
      collaborators: [...(sharing.collaborators || []), newCollaborator],
    };
    setSharing(updated);
    setEmailInvite('');
    await api.updateShareSettings(documentId, updated);
    showToast(`Invited ${newCollaborator.email}`, 'success');
  };

  const handleRemoveCollaborator = async (email) => {
    const filtered = (sharing.collaborators || []).filter((c) => c.email !== email);
    const updated = { ...sharing, collaborators: filtered };
    setSharing(updated);
    await api.updateShareSettings(documentId, updated);
    showToast('Collaborator removed', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${documentTitle || 'Document'}"`}
      description="Manage collaborator permissions and secure public links."
      maxWidth="max-w-md"
    >
      <div className="space-y-5 text-xs">
        {/* Email invite form */}
        <form onSubmit={handleAddCollaborator} className="flex gap-2">
          <input
            type="email"
            placeholder="Invite by email address..."
            value={emailInvite}
            onChange={(e) => setEmailInvite(e.target.value)}
            className="flex-1 py-2 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-[#242039] dark:text-[#F1EFFF] focus:outline-none focus:border-[#7657E8]"
            required
          />
          <select
            value={roleInvite}
            onChange={(e) => setRoleInvite(e.target.value)}
            className="py-2 px-2.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
          >
            <option value="viewer">Viewer</option>
            <option value="commenter">Commenter</option>
            <option value="editor">Editor</option>
          </select>
          <Button type="submit" variant="primary" size="sm">
            Invite
          </Button>
        </form>

        {/* Public link section */}
        <div className="p-3.5 rounded-xl bg-[#F8F7FF] dark:bg-[#1C1A2E] border border-[#EAE8F0] dark:border-[#282440] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#7657E8]" />
              <div>
                <span className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                  Public Link Sharing
                </span>
                <p className="text-[11px] text-[#77738B] dark:text-[#A39EBC]">
                  Anyone with this link can view the document.
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                sharing.isPublic ? 'bg-[#7657E8]' : 'bg-gray-300 dark:bg-[#282440]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                  sharing.isPublic ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {sharing.isPublic && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
              <input
                readOnly
                value={publicUrl}
                className="flex-1 bg-white dark:bg-[#12101D] border border-[#EAE8F0] dark:border-[#282440] rounded-lg px-2.5 py-1.5 text-[11px] text-[#77738B] truncate focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                onClick={handleCopyLink}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>

        {/* Collaborators List */}
        <div>
          <span className="font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider text-[10px] block mb-2">
            Active Collaborators ({(sharing.collaborators || []).length})
          </span>

          <div className="divide-y divide-[#EAE8F0] dark:divide-[#282440] max-h-48 overflow-y-auto">
            {(sharing.collaborators || []).map((collab) => (
              <div key={collab.email} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar name={collab.name || collab.email} size="xs" />
                  <div className="truncate">
                    <span className="font-medium text-[#242039] dark:text-[#F1EFFF] block truncate">
                      {collab.email}
                    </span>
                    <span className="text-[10px] text-[#77738B] capitalize">{collab.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveCollaborator(collab.email)}
                  className="text-gray-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-[#EAE8F0] dark:border-[#282440]">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
