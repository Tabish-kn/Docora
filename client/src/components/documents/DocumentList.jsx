import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  Star,
  Copy,
  Trash2,
  Share2,
  Download,
  MoreVertical,
  Clock,
  ArrowUpDown,
  CheckSquare,
  Square,
  FileText,
  Upload,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Dropdown } from '../common/Dropdown';
import Modal from '../common/Modal';
import api from '../../services/api';

export const DocumentList = ({ filterType = 'all' }) => {
  const { documents, folders, refreshData } = useWorkspace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'title' | 'created'
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [docToRename, setDocToRename] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set();
    documents.forEach((d) => (d.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [documents]);

  // Filter & sort documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((d) => {
        if (filterType === 'starred' && !d.isStarred) return false;
        if (filterType === 'trash' && !d.isDeleted) return false;
        if (filterType !== 'trash' && d.isDeleted) return false;
        if (filterType === 'shared' && !d.sharing?.isPublic && (!d.sharing?.collaborators || d.sharing.collaborators.length === 0)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (d.title || '').toLowerCase().includes(q);
          const matchTag = (d.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchTag) return false;
        }

        if (selectedTag && !(d.tags || []).includes(selectedTag)) return false;
        if (selectedFolder && d.folderId !== selectedFolder) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
  }, [documents, filterType, searchQuery, selectedTag, selectedFolder, sortBy]);

  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map((d) => d._id));
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateDocument = async () => {
    try {
      const res = await api.createDocument({
        title: 'Untitled Document',
        folderId: selectedFolder || null,
      });
      await refreshData();
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      showToast('Failed to create document', 'error');
    }
  };

  const handleToggleStar = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.toggleStar(id);
      await refreshData();
      showToast('Document favorite status updated', 'success');
    } catch (err) {
      showToast('Failed to toggle star', 'error');
    }
  };

  const handleDuplicate = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.duplicateDocument(id);
      await refreshData();
      showToast('Document duplicated', 'success');
    } catch (err) {
      showToast('Failed to duplicate document', 'error');
    }
  };

  const handleDelete = async (id, permanent = false, e) => {
    e?.stopPropagation();
    try {
      if (permanent) {
        await api.permanentDeleteDocument(id);
        showToast('Document permanently removed', 'success');
      } else {
        await api.deleteDocument(id);
        showToast('Document moved to trash', 'success');
      }
      setSelectedDocIds((prev) => prev.filter((i) => i !== id));
      await refreshData();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleRestore = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.restoreDocument(id);
      showToast('Document restored', 'success');
      await refreshData();
    } catch (err) {
      showToast('Failed to restore document', 'error');
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    for (const id of selectedDocIds) {
      if (filterType === 'trash') {
        await api.permanentDeleteDocument(id).catch(() => {});
      } else {
        await api.deleteDocument(id).catch(() => {});
      }
    }
    showToast(`Processed ${selectedDocIds.length} documents`, 'success');
    setSelectedDocIds([]);
    refreshData();
  };

  const handleBulkStar = async () => {
    for (const id of selectedDocIds) {
      await api.toggleStar(id).catch(() => {});
    }
    showToast(`Updated ${selectedDocIds.length} documents`, 'success');
    setSelectedDocIds([]);
    refreshData();
  };

  const openRenameModal = (doc, e) => {
    e?.stopPropagation();
    setDocToRename(doc);
    setNewTitle(doc.title);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!docToRename || !newTitle.trim()) return;
    try {
      await api.updateDocument(docToRename._id, { title: newTitle.trim() });
      showToast('Document renamed', 'success');
      setRenameModalOpen(false);
      refreshData();
    } catch (err) {
      showToast('Failed to rename document', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
            {filterType === 'starred'
              ? 'Starred Documents'
              : filterType === 'trash'
              ? 'Trash & Archives'
              : filterType === 'shared'
              ? 'Shared With Me'
              : 'All Documents'}
          </h1>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {filterType !== 'trash' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleCreateDocument}
            >
              New Document
            </Button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                  : 'text-[#77738B] hover:text-[#242039]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                  : 'text-[#77738B] hover:text-[#242039]'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440]">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#77738B]" />
            <input
              type="text"
              placeholder="Filter by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#12101D] text-xs text-[#242039] dark:text-[#F1EFFF] placeholder-[#77738B]/60 focus:outline-none focus:border-[#7657E8]"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#12101D] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
          >
            <option value="">All Folders</option>
            {folders.map((fld) => (
              <option key={fld._id} value={fld._id}>
                {fld.icon || '📁'} {fld.name}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#12101D] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#77738B] hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#12101D] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
          >
            <option value="updated">Recently Edited</option>
            <option value="created">Date Created</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when items selected) */}
      {selectedDocIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0EDFF] dark:bg-[#7657E8]/20 border border-[#7657E8]/30 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7657E8] dark:text-[#A78BFA]">
            <span>{selectedDocIds.length} items selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkStar}>
              Star Selected
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              {filterType === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDocIds([])}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Documents Grid / List Render */}
      {filteredDocuments.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-[#EAE8F0] dark:border-[#282440] bg-white/40 dark:bg-[#191728]/40">
          <div className="w-12 h-12 rounded-xl bg-[#F0EDFF] dark:bg-[#7657E8]/20 text-[#7657E8] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#242039] dark:text-[#F1EFFF]">
            No documents found
          </h3>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No documents matched "${searchQuery}". Try adjusting your filters.`
              : 'Create your first document to get started with Docora.'}
          </p>
          {filterType !== 'trash' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-4"
              onClick={handleCreateDocument}
            >
              New Document
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => {
            const isSelected = selectedDocIds.includes(doc._id);
            return (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className={`group relative p-4 rounded-xl bg-white dark:bg-[#191728] border transition-all cursor-pointer flex flex-col justify-between h-48 select-none ${
                  isSelected
                    ? 'border-[#7657E8] ring-2 ring-[#7657E8]/20 shadow-premium'
                    : 'border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle hover:shadow-premium'
                }`}
              >
                {/* Header row: Checkbox, Icon, Star & Actions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSelect(doc._id, e)}
                        className="text-[#77738B] hover:text-[#7657E8]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7657E8]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#EAE8F0] dark:text-[#342F54] group-hover:text-[#77738B]" />
                        )}
                      </button>
                      <span className="text-xl p-1 rounded bg-[#F8F7FF] dark:bg-[#201D33]">
                        {doc.icon || '📄'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {filterType !== 'trash' && (
                        <button
                          onClick={(e) => handleToggleStar(doc._id, e)}
                          className="p-1 rounded text-[#77738B] hover:text-amber-500 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              doc.isStarred
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      )}

                      {/* Context Menu Dropdown */}
                      <Dropdown
                        trigger={
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </div>
                        }
                        items={
                          filterType === 'trash'
                            ? [
                                {
                                  label: 'Restore Document',
                                  onClick: () => handleRestore(doc._id),
                                },
                                {
                                  label: 'Delete Permanently',
                                  danger: true,
                                  onClick: () => handleDelete(doc._id, true),
                                },
                              ]
                            : [
                                {
                                  label: 'Rename Document',
                                  onClick: () => openRenameModal(doc),
                                },
                                {
                                  label: 'Duplicate',
                                  onClick: () => handleDuplicate(doc._id),
                                },
                                {
                                  label: 'Export Markdown',
                                  onClick: () =>
                                    window.open(api.getExportUrl(doc._id, 'markdown')),
                                },
                                {
                                  label: 'Export HTML',
                                  onClick: () =>
                                    window.open(api.getExportUrl(doc._id, 'html')),
                                },
                                { divider: true },
                                {
                                  label: 'Move to Trash',
                                  danger: true,
                                  onClick: () => handleDelete(doc._id, false),
                                },
                              ]
                        }
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF] line-clamp-2 group-hover:text-[#7657E8] transition-colors mt-1">
                    {doc.title || 'Untitled Document'}
                  </h3>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(doc.tags || []).slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="default" size="xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[11px] text-[#77738B] dark:text-[#A39EBC] pt-2 border-t border-[#EAE8F0]/80 dark:border-[#282440]/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>{doc.wordCount || 0} words</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-xl border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FF] dark:bg-[#1C1A2E] text-[#77738B] dark:text-[#A39EBC] border-b border-[#EAE8F0] dark:border-[#282440] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-8">
                  <button onClick={handleToggleSelectAll}>
                    {selectedDocIds.length === filteredDocuments.length ? (
                      <CheckSquare className="w-4 h-4 text-[#7657E8]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="p-3">Title</th>
                <th className="p-3">Folder</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Last Modified</th>
                <th className="p-3">Words</th>
                <th className="p-3 w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE8F0] dark:divide-[#282440]">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocIds.includes(doc._id);
                const folder = folders.find((f) => f._id === doc.folderId);
                return (
                  <tr
                    key={doc._id}
                    onClick={() => navigate(`/documents/${doc._id}`)}
                    className={`hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F0EDFF]/40 dark:bg-[#7657E8]/10' : ''
                    }`}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleToggleSelect(doc._id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#7657E8]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-[#242039] dark:text-[#F1EFFF]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{doc.icon || '📄'}</span>
                        <span className="truncate max-w-xs">{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#77738B] dark:text-[#A39EBC]">
                      {folder ? (
                        <span className="flex items-center gap-1.5">
                          <span>{folder.icon}</span>
                          <span>{folder.name}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {(doc.tags || []).slice(0, 2).map((t, i) => (
                          <Badge key={i} size="xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-[#77738B] dark:text-[#A39EBC]">
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-[#77738B] dark:text-[#A39EBC]">
                      {doc.wordCount || 0}
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleToggleStar(doc._id, e)}
                          className="p-1 text-[#77738B] hover:text-amber-500"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              doc.isStarred ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                        <Dropdown
                          trigger={
                            <button className="p-1 text-[#77738B] hover:text-[#242039]">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          }
                          items={[
                            { label: 'Rename', onClick: () => openRenameModal(doc) },
                            { label: 'Duplicate', onClick: () => handleDuplicate(doc._id) },
                            { label: 'Trash', danger: true, onClick: () => handleDelete(doc._id, false) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rename Document Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename Document"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentList;
