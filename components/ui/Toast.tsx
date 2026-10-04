'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const TONE: Record<ToastTone, { icon: any; ring: string; iconClass: string; bar: string }> = {
  success: { icon: CheckCircle2, ring: 'border-volt/30', iconClass: 'text-volt', bar: 'bg-volt' },
  error: { icon: XCircle, ring: 'border-brand/40', iconClass: 'text-brand-400', bar: 'bg-brand' },
  warning: { icon: AlertTriangle, ring: 'border-ember/35', iconClass: 'text-ember', bar: 'bg-ember' },
  info: { icon: Info, ring: 'border-white/15', iconClass: 'text-chalk-300', bar: 'bg-chalk-500' },
};

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<ToastContextValue['push']>((toast) => {
    const id = nextId++;
    const duration = toast.duration ?? (toast.tone === 'error' ? 7000 : 4500);
    setToasts((current) => [...current.slice(-3), { ...toast, id, duration }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ tone: 'success', title, description }),
      error: (title, description) => push({ tone: 'error', title, description }),
      warning: (title, description) => push({ tone: 'warning', title, description }),
      info: (title, description) => push({ tone: 'info', title, description }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const tone = TONE[toast.tone];
  const Icon = tone.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${tone.ring} bg-ink-900/97 p-4 pr-10 shadow-panel backdrop-blur-xl`}
      style={{ animation: 'fade-up 0.28s cubic-bezier(0.22,1,0.36,1) both' }}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <div className="flex gap-3">
        <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${tone.iconClass}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-xs leading-relaxed text-chalk-400">{toast.description}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="absolute right-2.5 top-2.5 rounded-md p-1 text-chalk-600 transition hover:bg-white/10 hover:text-white"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <span
        className={`absolute bottom-0 left-0 h-0.5 ${tone.bar}`}
        style={{ animation: `toast-bar ${toast.duration}ms linear forwards` }}
      />
    </div>
  );
}
