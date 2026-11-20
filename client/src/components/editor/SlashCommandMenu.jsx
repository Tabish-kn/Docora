import React, { useState, useEffect } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  Table,
} from 'lucide-react';

export const SlashCommandMenu = ({ position, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <Heading1 className="w-4 h-4 text-[#7657E8]" />,
      action: () => onSelect({ type: 'header', value: 1 }),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="w-4 h-4 text-[#7657E8]" />,
      action: () => onSelect({ type: 'header', value: 2 }),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small subsection heading',
      icon: <Heading3 className="w-4 h-4 text-[#7657E8]" />,
      action: () => onSelect({ type: 'header', value: 3 }),
    },
    {
      id: 'bullet',
      title: 'Bulleted List',
      description: 'Create a simple bulleted list',
      icon: <List className="w-4 h-4 text-emerald-500" />,
      action: () => onSelect({ type: 'list', value: 'bullet' }),
    },
    {
      id: 'numbered',
      title: 'Numbered List',
      description: 'Create a numbered sequence',
      icon: <ListOrdered className="w-4 h-4 text-emerald-500" />,
      action: () => onSelect({ type: 'list', value: 'ordered' }),
    },
    {
      id: 'checklist',
      title: 'To-do Checklist',
      description: 'Track tasks with checkboxes',
      icon: <CheckSquare className="w-4 h-4 text-amber-500" />,
      action: () => onSelect({ type: 'list', value: 'check' }),
    },
    {
      id: 'quote',
      title: 'Blockquote',
      description: 'Capture a memorable quotation',
      icon: <Quote className="w-4 h-4 text-indigo-500" />,
      action: () => onSelect({ type: 'blockquote', value: true }),
    },
    {
      id: 'code',
      title: 'Code Block',
      description: 'Format snippet with monospace syntax',
      icon: <Code className="w-4 h-4 text-rose-500" />,
      action: () => onSelect({ type: 'code-block', value: true }),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[selectedIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, onClose]);

  return (
    <div
      className="absolute z-50 w-64 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-floating py-1.5 overflow-hidden animate-in fade-in zoom-in-95 select-none"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-[#77738B] uppercase tracking-wider border-b border-[#EAE8F0] dark:border-[#282440]">
        Basic Blocks
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
              idx === selectedIndex
                ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                : 'text-[#242039] dark:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#201D33]'
            }`}
          >
            <div className="p-1 rounded bg-gray-50 dark:bg-[#201D33]">{item.icon}</div>
            <div className="truncate">
              <div className="text-xs font-semibold">{item.title}</div>
              <div className="text-[10px] text-[#77738B] truncate">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlashCommandMenu;
