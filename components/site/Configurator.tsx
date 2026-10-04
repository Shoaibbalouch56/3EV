'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ArrowRight, Check, DoorOpen, Move3D } from 'lucide-react';
import { currency } from '@/lib/format';

const BricklinScene = dynamic(
  () => import('@/components/three/BricklinScene').then((mod) => mod.BricklinScene),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-white/[0.025]" />,
  },
);

const COLORS = [
  { name: 'Visionary Pearl', hex: '#EEF1F5', price: 0 },
  { name: 'Safety Orange', hex: '#FF6A1F', price: 0 },
  { name: 'Signal Red', hex: '#E11D2E', price: 900 },
  { name: 'Obsidian', hex: '#15171C', price: 1200 },
  { name: 'Pacific Blue', hex: '#1E5FA8', price: 900 },
  { name: 'Titanium', hex: '#8D95A3', price: 1200 },
];

const TRIMS = [
  { name: '3EV Launch Edition', price: 39980, range: 275, zeroSixty: '4.9s', note: 'First-run build slot, numbered badge' },
  { name: '3EV Touring', price: 43500, range: 288, zeroSixty: '5.2s', note: 'Long-range pack, premium interior' },
  { name: '3EV Sport', price: 46900, range: 262, zeroSixty: '4.1s', note: 'Sport drive unit, adaptive damping' },
];

const PACKS = [
  { name: 'Autonomy assist', price: 3500 },
  { name: 'Home charging kit', price: 1200 },
  { name: 'Premium audio', price: 900 },
];

export function Configurator() {
  const [color, setColor] = useState(COLORS[0]);
  const [trim, setTrim] = useState(TRIMS[0]);
  const [packs, setPacks] = useState<string[]>([PACKS[1].name]);
  const [doorsOpen, setDoorsOpen] = useState(false);

  const packTotal = PACKS.filter((p) => packs.includes(p.name)).reduce((s, p) => s + p.price, 0);
  const total = trim.price + color.price + packTotal;

  const togglePack = (name: string) =>
    setPacks((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));

  return (
    <section id="configure" className="relative py-20 sm:py-28">
      <div className="container-vv">
        <div className="max-w-2xl">
          <span className="eyebrow">Build yours</span>
          <h2 className="heading-lg mt-5 text-gradient">Configure your 3EV</h2>
          <p className="body-lg mt-4">
            Pick a trim, a finish and the packs you want. Every configuration is routed to your
            nearest dealer for delivery and service.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr]">
          {/* Visual */}
          <div className="panel depth-stage relative min-h-[420px] min-w-0 overflow-hidden sm:min-h-[520px] lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[760px]">
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-60 transition-colors duration-700"
              style={{ background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${color.hex}22, transparent 70%)` }}
            />
            <BricklinScene
              color={color.hex}
              accent={color.name === 'Signal Red' ? '#ff6a1f' : '#e11d2e'}
              preset="configurator"
              sport={trim.name === '3EV Sport'}
              doorsOpen={doorsOpen}
              className="absolute inset-0 h-full w-full"
            />

            <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
              <span className="pointer-events-none hidden rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-chalk-300 backdrop-blur-xl min-[380px]:inline-block">
                Live 3D configuration
              </span>
              <button
                type="button"
                onClick={() => setDoorsOpen((v) => !v)}
                aria-pressed={doorsOpen}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition hover:border-brand/60 hover:bg-brand/20"
              >
                <DoorOpen className="h-3.5 w-3.5 text-brand" />
                {doorsOpen ? 'Close doors' : 'Open doors'}
              </button>
            </div>
            <div className="pointer-events-none absolute right-5 top-5 z-20 hidden items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-chalk-500 sm:flex">
              <Move3D className="h-3.5 w-3.5 text-brand" />
              Drag to rotate
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-3 bg-gradient-to-t from-ink-950 via-ink-950/90 to-transparent px-6 pb-7 pt-24 sm:px-8">
              {COLORS.map((c) => {
                const active = c.name === color.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c)}
                    title={c.name}
                    aria-pressed={active}
                    aria-label={c.name}
                    className={`group pointer-events-auto relative h-10 w-10 rounded-full border shadow-lg transition ${
                      active ? 'scale-110 border-white ring-4 ring-white/10' : 'border-white/20 hover:border-white/50'
                    }`}
                    style={{ background: c.hex }}
                  >
                    {active && (
                      <Check className="absolute inset-0 m-auto h-4 w-4 text-white mix-blend-difference" />
                    )}
                  </button>
                );
              })}
              <span className="ml-1 text-sm text-chalk-300">
                {color.name}
                {color.price > 0 && <span className="text-chalk-500"> · +{currency(color.price)}</span>}
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="panel flex min-w-0 flex-col p-5 sm:p-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">Trim</h3>
            <div className="mt-4 space-y-3">
              {TRIMS.map((t) => {
                const active = t.name === trim.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTrim(t)}
                    className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                      active
                        ? 'border-brand/60 bg-brand/10 shadow-[0_0_0_1px_rgba(225,29,46,0.25)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-sm font-semibold text-white">{t.name}</span>
                      <span className="text-sm text-chalk-200">{currency(t.price)}</span>
                    </div>
                    <p className="mt-1 text-xs text-chalk-500">
                      {t.range} mi range · {t.zeroSixty} 0–60 · {t.note}
                    </p>
                  </button>
                );
              })}
            </div>

            <h3 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-500">
              Packs
            </h3>
            <div className="mt-4 space-y-2">
              {PACKS.map((p) => {
                const active = packs.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => togglePack(p.name)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-white/25"
                  >
                    <span className="flex items-center gap-3 text-sm text-chalk-100">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                          active ? 'border-brand bg-brand text-white' : 'border-white/25'
                        }`}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                      </span>
                      {p.name}
                    </span>
                    <span className="text-sm text-chalk-400">+{currency(p.price)}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl border border-white/10 bg-ink-900/70 p-5">
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                <span className="text-xs uppercase tracking-[0.16em] text-chalk-500">Estimated total</span>
                <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white min-[360px]:text-3xl">
                  {currency(total)}
                </span>
              </div>
              <p className="mt-2 text-xs text-chalk-600">
                Excludes destination, taxes and incentives. Reservation deposit from $500.
              </p>
              <Link href="/reserve" className="btn-primary mt-5 w-full">
                Continue to reservation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
