'use client';

import { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

/* --------------------------------------------------------------- Base modal */

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: 'fade-in 0.2s ease both' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        /* whitespace-normal: row actions render this dialog inside a table cell,
           which sets white-space: nowrap — inherited, that stops text wrapping. */
        className={`relative z-10 w-full ${widths[size]} overflow-hidden whitespace-normal rounded-t-2xl border border-white/10 bg-ink-900/98 shadow-panel backdrop-blur-2xl sm:rounded-2xl`}
        style={{ animation: 'dialog-in 0.26s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-chalk-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-chalk-500 transition hover:bg-white/10 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] bg-white/[0.02] px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Confirm dialog */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={busy ? () => {} : onCancel} title={title} size="sm">
      <div className="flex gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tone === 'danger' ? 'bg-brand/15 text-brand-400' : 'bg-white/10 text-chalk-200'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-chalk-300">{message}</p>
      </div>

      <div className="mt-7 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost btn-sm">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`btn btn-sm ${
            tone === 'danger'
              ? 'bg-brand text-white hover:bg-brand-400'
              : 'bg-white text-ink-950 hover:bg-chalk-100'
          } disabled:opacity-60`}
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
