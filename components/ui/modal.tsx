"use client";

import * as React from "react"
import { X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className = "" }: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog content */}
      <div 
        role="dialog" 
        aria-modal="true"
        className={`relative z-50 w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--surface-card)] p-6 text-start shadow-xl animate-in fade-in zoom-in-95 ${className}`}
      >
        <button
          onClick={onClose}
          className="absolute end-4 top-4 rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <div className="mb-5 text-xl font-bold font-display text-[var(--text-primary)] pe-8">
            {title}
          </div>
        )}

        <div className="mb-6">
          {children}
        </div>

        {footer && (
          <div className="mt-auto flex items-center justify-end gap-3 pt-4 border-t border-[var(--surface-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
