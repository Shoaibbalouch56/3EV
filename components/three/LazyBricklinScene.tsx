'use client';

import dynamic from 'next/dynamic';

/** BricklinScene with three.js split into its own chunk, for use from server components. */
export const LazyBricklinScene = dynamic(
  () => import('@/components/three/BricklinScene').then((mod) => mod.BricklinScene),
  { ssr: false, loading: () => <div className="h-full w-full bg-ink-950" /> },
);
