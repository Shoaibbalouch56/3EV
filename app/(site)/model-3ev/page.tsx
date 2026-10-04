import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Move3D } from 'lucide-react';
import { BricklinScene } from '@/components/three/BricklinScene';
import { Configurator } from '@/components/site/Configurator';
import {
  FeatureGrid,
  MarqueeStrip,
  ReserveBand,
  SafetySection,
  SectionHeading,
  SpecsTable,
  TechnologySection,
} from '@/components/site/Sections';
import { Reveal } from '@/components/site/Reveal';

export const metadata: Metadata = {
  title: 'Bricklin 3EV',
  description:
    'Bricklin 3EV — pure-electric, three wheels, two passengers, 275+ miles of targeted range from $39,980.',
};

const HIGHLIGHTS = [
  { value: '275+', unit: 'mi', label: 'Targeted range' },
  { value: '4.9', unit: 's', label: '0–60 mph' },
  { value: '102', unit: 'kWh', label: 'Battery' },
  { value: '150', unit: 'kW', label: 'Peak DC charge' },
];

export default function Model3EVPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-dark bg-[size:64px_64px] opacity-40 mask-fade-b" />
          <div className="absolute left-1/2 top-[-14rem] h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,106,31,0.22),transparent_60%)] blur-3xl" />
        </div>

        <div className="container-vv">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div className="min-w-0 animate-fade-up">
              <span className="eyebrow">The vehicle</span>
              <h1 className="heading-xl mt-6 text-gradient">Bricklin 3EV</h1>
              <p className="body-lg mt-6 max-w-xl">
                Two seats, three wheels, one purpose: move people efficiently, quietly and quickly.
                The 3EV is a ground-up electric platform, sold and serviced by a dealer near you.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/reserve" className="btn-primary">
                  Reserve from $500
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#configure" className="btn-ghost">
                  Build yours
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-4">
                {HIGHLIGHTS.map((h) => (
                  <div key={h.label} className="bg-ink-950 px-5 py-5">
                    <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                      {h.value}
                      <span className="ml-1 text-sm font-medium text-chalk-500">{h.unit}</span>
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-chalk-600">{h.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Reveal delay={120}>
              <div className="depth-stage relative h-[460px] overflow-hidden rounded-[2rem] border border-white/[0.08] sm:h-[560px]">
                <BricklinScene preset="detail" className="absolute inset-0 h-full w-full" />
                <div className="pointer-events-none absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-chalk-400 backdrop-blur-xl">
                  <Move3D className="h-3.5 w-3.5 text-brand" />
                  Explore in 3D
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mt-16">
        <MarqueeStrip />
      </div>

      <FeatureGrid />
      <Configurator />
      <SpecsTable />
      <SafetySection />
      <TechnologySection />

      <section className="py-20 sm:py-28">
        <div className="container-vv">
          <SectionHeading
            eyebrow="Ownership"
            title="What happens after you reserve"
            copy="Every step below is tracked in the Visionary Vehicles management platform, so your dealer and the factory see the same status you do."
            align="center"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { step: '01', title: 'Reserve', copy: 'Refundable deposit holds your place in the build queue.' },
              { step: '02', title: 'Configure', copy: 'Lock trim, colour and packs with your assigned dealer.' },
              { step: '03', title: 'Production', copy: 'Your VIN is assigned and the build slot is scheduled.' },
              { step: '04', title: 'Delivery', copy: 'Dealer completes PDI and hands over the vehicle.' },
              { step: '05', title: 'Service', copy: 'Warranty, OTA updates and service history in one place.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="panel panel-hover h-full p-6">
                  <span className="font-mono text-xs text-brand">{s.step}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-chalk-400">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ReserveBand />
    </>
  );
}
