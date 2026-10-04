import type { Metadata } from 'next';
import { BatteryCharging, Cpu, Gauge, Recycle, Route, ShieldCheck } from 'lucide-react';
import { MarqueeStrip, ReserveBand, SectionHeading, TechnologySection } from '@/components/site/Sections';
import { Reveal } from '@/components/site/Reveal';

export const metadata: Metadata = {
  title: 'Electric technology',
  description:
    'Battery, drive unit, thermal management and software behind the Bricklin 3EV electric platform.',
};

const PILLARS = [
  {
    icon: BatteryCharging,
    title: 'Pack architecture',
    copy: 'A 102 kWh liquid-cooled pack sits low in the floor, doubling as a structural member. Cell-level monitoring reports state of health straight into the service platform.',
    points: ['Structural underfloor enclosure', 'Cell-level state-of-health telemetry', 'Thermal runaway containment'],
  },
  {
    icon: Gauge,
    title: 'Drive unit',
    copy: 'A single rear drive unit with a compact reduction gearset keeps mass central and low, matched to three-wheel-specific stability logic.',
    points: ['Rear-wheel drive', 'Regenerative braking with one-pedal mode', 'Three-wheel stability calibration'],
  },
  {
    icon: Route,
    title: 'Charge routing',
    copy: 'Navigation plans charge stops around your route, preconditions the pack on approach and reserves your arrival state of charge.',
    points: ['150 kW DC peak', '10–80% in 32 minutes', 'Automatic pack preconditioning'],
  },
  {
    icon: Cpu,
    title: 'Vehicle software',
    copy: 'The 3EV ships as a software-defined vehicle: features, efficiency and drive feel improve over the air, with every update tracked per VIN.',
    points: ['Over-the-air updates', 'Per-VIN update history', 'Remote diagnostics for dealers'],
  },
  {
    icon: Recycle,
    title: 'Efficiency',
    copy: 'Three wheels, a slippery body and lower mass mean fewer kilowatt-hours per mile — the cheapest energy is the energy you never use.',
    points: ['Low frontal area', 'Reduced rolling resistance', 'Aero-optimised wheel covers'],
  },
  {
    icon: ShieldCheck,
    title: 'Warranty & coverage',
    copy: 'Eight years or 100,000 miles of battery coverage, administered by your dealer through the same platform that tracks your order.',
    points: ['8 yr / 100k mi battery', '4 yr / 50k mi vehicle', 'Roadside assistance included'],
  },
];

export default function TechnologyPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-6 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark bg-[size:64px_64px] opacity-40 mask-fade-b" />
        <div className="container-vv">
          <SectionHeading
            eyebrow="Technology"
            title={<>The platform underneath the 3EV</>}
            copy="Battery, drive unit, thermal system and software were designed together — which is why a two-seat, three-wheel vehicle can target 275+ miles."
            align="center"
          />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-vv grid gap-4 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <article className="panel panel-hover flex h-full flex-col p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand/25 to-transparent text-brand">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-chalk-400">{p.copy}</p>
                <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs text-chalk-400">
                      <span className="h-1 w-1 rounded-full bg-brand" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <MarqueeStrip />
      <TechnologySection />
      <ReserveBand />
    </>
  );
}
