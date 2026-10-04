'use client';

import { useEffect, useState } from 'react';

/**
 * The brand curtain (IntroCurtain) hides the page on first load. Hero animations wait for it:
 * CSS keys off <html data-intro="done">, the 3D arrival listens for the event.
 */
const INTRO_DONE_EVENT = 'vv:intro-done';

export function isIntroDone() {
  return typeof document !== 'undefined' && document.documentElement.dataset.intro === 'done';
}

export function markIntroDone() {
  if (isIntroDone()) return;
  document.documentElement.dataset.intro = 'done';
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

export function useIntroDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isIntroDone()) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(INTRO_DONE_EVENT, onDone);
    return () => window.removeEventListener(INTRO_DONE_EVENT, onDone);
  }, []);

  return done;
}
