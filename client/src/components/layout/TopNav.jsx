import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  CheckCircle2,
  FileText,
  User,
  Shield,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import api from '../../services/api';

export const TopNav = ({ onOpenCommandPalette, onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { workspace, refreshData } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Document Shared',
      message: 'Sarah shared "Q4 Product Launch" with you.',
      time: '10m ago',
      read: false,
    },
    {
      id: '2',
      title: 'New Comment',
      message: 'Marcus commented on "Docora Architecture".',
      time: '1h ago',
      read: false,
    },
    {
      id: '3',
      title: 'Milestone Reached',
      message: 'Storage limit increased to 20 GB.',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const handleCreateDocument = async () => {
    try {
      const res = await api.createDocument({ title: 'Untitled Document' });
      await refreshData();
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Build breadcrumbs based on route
  const pathParts = location.pathname.split('/').filter(Boolean);
  const getBreadcrumbName = (part) => {
    if (part === 'dashboard') return 'Dashboard';
    if (part === 'documents') return 'Documents';
    if (part === 'shared') return 'Shared With Me';
    if (part === 'recent') return 'Recent';
    if (part === 'starred') return 'Starred';
    if (part === 'folders') return 'Folders';
    if (part === 'projects') return 'Projects';
    if (part === 'templates') return 'Templates';
    if (part === 'activity') return 'Activity';
    if (part === 'analytics') return 'Analytics';
    if (part === 'archive') return 'Archive';
    if (part === 'trash') return 'Trash';
    if (part === 'ai-assistant') return 'AI Assistant';
    if (part === 'settings') return 'Settings';
    if (part === 'profile') return 'Profile';
    if (part === 'security') return 'Security';
    if (part === 'workspace') return 'Workspace';
    if (part === 'billing') return 'Billing';
    return part;
  };

  const userMenuItems = [
    {
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/settings/profile'),
    },
    {
      label: 'Workspace & Team',
      icon: <CreditCard className="w-4 h-4" />,
      onClick: () => navigate('/settings/workspace'),
    },
    {
      label: 'Security & 2FA',
      icon: <Shield className="w-4 h-4" />,
      onClick: () => navigate('/settings/security'),
    },
    {
      label: 'SaaS Billing & Plans',
      icon: <CreditCard className="w-4 h-4" />,
      onClick: () => navigate('/settings/billing'),
    },
    { divider: true },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <header className="h-14 border-b border-[#EAE8F0] dark:border-[#282440] bg-white/80 dark:bg-[#161424]/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#77738B] dark:text-[#A39EBC]">
          <span className="font-semibold text-[#7657E8]">{workspace?.name || 'Docora'}</span>
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className={index === pathParts.length - 1 ? 'font-medium text-[#242039] dark:text-[#F1EFFF]' : ''}>
                {getBreadcrumbName(part)}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: Search Command Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#1C1A2E] text-xs text-[#77738B] dark:text-[#A39EBC] hover:border-[#7657E8]/50 transition-colors shadow-subtle group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#77738B] group-hover:text-[#7657E8] transition-colors" />
            <span className="truncate">Search documents, folders, tags...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#282440] border border-[#EAE8F0] dark:border-[#342F54] text-[#77738B] dark:text-[#A39EBC]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2">
        {/* Quick New Document Button */}
        <button
          onClick={handleCreateDocument}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7657E8] hover:bg-[#6544D7] text-white text-xs font-medium shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7657E8]" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7657E8] ring-2 ring-white dark:ring-[#161424]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-floating py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#EAE8F0] dark:border-[#282440]">
                <span className="text-xs font-semibold text-[#242039] dark:text-[#F1EFFF]">Notifications</span>
                <button
                  onClick={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  }
                  className="text-[11px] text-[#7657E8] hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#EAE8F0] dark:divide-[#282440]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors ${
                      !n.read ? 'bg-[#F0EDFF]/30 dark:bg-[#7657E8]/10' : ''
                    }`}
                  >
                    <div className="font-semibold text-[#242039] dark:text-[#F1EFFF] flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#77738B]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#77738B] dark:text-[#A39EBC] mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors cursor-pointer">
              <Avatar src={user?.avatar} name={user?.name} size="sm" status="online" />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};

export default TopNav;
