import { useEffect, useState } from 'react';

type Toast = {
  id: number;
  message: string;
  tone: 'success' | 'error';
};

let listeners: Array<(toast: Toast) => void> = [];

export const pushToast = (message: string, tone: Toast['tone']) => {
  const toast = { id: Date.now(), message, tone };
  listeners.forEach((listener) => listener(toast));
};

export const ToastViewport = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3000);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter((item) => item !== listener);
    };
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-panel-strong rounded-2xl px-4 py-3 text-sm shadow-xl ${
            toast.tone === 'success'
              ? 'border-emerald-300/60 text-emerald-700 dark:text-emerald-200'
              : 'border-rose-300/60 text-rose-700 dark:text-rose-200'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
