import Link from 'next/link';
import {
  ArrowRight,
  BatteryCharging,
  Cpu,
  Gauge,
  LifeBuoy,
  Plug,
  Recycle,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
  Zap,
} from 'lucide-react';
import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="heading-lg mt-5 text-gradient">{title}</h2>
      {copy && <p className="body-lg mt-4">{copy}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ Marquee */

const MARQUEE = [
  'Pure electric',
  '275+ mile range',
  'Three-wheel stance',
  'Two passengers',
  'Dealer delivered',
  'Lifetime service network',
  'From $39,980',
  'Built in North America',
];

export function MarqueeStrip() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.07] bg-white/[0.02] py-4">
      <div className="flex w-max animate-marquee items-center gap-10">
        {[...MARQUEE, ...MARQUEE].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-3 whitespace-nowrap text-xs font-medium uppercase tracking-[0.22em] text-chalk-500"
          >
            <span className="h-1 w-1 rounded-full bg-brand" />
            {item}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}

/* ----------------------------------------------------------------- Features */

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant electric torque',
    copy: 'A rear-drive electric unit delivers full torque from a standstill — 0–60 mph in 4.9 seconds in Launch Edition trim.',
  },
  {
    icon: BatteryCharging,
    title: '275+ miles of range',
    copy: 'A liquid-cooled 102 kWh pack is engineered for long highway legs without range anxiety.',
  },
  {
    icon: Gauge,
    title: 'Three-wheel dynamics',
    copy: 'Two wheels forward, one driven wheel aft: a low polar moment, a wide front track and a planted, confident line through corners.',
  },
  {
    icon: Cpu,
    title: 'Software-defined cabin',
    copy: 'Over-the-air updates, connected navigation with charge routing, and a driver display tuned for a two-seat cockpit.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety-first structure',
    copy: 'A high-strength safety cage, energy-absorbing front structure and a full active-assist suite.',
  },
  {
    icon: Recycle,
    title: 'Efficient by design',
    copy: 'Lower mass and a slippery three-wheel body mean more miles from every kilowatt-hour.',
  },
];

