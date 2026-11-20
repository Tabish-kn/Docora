import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import CommandPalette from '../common/CommandPalette';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../../services/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#7657E8');
  const [folderIcon, setFolderIcon] = useState('📁');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const { refreshData } = useWorkspace();
  const { showToast } = useToast();

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await api.createFolder({
        name: folderName.trim(),
        color: folderColor,
        icon: folderIcon,
      });
      showToast(`Folder "${folderName}" created successfully`, 'success');
      setFolderName('');
      setIsNewFolderModalOpen(false);
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to create folder', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F7FF] dark:bg-[#11101B]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-white dark:bg-[#161424]">
            <Sidebar
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileSidebarOpen(false)}
              onOpenNewFolderModal={() => {
                setIsMobileSidebarOpen(false);
                setIsNewFolderModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopNav
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Create Folder Modal */}
      <Modal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        title="Create New Folder"
        description="Organize your documents into shared folders."
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <Input
            label="Folder Name"
            placeholder="e.g. Design Guidelines, Engineering Specs"
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
                    folderColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#7657E8]' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider block mb-2">
              Folder Icon
            </label>
            <div className="flex items-center gap-2">
              {['📁', '🎨', '🚀', '📐', '⚙️', '📊', '💼', '💡'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setFolderIcon(emoji)}
                  className={`w-9 h-9 rounded-lg border text-base flex items-center justify-center transition-all ${
                    folderIcon === emoji
                      ? 'border-[#7657E8] bg-[#F0EDFF] dark:bg-[#7657E8]/20 scale-105'
                      : 'border-[#EAE8F0] dark:border-[#282440] hover:bg-gray-50 dark:hover:bg-[#201D33]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
            <Button variant="ghost" onClick={() => setIsNewFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingFolder}>
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppLayout;
