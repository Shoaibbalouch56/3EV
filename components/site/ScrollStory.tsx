'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const BricklinScene = dynamic(
  () => import('@/components/three/BricklinScene').then((mod) => mod.BricklinScene),
  { ssr: false, loading: () => <div className="h-full w-full bg-ink-950" /> },
);

// One chapter per camera stop in STORY_SHOTS.
const CHAPTERS = [
  {
    kicker: 'Design',
    title: 'Redefining the price of fabulous.',
    copy: 'Design and quality, interior comfort, driving experience, safety, environmental impact — and price. The 3EV was drawn to win on every one.',
  },
  {
    kicker: 'The face',
    title: 'A face you won’t mistake.',
    copy: 'A bright centre spine between twin turbine intakes, framed by vertical light blades. Recognisable from a block away.',
  },
  {
    kicker: 'Gullwing doors',
    title: 'The gullwings are back.',
    copy: 'Fifty years after the Bricklin SV-1 put gullwing doors on a safety sports car, they return — opening the cabin to the sky.',
  },
  {
    kicker: 'Three wheels',
    title: 'Three wheels. Zero compromise.',
    copy: 'Two wheels up front for a wide, planted stance, one driven wheel behind. Lighter, more efficient, and pure fun to drive.',
  },
  {
    kicker: 'Ownership',
    title: 'Sold and serviced by America’s best dealers.',
    copy: 'Every 3EV is delivered and looked after by a professional network of the most customer-centric automobile dealers in the country.',
    cta: true,
  },
];

export function ScrollStory() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [bar, setBar] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      progress.current = p;
      setBar(p);
      setChapter(Math.round(p * (CHAPTERS.length - 1)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={section}
      aria-label="The Bricklin 3EV, chapter by chapter"
      className="relative border-y border-white/[0.06]"
      style={{ height: `${CHAPTERS.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <BricklinScene
            preset="detail"
            interactive={false}
            progressRef={progress}
            doorsOpen={chapter === 2}
            className="h-full w-full"
          />
        </div>

        {/* Legibility: dark on the copy side (left on desktop, bottom on phones). */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,10,0.96)_0%,rgba(6,7,10,0.6)_38%,transparent_60%)] md:bg-[linear-gradient(90deg,rgba(6,7,10,0.94)_0%,rgba(6,7,10,0.55)_34%,transparent_58%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-56 bg-gradient-to-l from-ink-950/80 to-transparent md:block" />

        <div className="container-vv relative flex h-full items-end pb-16 md:items-center md:pb-0">
          <div className="grid w-full max-w-md">
            {CHAPTERS.map((c, i) => {
              const active = i === chapter;
              return (
                <article
                  key={c.kicker}
                  aria-hidden={!active}
                  className={`self-end transition-all duration-700 ease-out [grid-area:1/1] md:self-center ${
                    active ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                  style={{ transform: `translateY(${active ? 0 : i < chapter ? -28 : 28}px)` }}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
                    {String(i + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')} · {c.kicker}
                  </p>
                  <h2 className="heading-lg mt-5 text-gradient">{c.title}</h2>
                  <p className="body-lg mt-5">{c.copy}</p>
                  {c.cta && (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link href="/reserve" className="btn-primary" tabIndex={active ? 0 : -1}>
                        Reserve your 3EV
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href="/dealers" className="btn-ghost" tabIndex={active ? 0 : -1}>
                        Find a dealer
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Chapter rail */}
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex">
          {CHAPTERS.map((c, i) => (
            <span key={c.kicker} className="flex items-center gap-3">
              <span
                className={`text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ${
                  i === chapter ? 'text-white' : 'text-chalk-600'
                }`}
              >
                {c.kicker}
              </span>
              <span
                className={`h-px transition-all duration-500 ${i === chapter ? 'w-10 bg-brand' : 'w-4 bg-white/25'}`}
              />
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.06]">
          <div className="h-full origin-left bg-brand" style={{ transform: `scaleX(${bar})` }} />
        </div>
      </div>
    </section>
  );
}
