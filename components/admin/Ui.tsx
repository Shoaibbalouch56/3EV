import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Database, Radio } from 'lucide-react';
import { number, titleize } from '@/lib/format';

/* ------------------------------------------------------------- Page header */

export function PageHeader({
  title,
  subtitle,
  live,
  actions,
}: {
  title: string;
  subtitle?: string;
  live?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
            {title}
          </h1>
          {live !== undefined && <DataSourceBadge live={live} />}
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-chalk-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DataSourceBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
        live
          ? 'border-volt/30 bg-volt/10 text-volt'
          : 'border-ember/30 bg-ember/10 text-ember'
      }`}
      title={live ? 'Served by the NestJS API' : 'API unreachable — rendering bundled demo data'}
    >
      {live ? <Radio className="h-3 w-3" /> : <Database className="h-3 w-3" />}
      {live ? 'Live API' : 'Offline data'}
    </span>
  );
}

/* ---------------------------------------------------------------- Stat card */

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  accent = 'brand',
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: 'brand' | 'ember' | 'volt' | 'neutral';
}) {
  const accents: Record<string, string> = {
    brand: 'from-brand/25 text-brand',
    ember: 'from-ember/25 text-ember',
    volt: 'from-volt/25 text-volt',
    neutral: 'from-white/10 text-chalk-300',
  };

  return (
    <div className="panel panel-hover group relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-chalk-600">{label}</p>
        {Icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-gradient-to-br to-transparent ${accents[accent]}`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="stat-value mt-4">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium ${
              delta >= 0 ? 'bg-volt/10 text-volt' : 'bg-brand/10 text-brand-400'
            }`}
          >
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-chalk-600">{hint}</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`panel overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="font-display text-base font-semibold text-white">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-chalk-600">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- Status pill */

const STATUS_STYLES: Record<string, string> = {
  // orders
  reservation: 'border-white/15 bg-white/[0.06] text-chalk-200',
  confirmed: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  in_production: 'border-ember/30 bg-ember/10 text-ember',
  in_transit: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
  ready_for_delivery: 'border-volt/30 bg-volt/10 text-volt',
  delivered: 'border-volt/30 bg-volt/10 text-volt',
  cancelled: 'border-white/10 bg-white/[0.04] text-chalk-600',
  // dealers
  active: 'border-volt/30 bg-volt/10 text-volt',
  onboarding: 'border-ember/30 bg-ember/10 text-ember',
  prospect: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  suspended: 'border-brand/35 bg-brand/10 text-brand-400',
  // inventory
  in_stock: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  allocated: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
  // service
  open: 'border-brand/35 bg-brand/10 text-brand-400',
  in_progress: 'border-ember/30 bg-ember/10 text-ember',
  awaiting_parts: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  resolved: 'border-volt/30 bg-volt/10 text-volt',
  // priority
  critical: 'border-brand/40 bg-brand/15 text-brand-400',
  high: 'border-ember/30 bg-ember/10 text-ember',
  medium: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  low: 'border-white/[0.12] bg-white/[0.05] text-chalk-400',
  // customers
  lead: 'border-white/[0.12] bg-white/[0.05] text-chalk-300',
  reserved: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  owner: 'border-volt/30 bg-volt/10 text-volt',
  retail: 'border-white/[0.12] bg-white/[0.05] text-chalk-300',
  fleet: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
  commercial: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'border-white/[0.12] bg-white/[0.05] text-chalk-300';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${style}`}
    >
      {titleize(status)}
    </span>
  );
}

/* --------------------------------------------------------------- Progress */

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-ember to-brand transition-all duration-700"
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- Table shell */

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[calc(100vh-330px)] overflow-auto rounded-xl border border-white/[0.06]">
      <table className="table-vv">{children}</table>
    </div>
  );
}

export function EmptyState({ message = 'Nothing matches these filters.' }: { message?: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-sm text-chalk-500">{message}</p>
    </div>
  );
}

/* -------------------------------------------------------------- Pagination */

export function Pagination({
  meta,
  basePath,
  params = {},
}: {
  meta: { page: number; pageCount: number; total: number; pageSize: number };
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const build = (page: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
    search.set('page', String(page));
    return `${basePath}?${search.toString()}`;
  };

  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.total, meta.page * meta.pageSize);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 pt-4 sm:flex-row">
      <p className="text-xs text-chalk-600">
        Showing {number(from)}–{number(to)} of {number(meta.total)}
      </p>
      <div className="flex items-center gap-1.5">
        <PageLink href={build(Math.max(1, meta.page - 1))} disabled={meta.page <= 1}>
          Previous
        </PageLink>
        <span className="px-3 text-xs text-chalk-500">
          Page {meta.page} / {meta.pageCount}
        </span>
        <PageLink href={build(Math.min(meta.pageCount, meta.page + 1))} disabled={meta.page >= meta.pageCount}>
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-chalk-700 opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-chalk-200 transition hover:border-white/25 hover:text-white"
    >
      {children}
    </Link>
  );
}
