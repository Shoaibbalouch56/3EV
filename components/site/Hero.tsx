'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, BatteryCharging, DoorOpen, Gauge, MapPin, Move3D } from 'lucide-react';
import { markIntroDone } from '@/lib/intro';

const BricklinScene = dynamic(
  () => import('@/components/three/BricklinScene').then((mod) => mod.BricklinScene),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-white/[0.025]" />,
  },
);

const HERO_STATS = [
  { icon: BatteryCharging, value: '275+', unit: 'mi', label: 'Targeted range' },
  { icon: Gauge, value: '4.9', unit: 's', label: '0–60 mph' },
  { icon: MapPin, value: '$39,980', unit: '', label: 'Starting MSRP' },
];

const HEADLINE = ['The', 'price', 'of', 'fabulous,'];

/** Copy starts once the 3D car is mid-arrival; delays are measured from the intro curtain lifting. */
const at = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero() {
  const [doorsOpen, setDoorsOpen] = useState(false);

  // Safety net: if the intro curtain never signals (blocked script, etc.), release the hero anyway.
  useEffect(() => {
    const t = setTimeout(markIntroDone, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero-stage relative min-h-[820px] overflow-hidden border-b border-white/[0.06] pt-24 sm:min-h-[900px] sm:pt-28">
      <div className="absolute inset-0 hidden sm:block">
        <BricklinScene preset="hero" intro doorsOpen={doorsOpen} className="h-full w-full" />
      </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,0.98)_0%,rgba(6,7,10,0.78)_34%,rgba(6,7,10,0.12)_68%,rgba(6,7,10,0.42)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#06070a_0%,transparent_28%,rgba(6,7,10,0.22)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:80px_80px] opacity-20 mask-fade-b" />

      <div className="container-vv relative z-10 flex min-h-[700px] items-center sm:min-h-[760px]">
        <div className="w-full min-w-0 max-w-2xl py-12">
          <div className="animate-fade-up" style={at(1300)}>
            <span className="eyebrow glass-depth">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              Reservations open · Deliveries from 2027
            </span>
          </div>

          <p className="mt-7 animate-fade-up font-mono text-[11px] uppercase tracking-[0.2em] text-brand min-[360px]:text-xs sm:tracking-[0.34em]" style={at(1400)}>
            Introducing the Bricklin 3EV
          </p>
          <h1 className="heading-xl mt-5" aria-label="The price of fabulous, redefined.">
            <span className="block" aria-hidden="true">
              {HEADLINE.map((word, i) => (
                <span key={word}>
                  <span className="reveal-word">
                    <span className="text-gradient" style={at(1550 + i * 110)}>
                      {word}
                    </span>
                  </span>{' '}
                </span>
              ))}
            </span>
            <span className="block" aria-hidden="true">
              <span className="reveal-word">
                <span className="text-gradient-brand" style={at(2050)}>
                  redefined.
                </span>
              </span>
            </span>
          </h1>
          <p className="body-lg mt-6 max-w-xl animate-fade-up" style={at(2350)}>
            The all-electric, three-wheel, two-seat Bricklin 3EV — from the founder of Subaru of
            America. Sold and serviced by America’s most customer-centric dealers.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row" style={at(2550)}>
            <Link href="/reserve" className="btn-primary w-full sm:w-auto">
              Reserve from $500
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/model-3ev" className="btn-ghost w-full sm:w-auto">
              Enter the 3EV
            </Link>
          </div>

          <div className="mt-12 grid max-w-xl animate-fade-up grid-cols-3 gap-1.5 min-[360px]:gap-2" style={at(2750)}>
            {HERO_STATS.map(({ icon: Icon, value, unit, label }) => (
              <div key={label} className="glass-depth min-w-0 rounded-2xl px-2.5 py-4 min-[360px]:px-3 sm:px-5">
                <Icon className="h-4 w-4 text-brand" />
                <p className="mt-3 font-display text-base font-semibold tracking-[-0.02em] text-white min-[360px]:text-xl sm:text-2xl">
                  {value}
                  <span className="ml-1 text-xs font-medium text-chalk-500 sm:text-sm">{unit}</span>
                </p>
                <p className="mt-1 hidden text-[10px] uppercase tracking-[0.14em] text-chalk-500 sm:block">{label}</p>
              </div>
            ))}
          </div>

          {/* Phones: the car gets its own stage under the copy instead of sitting behind it. */}
          <div className="depth-stage relative mb-16 mt-8 h-[300px] overflow-hidden rounded-3xl border border-white/10 sm:hidden">
            <BricklinScene preset="detail" intro doorsOpen={doorsOpen} className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 z-10 flex animate-fade-up items-center gap-2 sm:right-8" style={at(3300)}>
        <button
          type="button"
          onClick={() => setDoorsOpen((v) => !v)}
          aria-pressed={doorsOpen}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:border-brand/60 hover:bg-brand/20"
        >
          <DoorOpen className="h-4 w-4 text-brand" />
          {doorsOpen ? 'Close gullwings' : 'Open gullwings'}
        </button>
        <span className="pointer-events-none hidden items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-chalk-400 backdrop-blur-xl lg:flex">
          <Move3D className="h-4 w-4 text-brand" />
          Drag to explore
        </span>
      </div>
      <Link
        href="#configure"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-chalk-500 sm:flex"
      >
        Discover
        <ArrowDown className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
