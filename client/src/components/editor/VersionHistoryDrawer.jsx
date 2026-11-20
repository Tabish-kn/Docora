import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  RotateCcw,
  Clock,
  Plus,
  CheckCircle2,
  FileText,
  User,
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const VersionHistoryDrawer = ({ isOpen, onClose, documentId, onRestoreVersion }) => {
  const [versions, setVersions] = useState([]);
  const [snapshotName, setSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  const loadVersions = async () => {
    try {
      const res = await api.getVersions(documentId);
      setVersions(res.versions || []);
      if (res.versions?.length > 0) {
        setSelectedVersion(res.versions[0]);
      }
    } catch (err) {
      console.warn('Failed to load version history:', err);
    }
  };

  if (!isOpen) return null;

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await api.createVersion(documentId, {
        name: snapshotName.trim(),
        description: 'Manual snapshot created from editor',
      });
      setVersions((prev) => [res.version, ...prev]);
      setSnapshotName('');
      showToast('Named version snapshot saved', 'success');
    } catch (err) {
      showToast('Failed to save version snapshot', 'error');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestore = async (version) => {
    if (window.confirm(`Restore document to "${version.name || `v${version.versionNumber}`}"?`)) {
      try {
        await api.restoreVersion(documentId, version._id);
        showToast('Document restored successfully', 'success');
        onRestoreVersion?.(version.data);
        onClose();
      } catch (err) {
        showToast('Failed to restore version', 'error');
      }
    }
  };

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-[#191728] border-l border-[#EAE8F0] dark:border-[#282440] shadow-floating z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8F0] dark:border-[#282440]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#7657E8]" />
          <span className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
            Version History ({versions.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Create Named Snapshot Form */}
      <form
        onSubmit={handleCreateSnapshot}
        className="p-3 border-b border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#141221] flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Name this version snapshot..."
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
          className="flex-1 py-1.5 px-2.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs focus:outline-none focus:border-[#7657E8]"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isCreatingSnapshot}
          disabled={!snapshotName.trim()}
        >
          Save
        </Button>
      </form>

      {/* Version Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {versions.length === 0 ? (
          <div className="py-16 text-center text-[#77738B]">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#7657E8]" />
            <p>No snapshots recorded yet.</p>
            <p className="text-[11px] mt-1">Automatic autosave snapshots are created as you type.</p>
          </div>
        ) : (
          versions.map((version, idx) => (
            <div
              key={version._id}
              onClick={() => setSelectedVersion(version)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedVersion?._id === version._id
                  ? 'border-[#7657E8] bg-[#F0EDFF]/30 dark:bg-[#7657E8]/10 ring-1 ring-[#7657E8]/30'
                  : 'border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#1C1A2E] hover:border-[#7657E8]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
                  {version.name || `Version ${version.versionNumber}`}
                </span>
                <span className="text-[10px] text-[#77738B] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(version.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-[11px] text-[#77738B] dark:text-[#A39EBC] flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{version.authorName || 'Alex Vance'}</span>
              </div>

              {version.description && (
                <p className="text-[10px] text-[#77738B] mt-1 italic">{version.description}</p>
              )}

              {/* Restore action */}
              <div className="mt-2 pt-2 border-t border-[#EAE8F0]/60 dark:border-[#282440]/60 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3 h-3 text-[#7657E8]" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(version);
                  }}
                  className="text-[11px] py-1 px-2"
                >
                  Restore this version
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionHistoryDrawer;
