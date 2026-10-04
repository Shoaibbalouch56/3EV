'use client';

import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { markIntroDone } from '@/lib/intro';

const SEEN_KEY = 'vv-intro-seen';

/** Brand reveal on the first visit of a session; skipped after that. */
export function IntroCurtain() {
  const [phase, setPhase] = useState<'show' | 'leave' | 'gone'>('show');

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // Storage blocked: just play the intro.
    }
    if (seen) {
      setPhase('gone');
      markIntroDone();
      return;
    }
    const leave = setTimeout(() => {
      setPhase('leave');
      markIntroDone();
    }, 1900);
    const gone = setTimeout(() => {
      setPhase('gone');
      // Mark as seen only once it has played, so a re-run effect doesn't skip it.
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // ignore
      }
    }, 2700);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => {
        setPhase('gone');
        markIntroDone();
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950 transition-all duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
        phase === 'leave' ? 'pointer-events-none -translate-y-full' : ''
      }`}
    >
      <div className="intro-logo">
        <Logo className="h-14 w-14 drop-shadow-[0_10px_30px_rgba(225,29,46,0.5)]" />
      </div>
      <p className="intro-word mt-7 font-display text-xl font-semibold uppercase tracking-[0.5em] text-white sm:text-2xl">
        Visionary <span className="text-brand">Vehicles</span>
      </p>
      <span className="intro-line mt-6 block h-px w-48 origin-left bg-brand" />
      <p className="intro-sub mt-5 text-[10px] uppercase tracking-[0.4em] text-chalk-500">Bricklin 3EV</p>
    </div>
  );
}
