import { useState, useCallback } from 'react';
import type { ToastItem } from '../types';

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const toast: ToastItem = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
