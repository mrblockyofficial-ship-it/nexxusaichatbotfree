import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="glass-panel-elevated rounded-2xl p-6 w-full max-w-md mx-4 shadow-elevation-4 border border-white/[0.08]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          {variant === 'danger' && (
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
          )}
          <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-[13px] mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-gray-400 hover:bg-white/[0.06] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-lg ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-accent hover:bg-accent-hover text-white shadow-accent/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
