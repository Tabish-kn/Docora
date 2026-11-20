import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#11101B]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] rounded-2xl shadow-floating overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE8F0] dark:border-[#282440]">
          <div>
            {title && <h3 className="text-base font-semibold text-[#242039] dark:text-[#F1EFFF]">{title}</h3>}
            {description && <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#282440] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
