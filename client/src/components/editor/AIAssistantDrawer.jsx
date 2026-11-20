import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  PlusCircle,
  Wand2,
  CheckCircle2,
  MessageSquare,
  FileText,
  ListTodo,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AIAssistantDrawer = ({ isOpen, onClose, documentText, onInsertText }) => {
  const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'chat'
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Docora AI Assistant. I can summarize, rewrite, polish, or answer questions directly based on this document.',
    },
  ]);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAction = async (actionType) => {
    setIsLoading(true);
    setResponse('');
    try {
      const res = await api.aiGenerate({
        action: actionType,
        context: documentText,
        tone: selectedTone,
      });
      setResponse(res.result);
      showToast('AI response generated', 'success');
    } catch (err) {
      showToast('Failed to generate AI response', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = prompt.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await api.aiGenerate({
        action: 'chat',
        prompt: userMsg,
        context: documentText,
      });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: res.result }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I encountered an issue analyzing that request.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div className="fixed top-14 right-0 bottom-0 w-80 sm:w-96 bg-white dark:bg-[#191728] border-l border-[#EAE8F0] dark:border-[#282440] shadow-floating z-40 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE8F0] dark:border-[#282440]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F0EDFF] dark:bg-[#7657E8]/20 text-[#7657E8]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-xs text-[#242039] dark:text-[#F1EFFF]">
            Docora AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-2 border-b border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#151322]">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'actions'
              ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
              : 'text-[#77738B]'
          }`}
        >
          Writing & Tools
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-[#282440] text-[#7657E8] dark:text-[#A78BFA] shadow-subtle'
              : 'text-[#77738B]'
          }`}
        >
          Document Chat
        </button>
      </div>

      {/* Tab 1: Actions */}
      {activeTab === 'actions' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Tone Selector */}
          <div>
            <label className="text-[10px] font-semibold text-[#77738B] uppercase tracking-wider block mb-1.5">
              Tone of Voice
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Professional', 'Casual', 'Concise'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium border transition-colors ${
                    selectedTone === tone
                      ? 'border-[#7657E8] bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                      : 'border-[#EAE8F0] dark:border-[#282440] text-[#77738B] hover:bg-gray-50 dark:hover:bg-[#201D33]'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleAction('summarize')}
              disabled={isLoading}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/60 bg-white dark:bg-[#1C1A2E] text-left transition-colors font-medium text-[#242039] dark:text-[#F1EFFF]"
            >
              <FileText className="w-4 h-4 text-[#7657E8]" />
              <div>
                <div>Summarize Document</div>
                <div className="text-[10px] text-[#77738B]">Executive briefing & key takeaways</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('rewrite')}
              disabled={isLoading}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/60 bg-white dark:bg-[#1C1A2E] text-left transition-colors font-medium text-[#242039] dark:text-[#F1EFFF]"
            >
              <Wand2 className="w-4 h-4 text-emerald-500" />
              <div>
                <div>Rewrite with Tone</div>
                <div className="text-[10px] text-[#77738B]">Adapt phrasing to {selectedTone} tone</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('action-items')}
              disabled={isLoading}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/60 bg-white dark:bg-[#1C1A2E] text-left transition-colors font-medium text-[#242039] dark:text-[#F1EFFF]"
            >
              <ListTodo className="w-4 h-4 text-amber-500" />
              <div>
                <div>Extract Action Items</div>
                <div className="text-[10px] text-[#77738B]">Structured checklist with tasks</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('grammar')}
              disabled={isLoading}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EAE8F0] dark:border-[#282440] hover:border-[#7657E8]/60 bg-white dark:bg-[#1C1A2E] text-left transition-colors font-medium text-[#242039] dark:text-[#F1EFFF]"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <div>
                <div>Fix Grammar & Polish</div>
                <div className="text-[10px] text-[#77738B]">Clarity and syntax enhancement</div>
              </div>
            </button>
          </div>

          {/* AI Output Result Box */}
          {isLoading && (
            <div className="p-4 rounded-xl border border-[#7657E8]/30 bg-[#F0EDFF]/30 dark:bg-[#7657E8]/10 flex items-center justify-center gap-2 text-xs text-[#7657E8]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing document context...</span>
            </div>
          )}

          {response && (
            <div className="p-4 rounded-xl border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#141221] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#7657E8]">
                <span>Generated Output</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(response)}
                    className="p-1 hover:text-[#242039]"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onInsertText(response)}
                    className="p-1 hover:text-[#242039]"
                    title="Insert into document"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#242039] dark:text-[#F1EFFF] whitespace-pre-wrap leading-relaxed">
                {response}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#7657E8]" />}
                onClick={() => onInsertText(response)}
              >
                Insert into Document
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Document Chat */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#7657E8] text-white rounded-br-none'
                      : 'bg-[#F8F7FF] dark:bg-[#1E1B2E] border border-[#EAE8F0] dark:border-[#282440] text-[#242039] dark:text-[#F1EFFF] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#77738B]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7657E8]" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#EAE8F0] dark:border-[#282440] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about this document..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 py-2 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none focus:border-[#7657E8]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!prompt.trim() || isLoading}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistantDrawer;
