import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Folder, Plus, Moon, Sun, ArrowRight, Sparkles, Trash2, BarChart2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { documents, folders, refreshData } = useWorkspace();
  const { theme, toggleTheme } = useTheme();

  // Quick navigation and action items
  const actions = [
    {
      id: 'act_new_doc',
      title: 'Create New Document',
      category: 'Actions',
      icon: <Plus className="w-4 h-4 text-[#7657E8]" />,
      action: async () => {
        const res = await api.createDocument({ title: 'Untitled Document' });
        refreshData();
        navigate(`/documents/${res.document._id}`);
      },
    },
    {
      id: 'act_theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Light' : 'Dark'})`,
      category: 'Preferences',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#7657E8]" />,
      action: toggleTheme,
    },
    {
      id: 'act_ai',
      title: 'Open AI Assistant',
      category: 'Tools',
      icon: <Sparkles className="w-4 h-4 text-[#7657E8]" />,
      action: () => navigate('/ai-assistant'),
    },
    {
      id: 'act_analytics',
      title: 'View Workspace Analytics',
      category: 'Navigation',
      icon: <BarChart2 className="w-4 h-4 text-emerald-500" />,
      action: () => navigate('/analytics'),
    },
    {
      id: 'act_trash',
      title: 'Open Trash & Archives',
      category: 'Navigation',
      icon: <Trash2 className="w-4 h-4 text-rose-500" />,
      action: () => navigate('/trash'),
    },
  ];

  // Filtered documents
  const filteredDocs = (documents || [])
    .filter((d) => !d.isDeleted && (d.title || '').toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map((d) => ({
      id: d._id,
      title: d.title,
      category: 'Documents',
      icon: <FileText className="w-4 h-4 text-[#7657E8]" />,
      action: () => navigate(`/documents/${d._id}`),
    }));

  // Filtered folders
  const filteredFolders = (folders || [])
    .filter((f) => (f.name || '').toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map((f) => ({
      id: f._id,
      title: f.name,
      category: 'Folders',
      icon: <Folder className="w-4 h-4 text-amber-500" />,
      action: () => navigate(`/folders?id=${f._id}`),
    }));

  const allItems = [...filteredDocs, ...filteredFolders, ...actions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div className="fixed inset-0 bg-[#11101B]/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] rounded-2xl shadow-floating overflow-hidden z-10 animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#EAE8F0] dark:border-[#282440]">
          <Search className="w-4 h-4 text-[#77738B] dark:text-[#A39EBC] mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search documents..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-[#242039] dark:text-[#F1EFFF] placeholder-[#77738B]/60 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-[#282440] text-[#77738B] dark:text-[#A39EBC]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#77738B] dark:text-[#A39EBC]">
              No documents or commands found matching "{query}"
            </div>
          ) : (
            allItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  idx === selectedIndex
                    ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                    : 'text-[#242039] dark:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#282440]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider">
                    {item.category}
                  </span>
                  {idx === selectedIndex && <ArrowRight className="w-3.5 h-3.5 text-[#7657E8]" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#151322] flex items-center justify-between text-[11px] text-[#77738B] dark:text-[#A39EBC]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Docora Workspace Engine</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
