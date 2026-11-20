import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Clock,
  Star,
  Folder,
  Layers,
  LayoutTemplate,
  Activity,
  BarChart2,
  Archive,
  Trash2,
  Sparkles,
  Search,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  HardDrive,
  LogOut,
  FolderPlus,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import api from '../../services/api';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenNewDocModal, onOpenNewFolderModal }) => {
  const { workspace, folders, refreshData } = useWorkspace();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const mainNav = [
    { name: 'Home', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'My Documents', path: '/documents', icon: <FileText className="w-4 h-4" /> },
    { name: 'Shared With Me', path: '/shared', icon: <Users className="w-4 h-4" /> },
    { name: 'Recent', path: '/recent', icon: <Clock className="w-4 h-4" /> },
    { name: 'Starred', path: '/starred', icon: <Star className="w-4 h-4" /> },
  ];

  const workspaceNav = [
    { name: 'Team Workspace', path: '/team', icon: <Users className="w-4 h-4" /> },
    { name: 'Projects', path: '/projects', icon: <Layers className="w-4 h-4" /> },
    { name: 'Folders', path: '/folders', icon: <Folder className="w-4 h-4" /> },
    { name: 'Templates', path: '/templates', icon: <LayoutTemplate className="w-4 h-4" /> },
  ];

  const managementNav = [
    { name: 'Activity', path: '/activity', icon: <Activity className="w-4 h-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { name: 'Archive', path: '/archive', icon: <Archive className="w-4 h-4" /> },
    { name: 'Trash', path: '/trash', icon: <Trash2 className="w-4 h-4" /> },
  ];

  const toolsNav = [
    { name: 'AI Assistant', path: '/ai-assistant', icon: <Sparkles className="w-4 h-4 text-[#7657E8]" /> },
    { name: 'Search', path: '/search', icon: <Search className="w-4 h-4" /> },
  ];

  const handleCreateDocument = async () => {
    try {
      const res = await api.createDocument({ title: 'Untitled Document' });
      await refreshData();
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-[#EAE8F0] dark:border-[#282440] bg-[#FFFFFF] dark:bg-[#161424] transition-all duration-200 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Workspace Switcher Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#EAE8F0] dark:border-[#282440]">
        {!isCollapsed ? (
          <div className="relative flex-1">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7657E8] to-[#9D84F7] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                  D
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-[#242039] dark:text-[#F1EFFF] truncate">
                    {workspace?.name || 'Docora Workspace'}
                  </div>
                  <div className="text-[10px] text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider">
                    {workspace?.plan || 'Pro'} Workspace
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#77738B] dark:text-[#A39EBC]" />
            </button>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7657E8] to-[#9D84F7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            D
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      {!isCollapsed ? (
        <div className="p-3">
          <button
            onClick={handleCreateDocument}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#7657E8] hover:bg-[#6544D7] text-white text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Document</span>
          </button>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <button
            onClick={handleCreateDocument}
            title="New Document"
            className="w-9 h-9 rounded-lg bg-[#7657E8] hover:bg-[#6544D7] text-white flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 text-xs font-medium">
        {/* MAIN */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-semibold text-[#77738B] dark:text-[#8E8AAB] tracking-wider uppercase">
              Main
            </div>
          )}
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA] font-semibold'
                      : 'text-[#5B5675] dark:text-[#B6B1CE] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <span className={isActive ? 'text-[#7657E8] dark:text-[#A78BFA]' : 'text-[#77738B] dark:text-[#9A95B7]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* WORKSPACE & FOLDERS */}
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-semibold text-[#77738B] dark:text-[#8E8AAB] tracking-wider uppercase">
                Workspace
              </span>
              <button
                onClick={() => onOpenNewFolderModal?.()}
                title="Create folder"
                className="text-[#77738B] hover:text-[#7657E8] transition-colors p-0.5"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>
          )}
          <nav className="space-y-0.5">
            {workspaceNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA] font-semibold'
                      : 'text-[#5B5675] dark:text-[#B6B1CE] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <span className={isActive ? 'text-[#7657E8] dark:text-[#A78BFA]' : 'text-[#77738B] dark:text-[#9A95B7]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}

            {/* Quick Folder Links if not collapsed */}
            {!isCollapsed && folders.length > 0 && (
              <div className="pt-1 pl-3 space-y-0.5">
                {folders.slice(0, 4).map((fld) => (
                  <NavLink
                    key={fld._id}
                    to={`/folders?id=${fld._id}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] truncate"
                  >
                    <span>{fld.icon || '📁'}</span>
                    <span className="truncate">{fld.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </nav>
        </div>

        {/* MANAGEMENT */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-semibold text-[#77738B] dark:text-[#8E8AAB] tracking-wider uppercase">
              Management
            </div>
          )}
          <nav className="space-y-0.5">
            {managementNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA] font-semibold'
                      : 'text-[#5B5675] dark:text-[#B6B1CE] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <span className={isActive ? 'text-[#7657E8] dark:text-[#A78BFA]' : 'text-[#77738B] dark:text-[#9A95B7]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* TOOLS */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-semibold text-[#77738B] dark:text-[#8E8AAB] tracking-wider uppercase">
              Tools
            </div>
          )}
          <nav className="space-y-0.5">
            {toolsNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA] font-semibold'
                      : 'text-[#5B5675] dark:text-[#B6B1CE] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <span>{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Storage Indicator (Expanded only) */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-[#EAE8F0] dark:border-[#282440]">
          <div className="p-2.5 rounded-xl bg-[#F8F7FF] dark:bg-[#1E1B2E] border border-[#EAE8F0] dark:border-[#282440]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-medium text-[#242039] dark:text-[#F1EFFF] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#7657E8]" />
                Cloud Storage
              </span>
              <span className="text-[#77738B] dark:text-[#A39EBC]">4.5 / 20 GB</span>
            </div>
            <div className="w-full h-1.5 bg-[#EAE8F0] dark:bg-[#282440] rounded-full overflow-hidden">
              <div className="h-full bg-[#7657E8] rounded-full" style={{ width: '23%' }} />
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM (Settings, User Profile) */}
      <div className="p-2 border-t border-[#EAE8F0] dark:border-[#282440] space-y-0.5">
        <NavLink
          to="/settings/profile"
          title={isCollapsed ? 'Settings' : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5B5675] dark:text-[#B6B1CE] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <Settings className="w-4 h-4 text-[#77738B] dark:text-[#9A95B7]" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-1' : ''
          }`}
          onClick={() => navigate('/settings/profile')}
        >
          <Avatar src={user?.avatar} name={user?.name} size="sm" status="online" />
          {!isCollapsed && (
            <div className="truncate flex-1">
              <div className="text-xs font-medium text-[#242039] dark:text-[#F1EFFF] truncate">
                {user?.name || 'Alex Vance'}
              </div>
              <div className="text-[10px] text-[#77738B] dark:text-[#A39EBC] truncate">
                {user?.email || 'alex.vance@docora.internal'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