export function FeatureGrid() {
  return (
    <section id="vehicle" className="py-20 sm:py-28">
      <div className="container-vv">
        <SectionHeading
          eyebrow="Engineering"
          title="Built around one idea: efficiency you can feel"
          copy="Every system on the 3EV — pack, drive unit, body, software — is tuned to move two people a long way, for less."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <article className="panel panel-hover group h-full p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-brand/25 to-transparent text-brand transition group-hover:border-brand/40">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.01em] text-white">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-chalk-400">{f.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Specs */

const SPECS = [
  { label: 'Range (targeted)', value: '275+ mi' },
  { label: 'Battery', value: '102 kWh' },
  { label: '0–60 mph', value: '4.9 s' },
  { label: 'Top speed', value: '130 mph' },
  { label: 'Seating', value: '2 passengers' },
  { label: 'Wheels', value: '3' },
  { label: 'Peak DC charge', value: '150 kW' },
  { label: '10–80% charge', value: '32 min' },
  { label: 'Drive', value: 'Rear-wheel' },
  { label: 'Curb weight', value: '2,480 lb' },
  { label: 'Cargo', value: '11.4 cu ft' },
  { label: 'Starting MSRP', value: '$39,980' },
];

export function SpecsTable() {
  return (
    <section id="specifications" className="py-20 sm:py-28">
      <div className="container-vv">
        <SectionHeading
          eyebrow="Specifications"
          title="The numbers behind the 3EV"
          copy="Illustrative figures for this demonstration build — final homologated numbers are confirmed closer to production."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {SPECS.map((s, i) => (
            <div key={s.label} className="bg-ink-950 px-6 py-6 transition hover:bg-ink-900">
              <p className="text-[11px] uppercase tracking-[0.16em] text-chalk-600">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                {s.value}
              </p>
              <span className="mt-3 block h-px w-8 bg-brand/70" style={{ width: `${16 + (i % 4) * 10}px` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Safety */

const SAFETY = [
  { title: 'High-strength safety cage', copy: 'Boron-reinforced occupant cell with engineered crush zones front and rear.' },
  { title: 'Active assist suite', copy: 'Automatic emergency braking, lane keeping, blind-spot monitoring and adaptive cruise.' },
  { title: 'Battery protection', copy: 'Underfloor pack in a sealed, impact-isolated enclosure with thermal runaway containment.' },
  { title: 'Stability control', copy: 'Three-wheel specific traction and stability logic calibrated for the wide front track.' },
];

export function SafetySection() {
  return (
    <section id="safety" className="relative py-20 sm:py-28">
      <div className="container-vv">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Safety"
              title="Engineered to protect two people"
              copy="A three-wheel vehicle should never feel like a compromise on safety. The 3EV is designed around a rigid occupant cell and a full suite of driver assistance."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-chalk-300">
                8 airbags
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-chalk-300">
                360° camera
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-chalk-300">
                Structural battery enclosure
              </span>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {SAFETY.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="panel panel-hover h-full p-6">
                  <ShieldCheck className="h-5 w-5 text-volt" />
                  <h3 className="mt-4 font-display text-base font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-chalk-400">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Technology */

const TECH = [
  { icon: Plug, stat: '150 kW', label: 'DC fast charging', copy: 'Add roughly 190 miles in about 25 minutes on a compatible DC charger.' },
  { icon: Timer, stat: '32 min', label: '10–80% charge', copy: 'Pack preconditioning readies cells on the way to the charger.' },
  { icon: Sparkles, stat: 'OTA', label: 'Over-the-air updates', copy: 'Range, drive feel and features improve after delivery — no dealer visit needed.' },
  { icon: LifeBuoy, stat: '8 yr', label: 'Battery warranty', copy: 'Eight years or 100,000 miles of pack coverage, managed through your dealer.' },
];

export function TechnologySection() {
  return (
    <section id="charging" className="py-20 sm:py-28">
      <div className="container-vv">
        <SectionHeading
          eyebrow="Electric technology"
          title="Charge fast. Drive far. Improve over time."
          copy="The 3EV platform pairs a thermally managed pack with software that keeps getting better after you take delivery."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH.map((t, i) => (
            <Reveal key={t.label} delay={i * 80}>
              <div className="panel panel-hover h-full overflow-hidden p-7">
                <t.icon className="h-5 w-5 text-ember" />
                <p className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-white">
                  {t.stat}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-chalk-500">{t.label}</p>
                <p className="mt-4 text-sm leading-relaxed text-chalk-400">{t.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Network */

const NETWORK_POINTS = [
  { title: 'Dealer-delivered', copy: 'Every 3EV is delivered by a trained dealer team with a documented pre-delivery inspection.' },
  { title: 'Service where you live', copy: 'Certified service bays, mobile service units and OTA diagnostics keep downtime low.' },
  { title: 'One platform, end to end', copy: 'Reservation, allocation, production slot, delivery and warranty all run on one system.' },
];

export function NetworkSection({ dealerCount = 32 }: { dealerCount?: number }) {
  return (
    <section id="network" className="py-20 sm:py-28">
      <div className="container-vv">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Sales & service network"
              title="A dealer network, run like software"
              copy="Visionary Vehicles sells and services the 3EV through franchised dealers — and every store runs on the same management platform."
            />
            <ul className="mt-8 space-y-5">
              {NETWORK_POINTS.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-chalk-400">{p.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dealers" className="btn-primary btn-sm">
                Find a dealer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin" className="btn-ghost btn-sm">
                See the management platform
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="panel relative overflow-hidden p-8">
              <div className="absolute inset-0 bg-grid-dark bg-[size:40px_40px] opacity-40" />
              <div className="relative">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="font-display text-5xl font-semibold tracking-[-0.03em] text-white">
                      {dealerCount}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-chalk-500">
                      Dealer points in the demo network
                    </p>
                  </div>
                  <span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1 text-[11px] font-medium text-volt">
                    Expanding
                  </span>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    { region: 'West', value: 82 },
                    { region: 'South', value: 74 },
                    { region: 'Northeast', value: 63 },
                    { region: 'Midwest', value: 58 },
                    { region: 'Canada', value: 44 },
                  ].map((r) => (
                    <div key={r.region}>
                      <div className="flex items-center justify-between text-xs text-chalk-400">
                        <span>{r.region}</span>
                        <span className="text-chalk-500">{r.value}% coverage</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-ember to-brand"
                          style={{ width: `${r.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Reserve band */

export function ReserveBand() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-vv">
        <div className="panel relative overflow-hidden px-7 py-14 text-center sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-radial-brand" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[80px]" />
          <div className="relative">
            <span className="eyebrow">Reservations open</span>
            <h2 className="heading-lg mx-auto mt-6 max-w-2xl text-gradient">
              Put your name on a build slot from $500
            </h2>
            <p className="body-lg mx-auto mt-5 max-w-xl">
              Fully refundable. Your reservation is routed to your nearest dealer, who handles
              configuration, delivery and service.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/reserve" className="btn-primary w-full sm:w-auto">
                Reserve your 3EV
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dealers" className="btn-ghost w-full sm:w-auto">
                Talk to a dealer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
