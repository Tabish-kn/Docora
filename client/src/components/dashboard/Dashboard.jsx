import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  Star,
  Users,
  HardDrive,
  Plus,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  UploadCloud,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import api from '../../services/api';

export const Dashboard = () => {
  const { workspace, documents, folders, refreshData } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('recent');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleCreateNew = async (template = '') => {
    try {
      const title =
        template === 'meeting'
          ? 'Weekly Team Meeting'
          : template === 'project'
          ? 'New Project Specification'
          : 'Untitled Document';
      const res = await api.createDocument({ title, template });
      await refreshData();
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const activeDocs = documents.filter((d) => !d.isDeleted);
  const starredDocs = activeDocs.filter((d) => d.isStarred);
  const recentDocs = [...activeDocs].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );

  const displayedDocs =
    activeTab === 'starred'
      ? starredDocs
      : activeTab === 'all'
      ? activeDocs
      : recentDocs.slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Personalized Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#7657E8]/10 via-[#7657E8]/5 to-transparent border border-[#7657E8]/20 p-6 md:p-8 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="default" className="mb-3">
            <Sparkles className="w-3 h-3 text-[#7657E8]" /> Intelligent Document Workspace
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#242039] dark:text-[#F1EFFF]">
            Welcome back, {user?.name || 'Alex'} 👋
          </h1>
          <p className="text-sm text-[#77738B] dark:text-[#A39EBC] mt-2 leading-relaxed">
            Your collaborative document hub is running smoothly. You have{' '}
            <span className="font-semibold text-[#7657E8]">{activeDocs.length} active documents</span> across{' '}
            <span className="font-semibold text-[#7657E8]">{folders.length} workspace folders</span>.
          </p>

          {/* Quick-create actions */}
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => handleCreateNew()}
            >
              Blank Document
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="w-4 h-4 text-[#7657E8]" />}
              onClick={() => handleCreateNew('meeting')}
            >
              Meeting Notes
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-4 h-4 text-emerald-500" />}
              onClick={() => handleCreateNew('project')}
            >
              Project Spec
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-[#7657E8]" />}
              onClick={() => navigate('/ai-assistant')}
            >
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle hover:border-[#7657E8]/40 transition-colors">
          <div className="flex items-center justify-between text-[#77738B] dark:text-[#A39EBC] text-xs font-medium">
            <span>Total Documents</span>
            <div className="p-2 rounded-lg bg-[#F0EDFF] dark:bg-[#7657E8]/20 text-[#7657E8]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-3">
            {activeDocs.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4 created this month</span>
          </div>
        </div>

        {/* Folders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle hover:border-[#7657E8]/40 transition-colors">
          <div className="flex items-center justify-between text-[#77738B] dark:text-[#A39EBC] text-xs font-medium">
            <span>Folders & Projects</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-3">
            {folders.length}
          </div>
          <div className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-2">
            Organized across workspace
          </div>
        </div>

        {/* Starred */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle hover:border-[#7657E8]/40 transition-colors">
          <div className="flex items-center justify-between text-[#77738B] dark:text-[#A39EBC] text-xs font-medium">
            <span>Starred Docs</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-3">
            {starredDocs.length}
          </div>
          <div className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-2">
            Quick favorites
          </div>
        </div>

        {/* Cloud Storage Usage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle hover:border-[#7657E8]/40 transition-colors">
          <div className="flex items-center justify-between text-[#77738B] dark:text-[#A39EBC] text-xs font-medium">
            <span>Cloud Storage</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#242039] dark:text-[#F1EFFF] mt-3">
            4.8 GB
          </div>
          <div className="w-full h-1.5 bg-[#EAE8F0] dark:bg-[#282440] rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#159B77] rounded-full" style={{ width: '24%' }} />
          </div>
          <div className="text-[11px] text-[#77738B] dark:text-[#A39EBC] mt-1.5 flex justify-between">
            <span>24% used</span>
            <span>20 GB Limit</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Document Showcase & Workspace Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-[#F0EDFF]/50 dark:bg-[#1C1A2E] p-1 rounded-xl border border-[#EAE8F0] dark:border-[#282440]">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'recent'
                    ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
                    : 'text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]'
                }`}
              >
                Recently Edited
              </button>
              <button
                onClick={() => setActiveTab('starred')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'starred'
                    ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
                    : 'text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]'
                }`}
              >
                Starred
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
                    : 'text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]'
                }`}
              >
                All Documents
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/documents')}
            >
              View all
            </Button>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {displayedDocs.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="group relative p-4 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle hover:shadow-premium transition-all cursor-pointer flex flex-col justify-between h-44 overflow-hidden"
              >
                {/* Header with icon & star */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl p-1.5 rounded-lg bg-[#F8F7FF] dark:bg-[#201D33] border border-[#EAE8F0] dark:border-[#282440]">
                      {doc.icon || '📄'}
                    </span>
                    {doc.isStarred && (
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF] line-clamp-2 group-hover:text-[#7657E8] transition-colors">
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
                <div className="flex items-center justify-between text-[11px] text-[#77738B] dark:text-[#A39EBC] pt-3 border-t border-[#EAE8F0]/80 dark:border-[#282440]/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#7657E8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Folders Showcase */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#242039] dark:text-[#F1EFFF]">
                Quick Folders
              </h2>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ChevronRight className="w-3 h-3" />}
                onClick={() => navigate('/folders')}
              >
                All Folders
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {folders.map((fld) => (
                <div
                  key={fld._id}
                  onClick={() => navigate(`/folders?id=${fld._id}`)}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/50 shadow-subtle hover:shadow-premium transition-all cursor-pointer"
                >
                  <div className="text-xl mb-1.5">{fld.icon || '📁'}</div>
                  <div className="font-medium text-xs text-[#242039] dark:text-[#F1EFFF] truncate">
                    {fld.name}
                  </div>
                  <div className="text-[10px] text-[#77738B] dark:text-[#A39EBC] mt-0.5">
                    {documents.filter((d) => d.folderId === fld._id).length} documents
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream & Team Insights */}
        <div className="space-y-6">
          {/* Workspace Activity Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE8F0] dark:border-[#282440]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#7657E8]" />
                <h3 className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF] uppercase tracking-wider">
                  Live Activity
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            <div className="divide-y divide-[#EAE8F0] dark:divide-[#282440] mt-1">
              {(analytics?.recentActivities || []).map((act) => (
                <div key={act._id} className="py-3 flex items-start gap-3">
                  <Avatar src={act.userAvatar} name={act.userName} size="xs" />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                      {act.userName}
                    </span>{' '}
                    <span className="text-[#77738B] dark:text-[#A39EBC]">
                      {act.action} {act.targetType}
                    </span>{' '}
                    <span className="font-medium text-[#7657E8] block truncate mt-0.5">
                      "{act.targetTitle}"
                    </span>
                    <span className="text-[10px] text-[#77738B] dark:text-[#A39EBC] block mt-1">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Collaborators */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF] uppercase tracking-wider">
                Workspace Members
              </h3>
              <Badge variant="default" size="xs">
                {workspace?.members?.length || 4} Members
              </Badge>
            </div>

            <div className="space-y-3">
              {(workspace?.members || []).map((member) => (
                <div key={member.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar src={member.avatar} name={member.name} size="sm" status="online" />
                    <div className="truncate">
                      <div className="font-medium text-[#242039] dark:text-[#F1EFFF] truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-[#77738B] dark:text-[#A39EBC] truncate">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'neutral'} size="xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs"
              onClick={() => navigate('/settings/workspace')}
            >
              Manage Team & Invites
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
