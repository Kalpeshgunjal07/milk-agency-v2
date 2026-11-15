import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 min-[360px]:p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={twMerge(
          clsx(
            'relative w-full bg-white rounded-2xl shadow-xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]',
            maxWidths[maxWidth]
          )
        )}
      >
        {/* Header */}
        <div className="px-3 min-[360px]:px-4 sm:px-6 py-2.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="min-w-0 flex-1 pr-2 min-[360px]:pr-3">
            <h2 className="text-xs min-[360px]:text-sm font-semibold text-slate-800 truncate">{title}</h2>
            {subtitle && (
              <p className="text-[11px] min-[360px]:text-xs font-normal text-slate-500 mt-0.5 truncate sm:whitespace-normal">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-2.5 min-[360px]:p-3.5 sm:p-5 md:p-6 overflow-y-auto text-xs font-normal">{children}</div>
      </div>
    </div>
  );
};
