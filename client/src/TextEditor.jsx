import { useCallback, useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import EditorHeader from './components/editor/EditorHeader';
import SlashCommandMenu from './components/editor/SlashCommandMenu';
import AIAssistantDrawer from './components/editor/AIAssistantDrawer';
import CommentsDrawer from './components/editor/CommentsDrawer';
import VersionHistoryDrawer from './components/editor/VersionHistoryDrawer';
import ShareModal from './components/documents/ShareModal';
import { useAuth } from './context/AuthContext';
import { useWorkspace } from './context/WorkspaceContext';
import { useToast } from './context/ToastContext';
import api from './services/api';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ['link', 'image', 'clean'],
];

export const TextEditor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshData } = useWorkspace();
  const { showToast } = useToast();

  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [wordCount, setWordCount] = useState(0);

  // Drawers & Modals
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Slash menu state
  const [slashMenuPosition, setSlashMenuPosition] = useState(null);
  const editorWrapperRef = useRef(null);

  // Fetch document metadata from REST API
  useEffect(() => {
    if (!documentId) return;
    api
      .getDocument(documentId)
      .then((res) => {
        setDocumentData(res.document);
      })
      .catch((err) => {
        console.warn('Could not fetch doc metadata:', err);
      });
  }, [documentId]);

  // Socket connection setup
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';
    const s = io(serverUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    setSocket(s);

    s.on('connect', () => {
      // Announce user presence in collaboration room
      s.emit('join-presence', {
        documentId,
        user: {
          id: user?._id || 'usr_admin',
          name: user?.name || 'Alex Vance',
          avatar: user?.avatar,
        },
      });
    });

    s.on('presence-state', (users) => {
      setActiveCollaborators(users);
    });

    s.on('user-joined', (collaborator) => {
      showToast(`${collaborator.name} joined the document`, 'info', 2000);
    });

    s.on('user-left', (collaborator) => {
      showToast(`${collaborator.name} left the document`, 'info', 2000);
    });

    return () => {
      s.disconnect();
    };
  }, [documentId, user]);

  // Load document content via Socket
  useEffect(() => {
    if (!socket || !quill || !documentId) return;

    socket.once('load-document', (data) => {
      if (data) {
        quill.setContents(data);
      }
      quill.enable();
      updateTextMetrics(quill);
    });

    socket.emit('get-document', documentId);
  }, [socket, quill, documentId]);

  // Handle incoming changes from collaborators
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta) => {
      quill.updateContents(delta);
      updateTextMetrics(quill);
    };

    socket.on('receive-changes', handler);
    return () => socket.off('receive-changes', handler);
  }, [socket, quill]);

  // Emit outgoing changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source === 'user') {
        socket.emit('send-changes', delta);
        updateTextMetrics(quill);
      }
    };

    quill.on('text-change', handler);
    return () => quill.off('text-change', handler);
  }, [socket, quill]);

  // Autosave interval
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      setIsSaving(true);
      const contents = quill.getContents();
      socket.emit('save-document', contents);
      setTimeout(() => setIsSaving(false), 500);
    }, 2500);

    return () => clearInterval(interval);
  }, [socket, quill]);

  // Calculate word and character count
  const updateTextMetrics = (q) => {
    if (!q) return;
    const text = q.getText().trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  };

  // Setup Quill editor with Notion / Linear aesthetics
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: toolbarOptions },
      placeholder: 'Type "/" for commands, or write your notes...',
    });

    q.disable();
    q.setText('Loading document...');
    setQuill(q);

    // Track text selection for commenting
    q.on('selection-change', (range) => {
      if (range && range.length > 0) {
        const text = q.getText(range.index, range.length);
        setSelectedText(text);
      }
    });

    // Detect slash command '/'
    q.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        const range = q.getSelection();
        if (range) {
          const [line, offset] = q.getLine(range.index);
          const lineText = line ? line.domNode.innerText.trim() : '';
          if (lineText === '/') {
            const bounds = q.getBounds(range.index);
            setSlashMenuPosition({
              top: bounds.top + bounds.height + 40,
              left: Math.min(bounds.left + 50, window.innerWidth - 300),
            });
            return;
          }
        }
        setSlashMenuPosition(null);
      }
    });

    return () => {
      q.off();
      q.container.remove();
    };
  }, []);

  // Handle slash command insertion
  const handleSlashSelect = (command) => {
    if (!quill) return;
    const range = quill.getSelection();
    if (range) {
      // Remove the slash character
      quill.deleteText(range.index - 1, 1);
      if (command.type === 'header') {
        quill.formatLine(range.index - 1, 1, 'header', command.value);
      } else if (command.type === 'list') {
        quill.formatLine(range.index - 1, 1, 'list', command.value);
      } else if (command.type === 'blockquote') {
        quill.formatLine(range.index - 1, 1, 'blockquote', true);
      } else if (command.type === 'code-block') {
        quill.formatLine(range.index - 1, 1, 'code-block', true);
      }
    }
    setSlashMenuPosition(null);
  };

  // Insert text from AI assistant
  const handleInsertAIText = (textToInsert) => {
    if (!quill) return;
    const range = quill.getSelection() || { index: quill.getLength() - 1, length: 0 };
    quill.insertText(range.index, `\n${textToInsert}\n`);
    quill.setSelection(range.index + textToInsert.length + 2);
    showToast('AI response inserted into document', 'success');
  };

  // Restore snapshot version
  const handleRestoreVersion = (versionData) => {
    if (!quill || !versionData) return;
    quill.setContents(versionData);
    socket?.emit('send-changes', quill.getContents());
    updateTextMetrics(quill);
    refreshData();
  };

  // Rename document title
  const handleTitleChange = async (newTitle) => {
    try {
      const updated = await api.updateDocument(documentId, { title: newTitle });
      setDocumentData(updated.document);
      showToast('Document title updated', 'success');
      refreshData();
    } catch (err) {
      showToast('Failed to update title', 'error');
    }
  };

  // Star toggle
  const handleToggleStar = async () => {
    try {
      const res = await api.toggleStar(documentId);
      setDocumentData(res.document);
      showToast(res.document.isStarred ? 'Document starred' : 'Document unstarred', 'info');
      refreshData();
    } catch (err) {
      showToast('Failed to update star', 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F7FF] dark:bg-[#11101B] overflow-hidden">
      {/* Editor Top Header */}
      <EditorHeader
        document={documentData}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        activeCollaborators={activeCollaborators}
        commentsCount={0}
        wordCount={wordCount}
        onToggleStar={handleToggleStar}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAI={() => setIsAIOpen(!isAIOpen)}
        onOpenComments={() => setIsCommentsOpen(!isCommentsOpen)}
      />

      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-y-auto relative flex justify-center py-6 px-4">
        <div
          ref={editorWrapperRef}
          className="w-full max-w-4xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] rounded-2xl shadow-premium min-h-[85vh] relative"
        >
          {/* Optional Document Cover Banner */}
          {documentData?.coverImage && (
            <div className="w-full h-36 rounded-t-2xl overflow-hidden relative">
              <img
                src={documentData.coverImage}
                alt="Document Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Quill Editor Mount Node */}
          <div className="container" ref={wrapperRef} />

          {/* Slash Commands Dropdown Menu */}
          {slashMenuPosition && (
            <SlashCommandMenu
              position={slashMenuPosition}
              onSelect={handleSlashSelect}
              onClose={() => setSlashMenuPosition(null)}
            />
          )}
        </div>
      </div>

      {/* AI Assistant Contextual Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        documentText={quill ? quill.getText() : ''}
        onInsertText={handleInsertAIText}
      />

      {/* Inline Comments Drawer */}
      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        documentId={documentId}
        selectedText={selectedText}
      />

      {/* Version Control History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        documentId={documentId}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Sharing & Collaborators Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        documentId={documentId}
        documentTitle={documentData?.title}
      />
    </div>
  );
};

export default TextEditor;
