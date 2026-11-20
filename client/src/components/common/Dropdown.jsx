import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignStyles = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignStyles} mt-1.5 w-52 rounded-xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-floating py-1.5 z-50 animate-in fade-in zoom-in-95`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-[#EAE8F0] dark:border-[#282440]" />;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                  item.danger
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'text-[#242039] dark:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#282440]'
                } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {item.icon && <span className="w-4 h-4 text-[#77738B] dark:text-[#A39EBC] flex-shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut && <span className="text-[10px] text-[#77738B] dark:text-[#A39EBC] tracking-wider">{item.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
