'use client';

import { useState } from 'react';
import { currency, number } from '@/lib/format';

/* ------------------------------------------------------------------ helpers */

const path = (points: Array<[number, number]>) =>
  points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/* -------------------------------------------------- Orders / deliveries area */

export interface SeriesPoint {
  label: string;
  orders: number;
  deliveries?: number;
  revenue?: number;
}

export function TrendChart({ data, height = 260 }: { data: SeriesPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data?.length) return null;

  const W = 760;
  const H = height;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...data.map((d) => Math.max(d.orders, d.deliveries ?? 0))) * 1.15 || 1;
  const x = (i: number) => padL + (innerW * i) / Math.max(1, data.length - 1);
  const y = (v: number) => padT + innerH - (innerH * v) / max;

  const ordersPts = data.map((d, i) => [x(i), y(d.orders)] as [number, number]);
  const deliveryPts = data.map((d, i) => [x(i), y(d.deliveries ?? 0)] as [number, number]);
  const area = `${path(ordersPts)} L${x(data.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Order and delivery trend">
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E11D2E" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#E11D2E" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => {
          const yy = padT + innerH * t;
          return (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="#ffffff" strokeOpacity="0.07" />
              <text x={padL - 10} y={yy + 4} textAnchor="end" className="fill-chalk-600 text-[10px]">
                {number(Math.round(max * (1 - t)), { compact: true })}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#trend-fill)" />
        <path d={path(ordersPts)} fill="none" stroke="#E11D2E" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path
          d={path(deliveryPts)}
          fill="none"
          stroke="#FF6A1F"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => (
          <g key={d.label}>
            <rect
              x={x(i) - innerW / data.length / 2}
              y={padT}
              width={innerW / data.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {hover === i && (
              <line x1={x(i)} x2={x(i)} y1={padT} y2={padT + innerH} stroke="#fff" strokeOpacity="0.25" />
            )}
            <circle
              cx={x(i)}
              cy={y(d.orders)}
              r={hover === i ? 5 : 3}
              fill="#0A0C11"
              stroke="#E11D2E"
              strokeWidth="2.5"
            />
            {i % Math.ceil(data.length / 7) === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-chalk-600 text-[10px]">
                {d.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[150px] rounded-xl border border-white/10 bg-ink-900/95 p-3 text-xs shadow-panel backdrop-blur"
          style={{ left: `${(hover / Math.max(1, data.length - 1)) * 82 + 6}%` }}
        >
          <p className="font-medium text-white">{data[hover].label}</p>
          <p className="mt-2 flex items-center justify-between gap-4 text-chalk-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Orders
            </span>
            <span className="text-white">{number(data[hover].orders)}</span>
          </p>
          {data[hover].deliveries !== undefined && (
            <p className="mt-1 flex items-center justify-between gap-4 text-chalk-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" /> Deliveries
              </span>
              <span className="text-white">{number(data[hover].deliveries)}</span>
            </p>
          )}
          {data[hover].revenue !== undefined && (
            <p className="mt-1 flex items-center justify-between gap-4 text-chalk-400">
              <span>Revenue</span>
              <span className="text-white">{currency(data[hover].revenue, { compact: true })}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-5 text-xs text-chalk-500">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" /> Orders
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-ember" /> Deliveries
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Bar chart */

export function BarChart({
  data,
  format = 'number',
  height = 220,
  color = '#E11D2E',
}: {
  data: Array<{ label: string; value: number }>;
  /** Server components cannot pass formatter functions across the boundary, so
   *  the format is named rather than injected. */
  format?: 'number' | 'currency';
  height?: number;
  color?: string;
}) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const valueFormat = (v: number) =>
    format === 'currency' ? currency(v, { compact: true }) : number(v);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10px] font-medium text-chalk-400 opacity-0 transition group-hover:opacity-100">
            {valueFormat(d.value)}
          </span>
          <div
            className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-125"
            style={{
              height: `${Math.max(3, (d.value / max) * 100)}%`,
              background: `linear-gradient(180deg, ${color}, ${color}55)`,
            }}
          />
          <span className="w-full truncate text-center text-[10px] text-chalk-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Donut chart */

const DONUT_COLORS = ['#E11D2E', '#FF6A1F', '#2ED3A7', '#6E8BFF', '#C084FC', '#F5C451'];

export function DonutChart({
  data,
  size = 190,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  data: Array<{ label: string; value: number }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-7">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>

      <div className="min-w-[140px] flex-1 space-y-2.5">
        {centerValue && (
          <div className="mb-4">
            <p className="font-display text-2xl font-semibold text-white">{centerValue}</p>
            <p className="text-xs text-chalk-600">{centerLabel}</p>
          </div>
        )}
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-chalk-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              {d.label}
            </span>
            <span className="text-chalk-500">
              {number(d.value)} · {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Funnel */

export function Funnel({ data }: { data: Array<{ stage: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count)) || 1;
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const conv = i === 0 ? 100 : (d.count / data[i - 1].count) * 100;
        return (
          <div key={d.stage}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-chalk-300">{d.stage}</span>
              <span className="text-chalk-500">
                {number(d.count)}
                {i > 0 && <span className="ml-2 text-chalk-600">{conv.toFixed(0)}%</span>}
              </span>
            </div>
            <div className="mt-2 h-8 overflow-hidden rounded-lg bg-white/[0.04]">
              <div
                className="flex h-full items-center justify-end rounded-lg pr-3 transition-all duration-700"
                style={{
                  width: `${Math.max(6, pct)}%`,
                  background: `linear-gradient(90deg, ${DONUT_COLORS[i % DONUT_COLORS.length]}dd, ${DONUT_COLORS[i % DONUT_COLORS.length]}66)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- Sparkline */

export function Sparkline({ values, color = '#E11D2E' }: { values: number[]; color?: string }) {
  if (!values?.length) return null;
  const W = 120;
  const H = 34;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const pts = values.map(
    (v, i) => [(W * i) / (values.length - 1 || 1), H - ((v - min) / (max - min || 1)) * (H - 6) - 3] as [number, number],
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-[120px]" aria-hidden="true">
      <path d={path(pts)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
