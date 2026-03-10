import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ToastItem } from '../types';
import { clsx } from 'clsx';

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300',
  error: 'border-red-500/20 bg-red-500/[0.08] text-red-300',
  info: 'border-accent/20 bg-accent/[0.08] text-blue-300',
  warning: 'border-amber-500/20 bg-amber-500/[0.08] text-amber-300',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-xs" role="alert" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-elevation-3',
                styles[toast.type]
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="text-[13px] font-medium flex-1">{toast.message}</span>
              <button onClick={() => onRemove(toast.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
