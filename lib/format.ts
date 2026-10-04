export const currency = (value: number, opts: { compact?: boolean } = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: opts.compact ? 1 : 0,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(value || 0);

export const number = (value: number, opts: { compact?: boolean } = {}) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: opts.compact ? 1 : 0,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(value || 0);

export const percent = (value: number, digits = 1) => `${(value || 0).toFixed(digits)}%`;

export const date = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '--';

export const dateTime = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '--';

export function timeAgo(iso: string) {
  if (!iso) return '--';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export const titleize = (value: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const initials = (name: string) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
