'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

const NAV = [
  { href: '/model-3ev', label: 'Bricklin 3EV' },
  { href: '/technology', label: 'Technology' },
  { href: '/dealers', label: 'Dealers' },
  { href: '/founder', label: 'Founder' },
  { href: '/reserve', label: 'Reserve' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? 'border-b border-white/10 bg-ink-950/75 shadow-[0_18px_70px_-35px_rgba(0,0,0,0.95)] backdrop-blur-2xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-vv flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="flex items-center gap-3" aria-label="Visionary Vehicles home">
          <span className="relative">
            <span className="absolute inset-0 rounded-xl bg-brand/45 blur-lg" />
            <Logo className="relative h-8 w-8 drop-shadow-[0_8px_14px_rgba(225,29,46,0.35)]" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
            Visionary<span className="text-brand"> Vehicles</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition duration-300 ${
                  active
                    ? 'border-white/10 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-transparent text-chalk-300 hover:-translate-y-0.5 hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/admin" className="btn-ghost btn-sm">
            <LayoutDashboard className="h-4 w-4" />
            Management platform
          </Link>
          <Link href="/reserve" className="btn-primary btn-sm">
            Reserve your 3EV
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="container-vv animate-fade-in pb-6 lg:hidden">
          <nav className="flex flex-col gap-1 border-t border-white/10 pt-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-chalk-100 transition hover:bg-white/[0.06]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/admin" className="btn-ghost w-full">
                <LayoutDashboard className="h-4 w-4" />
                Management platform
              </Link>
              <Link href="/reserve" className="btn-primary w-full">
                Reserve your 3EV
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
