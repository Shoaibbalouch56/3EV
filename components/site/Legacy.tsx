import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './Sections';

const MILESTONES = [
  {
    year: '1968',
    name: 'Subaru of America',
    copy: 'Founded Subaru of America and built the U.S. distributor network that carried the brand to all-time highs.',
  },
  {
    year: '1974',
    name: 'Bricklin SV-1',
    copy: 'Created the SV-1 “safety vehicle” sports car — with gullwing doors — built in New Brunswick, Canada.',
  },
  {
    year: '1982',
    name: 'Yugo America',
    copy: 'Founded International Automobile Importers and brought the Yugo to American buyers.',
  },
  {
    year: '2004',
    name: 'Visionary Vehicles',
    copy: 'Founded Visionary Vehicles to bring alternative-technology and energy-cell projects to market.',
  },
  {
    year: 'Now',
    name: 'Bricklin 3EV',
    copy: 'Redefining the price of fabulous — sold and serviced by America’s most customer-centric dealers.',
    current: true,
  },
];

export function LegacySection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(63,169,255,0.10),transparent_70%)]" />
      <div className="container-vv">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionHeading
            eyebrow="The Bricklin legacy"
            title={<>Five decades of putting new cars on American roads</>}
            copy="Malcolm Bricklin has founded national car companies, importers and alternative-technology ventures. The 3EV is the next chapter."
          />
          <Reveal>
            <figure className="panel relative p-7 sm:p-9">
              <Quote className="h-6 w-6 text-brand" />
              <blockquote className="mt-4 font-display text-lg leading-relaxed text-white sm:text-xl">
                I returned to Fuji and negotiated a perpetual contract for the larger front-wheel-drive
                Subaru. Along with the distributors I set up, that drove our stock to all-time highs.
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-[0.16em] text-chalk-500">
                Malcolm Bricklin · Founder and CEO
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <ol className="legacy-track mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MILESTONES.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 80} className="h-full">
              <div className={`tilt-card panel relative h-full p-6 ${m.current ? 'border-brand/50 shadow-glow' : ''}`}>
                <span className="tilt-layer block font-display text-4xl font-semibold tracking-[-0.03em] text-gradient">
                  {m.year}
                </span>
                <h3 className="tilt-layer mt-4 font-display text-base font-semibold text-white">{m.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-chalk-400">{m.copy}</p>
                {m.current && (
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                    The next chapter
                  </span>
                )}
              </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <Link href="/founder" className="btn-ghost">
            Read the founder story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
