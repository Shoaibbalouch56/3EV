'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface FilterSpec {
  key: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Search + select filters for the admin tables. Current values are passed in
 * from the server page (via searchParams), so this component never has to read
 * the URL itself — it only pushes new query strings.
 */
export function Filters({
  basePath,
  search = '',
  searchPlaceholder = 'Search',
  filters = [],
}: {
  basePath: string;
  search?: string;
  searchPlaceholder?: string;
  filters?: FilterSpec[];
}) {
  const router = useRouter();
  const [term, setTerm] = useState(search);

  const push = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    const current: Record<string, string> = { search: term };
    filters.forEach((f) => (current[f.key] = f.value));
    Object.assign(current, patch);

    for (const [k, v] of Object.entries(current)) {
      if (v && v !== 'all') params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const hasFilters = term || filters.some((f) => f.value && f.value !== 'all');

  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({});
        }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-600" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          type="search"
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-chalk-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="hidden h-4 w-4 text-chalk-600 sm:block" />
        {filters.map((f) => (
          <label key={f.key} className="relative">
            <span className="sr-only">{f.label}</span>
            <select
              value={f.value || 'all'}
              onChange={(e) => push({ [f.key]: e.target.value })}
              className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-3.5 pr-9 text-sm text-chalk-100 transition hover:border-white/25 focus:border-brand/50 focus:outline-none"
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink-900">
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-chalk-600">
              ▼
            </span>
          </label>
        ))}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setTerm('');
              router.push(basePath);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-chalk-400 transition hover:border-white/25 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
