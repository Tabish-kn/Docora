import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Share2,
  History,
  Sparkles,
  MessageSquare,
  Download,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Printer,
  FileCode,
  FileText,
} from 'lucide-react';
import { Button } from '../common/Button';
import { AvatarGroup } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const EditorHeader = ({
  document,
  onTitleChange,
  isSaving,
  activeCollaborators = [],
  commentsCount = 0,
  onOpenShare,
  onOpenHistory,
  onOpenAI,
  onOpenComments,
  onToggleStar,
  wordCount = 0,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(document?.title || 'Untitled Document');

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== document?.title) {
      onTitleChange(title.trim());
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format) => {
    window.open(api.getExportUrl(document._id, format));
    showToast(`Exporting as ${format.toUpperCase()}...`, 'info');
  };

  return (
    <header className="h-14 border-b border-[#EAE8F0] dark:border-[#282440] bg-white/95 dark:bg-[#161424]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Back button & Document Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
        <button
          onClick={() => navigate('/documents')}
          className="p-1.5 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
          title="Back to Documents"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-xl flex-shrink-0">{document?.icon || '📄'}</span>

        {/* Editable Title */}
        <div className="flex items-center gap-2 truncate flex-1">
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-sm font-semibold text-[#242039] dark:text-[#F1EFFF] bg-transparent border-b border-[#7657E8] focus:outline-none w-full max-w-sm"
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-[#242039] dark:text-[#F1EFFF] truncate cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors max-w-sm"
              title="Click to rename"
            >
              {document?.title || 'Untitled Document'}
            </span>
          )}

          {/* Star toggle */}
          <button
            onClick={onToggleStar}
            className="p-1 rounded text-[#77738B] hover:text-amber-500 transition-colors"
            title={document?.isStarred ? 'Unstar document' : 'Star document'}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                document?.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>

          {/* Saving Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#77738B] dark:text-[#A39EBC] ml-2">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#7657E8]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Collaborators, Drawers & Actions */}
      <div className="flex items-center gap-2">
        {/* Live Collaborators Presence Avatars */}
        {activeCollaborators.length > 0 && (
          <div className="hidden md:flex items-center gap-2 mr-2">
            <AvatarGroup users={activeCollaborators} max={3} size="sm" />
          </div>
        )}

        {/* Word count */}
        <span className="hidden lg:inline text-[11px] text-[#77738B] dark:text-[#A39EBC] px-2 py-1 rounded bg-[#F8F7FF] dark:bg-[#1E1B2E]">
          {wordCount} words
        </span>

        {/* Comments Button */}
        <button
          onClick={onOpenComments}
          className="relative p-2 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
          title="Comments & Discussions"
        >
          <MessageSquare className="w-4 h-4" />
          {commentsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7657E8]" />
          )}
        </button>

        {/* Version History Button */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors"
          title="Version History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* AI Assistant Trigger Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#7657E8]" />}
          onClick={onOpenAI}
          className="text-xs font-semibold"
        >
          AI
        </Button>

        {/* Share Button */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Share2 className="w-3.5 h-3.5" />}
          onClick={onOpenShare}
          className="text-xs"
        >
          Share
        </Button>

        {/* Export Dropdown */}
        <Dropdown
          trigger={
            <button className="p-2 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            {
              label: 'Print / Save as PDF',
              icon: <Printer className="w-3.5 h-3.5" />,
              onClick: handlePrint,
            },
            {
              label: 'Export Markdown (.md)',
              icon: <FileCode className="w-3.5 h-3.5" />,
              onClick: () => handleExport('markdown'),
            },
            {
              label: 'Export HTML (.html)',
              icon: <FileText className="w-3.5 h-3.5" />,
              onClick: () => handleExport('html'),
            },
            {
              label: 'Export Plain Text (.txt)',
              icon: <FileText className="w-3.5 h-3.5" />,
              onClick: () => handleExport('txt'),
            },
          ]}
        />
      </div>
    </header>
  );
};

export default EditorHeader;
