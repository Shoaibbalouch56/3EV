import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Film, MapPin } from 'lucide-react';
import { ReserveBand, SectionHeading } from '@/components/site/Sections';
import { Reveal } from '@/components/site/Reveal';

export const metadata: Metadata = {
  title: 'Malcolm Bricklin',
  description:
    'Malcolm Bricklin, Founder and CEO of Visionary Vehicles. Founder of Subaru of America, creator of the Bricklin SV-1, and the person behind the Bricklin 3EV.',
};

const CHAPTERS = [
  {
    years: '1956 – 1958',
    place: 'University of Florida',
    role: 'Student',
    title: 'University of Florida',
    copy: 'Attended the University of Florida before a career spent designing, engineering, manufacturing, importing and marketing automobiles.',
  },
  {
    years: 'Subaru of America',
    place: 'United States',
    role: 'Founder',
    title: 'Subaru of America',
    copy: 'Founded Subaru of America. A larger front wheel, followed by four-wheel drive, helped make Subaru a success. About twenty years later, Fuji bought the public company.',
  },
  {
    years: '1972 – 1975',
    place: 'Arizona, New Jersey and New Brunswick, Canada',
    role: 'Founder and CEO',
    title: 'Bricklin Motors',
    copy: 'Created the Bricklin SV-1 safety sports car and led Bricklin Motors from Arizona, New Jersey and New Brunswick, Canada.',
  },
  {
    years: '1982 – 1988',
    place: 'New Jersey',
    role: 'Founder and CEO',
    title: 'Yugo and International Automobile Importers',
    copy: 'Founded International Automobile Importers and Yugo America, importing and marketing automobiles into the United States.',
  },
  {
    years: '2004 – Present',
    place: 'New York City Metropolitan Area',
    role: 'Founder and CEO',
    title: 'Visionary Vehicles',
    copy: 'Founded Visionary Vehicles, continuing work across national car companies, importers and alternative technology, including energy-cell projects.',
  },
  {
    years: '2015 – Present',
    place: 'New York City Metropolitan Area',
    role: 'Founder and CEO',
    title: 'The Bricklin Group',
    copy: 'Leads The Bricklin Group from the New York City metropolitan area.',
  },
  {
    years: 'Feb 2017 – Present',
    place: 'New York City Metropolitan Area',
    role: 'Founder and CEO · Full-time',
    title: 'Visionary Vehicles, Inc.',
    copy: 'Founder and CEO of Visionary Vehicles, Inc. The Bricklin 3EV is the current car: design, quality, interior comfort, driving experience, safety, environmental impact and price, sold and serviced by a dealer network.',
  },
];

const WORDS = [
  {
    quote:
      'It started me into creating Subaru of America. The bigger front wheel, then four-wheel drive, made Subaru a big success. Twenty years later Fuji bought the whole public company. Great cars.',
    when: 'On founding Subaru of America',
  },
  {
    quote:
      'I returned to Fuji and negotiated a perpetual contract for the larger front-wheel-drive Subaru. Along with the distributors I set up, that drove our stock to all-time highs — until Fuji bought all the stockholders out, twenty years later.',
    when: 'On the Fuji contract',
  },
];

export default function FounderPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-6 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dark bg-[size:64px_64px] opacity-40 mask-fade-b" />
        <div className="container-vv">
          <SectionHeading
            eyebrow="Founder"
            title={<>Malcolm Bricklin</>}
            copy="Founder and CEO of national car companies, importers, and alternative-technology organizations. Decades spent designing, engineering, manufacturing, importing and marketing automobiles."
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-chalk-400">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" />
              New York, United States
            </span>
            <span>Visionary Vehicles, Inc.</span>
            <span>University of Florida</span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-vv grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <Reveal>
            <article className="panel p-7 sm:p-10">
              <span className="eyebrow">Now</span>
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                The Bricklin 3EV
              </h2>
              <p className="mt-5 text-base leading-relaxed text-chalk-300">
                The Bricklin 3EV is redefining the price of fabulous in design and quality, interior
                comfort, driving experience, safety, environmental impact, and price. Sold and
                serviced by a professional network of America’s best and most customer-centric
                automobile dealers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/model-3ev" className="btn-primary">
                  See the 3EV
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/reserve" className="btn-ghost">
                  Reserve
                </Link>
              </div>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="panel flex h-full flex-col p-7 sm:p-10">
              <Film className="h-5 w-5 text-brand" />
              <h2 className="mt-5 font-display text-xl font-semibold text-white">The Entrepreneur</h2>
              <p className="mt-4 text-sm leading-relaxed text-chalk-400">
                A documentary about Malcolm Bricklin, filmed and directed by Jonathan Bricklin.
              </p>
              <p className="mt-6 border-t border-white/[0.07] pt-6 text-xs uppercase tracking-[0.16em] text-chalk-500">
                Publication
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-vv">
          <SectionHeading
            eyebrow="Experience"
            title={<>Companies he founded and led</>}
            copy="From Subaru of America and the SV-1 to Yugo and the 3EV — the public record of the companies on his profile."
          />
          <ol className="mt-12 space-y-4">
            {CHAPTERS.map((chapter, i) => (
              <Reveal key={chapter.title} delay={i * 40}>
                <li className="panel grid gap-4 p-6 sm:grid-cols-[11rem_1fr] sm:gap-8 sm:p-8">
                  <div>
                    <p className="text-sm font-semibold text-white">{chapter.years}</p>
                    <p className="mt-2 text-xs leading-relaxed text-chalk-500">{chapter.place}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                      {chapter.role}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-white">{chapter.title}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-chalk-400">{chapter.copy}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-vv">
          <SectionHeading
            eyebrow="In his words"
            title={<>How Subaru of America was built</>}
            copy="From comments Malcolm Bricklin has posted publicly."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {WORDS.map((item, i) => (
              <Reveal key={item.when} delay={i * 80}>
                <blockquote className="panel flex h-full flex-col p-7 sm:p-9">
                  <p className="font-display text-lg font-medium leading-relaxed text-white sm:text-xl">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 text-xs uppercase tracking-[0.16em] text-chalk-500">
                    Malcolm Bricklin · {item.when}
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ReserveBand />
    </>
  );
}
