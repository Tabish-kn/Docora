import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Folder,
  Plus,
  FileText,
  UploadCloud,
  ChevronRight,
  MoreVertical,
  Star,
  Clock,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Dropdown } from '../common/Dropdown';
import Modal from '../common/Modal';
import Input from '../common/Input';
import FileUploadModal from './FileUploadModal';
import api from '../../services/api';

export const FolderView = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('id');
  const navigate = useNavigate();
  const { folders, documents, refreshData } = useWorkspace();
  const { showToast } = useToast();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editFolderModalOpen, setEditFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#7657E8');
  const [folderIcon, setFolderIcon] = useState('📁');

  const activeFolder = folders.find((f) => f._id === folderId) || folders[0];
  const folderDocs = documents.filter((d) => d.folderId === activeFolder?._id && !d.isDeleted);

  const handleCreateDocument = async () => {
    try {
      const res = await api.createDocument({
        title: 'Untitled Document',
        folderId: activeFolder?._id || null,
      });
      await refreshData();
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      showToast('Failed to create document', 'error');
    }
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!activeFolder || !folderName.trim()) return;
    try {
      await api.updateFolder(activeFolder._id, {
        name: folderName.trim(),
        color: folderColor,
        icon: folderIcon,
      });
      showToast('Folder updated', 'success');
      setEditFolderModalOpen(false);
      refreshData();
    } catch (err) {
      showToast('Failed to update folder', 'error');
    }
  };

  const handleDeleteFolder = async () => {
    if (!activeFolder) return;
    if (window.confirm(`Are you sure you want to delete folder "${activeFolder.name}"?`)) {
      try {
        await api.deleteFolder(activeFolder._id);
        showToast('Folder deleted', 'success');
        refreshData();
        navigate('/folders');
      } catch (err) {
        showToast('Failed to delete folder', 'error');
      }
    }
  };

  const openEditModal = () => {
    if (activeFolder) {
      setFolderName(activeFolder.name);
      setFolderColor(activeFolder.color || '#7657E8');
      setFolderIcon(activeFolder.icon || '📁');
      setEditFolderModalOpen(true);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Folder Header Banner */}
      {activeFolder && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle gap-4">
          <div className="flex items-center gap-4">
            <span
              className="text-3xl p-3 rounded-2xl flex items-center justify-center border shadow-subtle"
              style={{ backgroundColor: `${activeFolder.color}15`, borderColor: `${activeFolder.color}40` }}
            >
              {activeFolder.icon || '📁'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
                  {activeFolder.name}
                </h1>
                <Badge variant="default" size="xs">
                  {folderDocs.length} items
                </Badge>
              </div>
              <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-1">
                Workspace Folder • Created {new Date(activeFolder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UploadCloud className="w-4 h-4 text-[#7657E8]" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Files
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleCreateDocument}
            >
              New Document
            </Button>
            <Dropdown
              trigger={
                <button className="p-2 rounded-lg border border-[#EAE8F0] dark:border-[#282440] hover:bg-gray-50 dark:hover:bg-[#201D33] text-[#77738B]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={[
                { label: 'Edit Folder', icon: <Edit2 className="w-3.5 h-3.5" />, onClick: openEditModal },
                { divider: true },
                { label: 'Delete Folder', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true, onClick: handleDeleteFolder },
              ]}
            />
          </div>
        </div>
      )}

      {/* Folders Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {folders.map((fld) => (
          <button
            key={fld._id}
            onClick={() => navigate(`/folders?id=${fld._id}`)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFolder?._id === fld._id
                ? 'bg-[#F0EDFF] dark:bg-[#7657E8]/20 border-[#7657E8] text-[#7657E8] dark:text-[#A78BFA] shadow-sm'
                : 'bg-white dark:bg-[#191728] border-[#EAE8F0] dark:border-[#282440] text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]'
            }`}
          >
            <span>{fld.icon || '📁'}</span>
            <span>{fld.name}</span>
            <span className="text-[10px] opacity-70">
              ({documents.filter((d) => d.folderId === fld._id && !d.isDeleted).length})
            </span>
          </button>
        ))}
      </div>

      {/* Documents in Folder */}
      {folderDocs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-[#EAE8F0] dark:border-[#282440] bg-white/40 dark:bg-[#191728]/40">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFF] dark:bg-[#7657E8]/20 text-[#7657E8] flex items-center justify-center mx-auto mb-3">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#242039] dark:text-[#F1EFFF]">
            This folder is empty
          </h3>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] max-w-sm mx-auto mt-1">
            Create documents or upload project files directly into "{activeFolder?.name}".
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)}>
              Upload Files
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateDocument}>
              New Document
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folderDocs.map((doc) => (
            <div
              key={doc._id}
              onClick={() => navigate(`/documents/${doc._id}`)}
              className="group relative p-4 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle hover:shadow-premium transition-all cursor-pointer flex flex-col justify-between h-44 overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl p-1.5 rounded-lg bg-[#F8F7FF] dark:bg-[#201D33] border border-[#EAE8F0] dark:border-[#282440]">
                    {doc.icon || '📄'}
                  </span>
                  {doc.isStarred && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                </div>
                <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF] line-clamp-2 group-hover:text-[#7657E8] transition-colors">
                  {doc.title || 'Untitled Document'}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#77738B] dark:text-[#A39EBC] pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                </div>
                <span>{doc.wordCount || 0} words</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={activeFolder?._id}
      />

      {/* Edit Folder Modal */}
      <Modal
        isOpen={editFolderModalOpen}
        onClose={() => setEditFolderModalOpen(false)}
        title="Edit Folder"
      >
        <form onSubmit={handleUpdateFolder} className="space-y-4">
          <Input
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider block mb-2">
              Folder Color
            </label>
            <div className="flex items-center gap-2">
              {['#7657E8', '#159B77', '#F1A34A', '#3B82F6', '#EC4899', '#64748B'].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFolderColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    folderColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#7657E8]' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
            <Button variant="ghost" onClick={() => setEditFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FolderView;
