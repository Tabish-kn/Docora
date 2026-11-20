import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  PlusCircle,
  Copy,
  FileText,
  Lightbulb,
  Wand2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AIAssistantView = () => {
  const { documents, refreshData } = useWorkspace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to Docora AI Studio. Ask me to draft document sections, synthesize meeting notes, rewrite proposals, or query content across your workspace.',
    },
  ]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setPrompt('');
    setIsLoading(true);

    let docContext = '';
    if (selectedDocId) {
      const doc = documents.find((d) => d._id === selectedDocId);
      if (doc?.data) {
        docContext = JSON.stringify(doc.data);
      }
    }

    try {
      const res = await api.aiGenerate({
        action: 'chat',
        prompt: textToSend,
        context: docContext,
      });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.result }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error generating response. Please verify server connection.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocFromAI = async (content) => {
    try {
      const res = await api.createDocument({
        title: 'AI Generated Draft',
        data: {
          ops: [{ insert: 'AI Generated Document\n', attributes: { header: 1 } }, { insert: `${content}\n` }],
        },
      });
      await refreshData();
      showToast('Document created from AI output', 'success');
      navigate(`/documents/${res.document._id}`);
    } catch (err) {
      showToast('Failed to create document', 'error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAE8F0] dark:border-[#282440] flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#7657E8]" /> Docora AI Assistant Studio
          </h1>
          <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
            Context-aware writing, document synthesis, and intelligence engine.
          </p>
        </div>

        {/* Document Context Selector */}
        <select
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          className="py-1.5 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
        >
          <option value="">No Document Context (Global)</option>
          {documents
            .filter((d) => !d.isDeleted)
            .map((doc) => (
              <option key={doc._id} value={doc._id}>
                Context: {doc.title}
              </option>
            ))}
        </select>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {[
          'Summarize workspace roadmap priorities',
          'Draft an executive launch announcement',
          'Generate checklist of Q4 action items',
          'Improve tone to crisp & persuasive',
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] hover:border-[#7657E8] text-xs text-[#77738B] hover:text-[#7657E8] transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#7657E8] text-white rounded-br-none'
                  : 'bg-[#F8F7FF] dark:bg-[#141221] border border-[#EAE8F0] dark:border-[#282440] text-[#242039] dark:text-[#F1EFFF] rounded-bl-none space-y-3'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.sender === 'ai' && idx > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.text);
                      showToast('Copied to clipboard', 'success');
                    }}
                    className="p-1 text-[#77738B] hover:text-[#7657E8] flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() => handleCreateDocFromAI(m.text)}
                    className="p-1 text-[#7657E8] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <PlusCircle className="w-3 h-3" /> Create Document
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Docora AI anything or request document drafting..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 py-3 px-4 rounded-xl border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none focus:border-[#7657E8]"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!prompt.trim()}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default AIAssistantView;
