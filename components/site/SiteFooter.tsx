import Link from 'next/link';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Vehicle',
    links: [
      { href: '/model-3ev', label: 'Bricklin 3EV' },
      { href: '/model-3ev#specifications', label: 'Specifications' },
      { href: '/technology', label: 'Electric technology' },
      { href: '/model-3ev#safety', label: 'Safety' },
    ],
  },
  {
    title: 'Ownership',
    links: [
      { href: '/reserve', label: 'Reserve' },
      { href: '/dealers', label: 'Find a dealer' },
      { href: '/dealers#service', label: 'Service & warranty' },
      { href: '/technology#charging', label: 'Charging' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/founder', label: 'Malcolm Bricklin' },
      { href: '/admin', label: 'Management platform' },
      { href: '/dealers#partner', label: 'Become a dealer' },
      { href: '/#network', label: 'Network' },
      { href: '/reserve#faq', label: 'FAQ' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[110px]" />
      <div className="container-vv py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative">
                <span className="absolute inset-0 rounded-xl bg-brand/50 blur-xl" />
                <Logo className="relative h-9 w-9" />
              </span>
              <span className="font-display text-base font-semibold text-white">
                Visionary<span className="text-brand"> Vehicles</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-chalk-500">
              The Bricklin 3EV — pure-electric, three-wheel, two-passenger. Built around a dealer
              network for sales, delivery and lifetime service.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/reserve" className="btn-primary btn-sm">
                Reserve from $500
              </Link>
              <Link href="/dealers" className="btn-ghost btn-sm">
                Find a dealer
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-chalk-300 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-line my-10" />

        <div className="flex flex-col gap-4 text-xs text-chalk-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Visionary Vehicles. Demonstration build — not a live commerce site.</p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Specifications and pricing shown are illustrative.</span>
            <Link href="/admin" className="text-chalk-300 transition hover:text-white">
              Executive platform
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
