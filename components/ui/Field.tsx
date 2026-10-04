'use client';

/**
 * Form field primitives shared by every create/edit dialog. Field lists are
 * plain data so a server component can hand them to a client dialog.
 */

export interface FieldSpec {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'switch' | 'date';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  help?: string;
  /** Full-width field inside the two-column grid. */
  wide?: boolean;
}

const baseInput =
  'w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-chalk-600 transition focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50';

export function Field({
  spec,
  value,
  onChange,
  error,
}: {
  spec: FieldSpec;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}) {
  const type = spec.type || 'text';

  return (
    <label className={`block ${spec.wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-500">
        {spec.label}
        {spec.required && <span className="text-brand">*</span>}
      </span>

      {type === 'select' ? (
        <div className="relative">
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInput} cursor-pointer appearance-none pr-9`}
          >
            {!spec.required && <option value="" className="bg-ink-900">—</option>}
            {(spec.options || []).map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-900">
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-chalk-600">
            ▼
          </span>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={spec.placeholder}
          rows={3}
          className={`${baseInput} resize-y`}
        />
      ) : type === 'switch' ? (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={`flex h-[38px] w-full items-center gap-3 rounded-xl border px-3.5 text-sm transition ${
            value ? 'border-volt/40 bg-volt/10 text-volt' : 'border-white/[0.12] bg-white/[0.03] text-chalk-400'
          }`}
        >
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition ${
              value ? 'bg-volt' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-all ${
                value ? 'left-[18px]' : 'left-0.5'
              }`}
            />
          </span>
          {value ? 'Yes' : 'No'}
        </button>
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(type === 'number' ? e.target.value.replace(/[^\d.-]/g, '') : e.target.value)}
          placeholder={spec.placeholder}
          className={baseInput}
        />
      )}

      {error ? (
        <span className="mt-1.5 block text-[11px] text-brand-400">{error}</span>
      ) : (
        spec.help && <span className="mt-1.5 block text-[11px] text-chalk-600">{spec.help}</span>
      )}
    </label>
  );
}

export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
