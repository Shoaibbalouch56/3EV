/**
 * Stylised side profile of the Bricklin 3EV: teardrop two-seat cabin, two front
 * wheels (staggered so the three-wheel stance reads), one driven rear wheel.
 *
 * Body colour is driven by props so the configurator can repaint it live. Every
 * detail that sits on the paintwork is drawn inside a clip path of the body
 * outline, so highlights and lamps can never float off the silhouette.
 */
const BODY_PATH =
  'M118 250c-9-3-13-10-12-20 2-20 13-38 31-49 12-8 26-13 40-15l62-9 60-52c20-17 45-27 71-28l70-3c33-1 65 10 90 31l62 52 84 13c24 4 43 14 55 30 9 12 12 25 9 37-3 11-12 17-26 17H140c-8 0-15 0-22-4z';

export function BricklinCar({
  body = '#FF6A1F',
  accent = '#E11D2E',
  id = 'car',
  className = '',
  showShadow = true,
}: {
  body?: string;
  accent?: string;
  id?: string;
  className?: string;
  showShadow?: boolean;
}) {
  const g = (name: string) => `${id}-${name}`;

  return (
    <svg
      viewBox="0 0 900 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Bricklin 3EV side profile"
    >
      <defs>
        <linearGradient id={g('body')} x1="140" y1="90" x2="720" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={body} stopOpacity="0.92" />
          <stop offset="42%" stopColor={body} />
          <stop offset="100%" stopColor={body} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={g('gloss')} x1="220" y1="80" x2="620" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g('glass')} x1="320" y1="90" x2="560" y2="175" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cfe3ff" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#0b1220" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#0b1220" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id={g('tyre')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b303b" />
          <stop offset="100%" stopColor="#0a0c11" />
        </linearGradient>
        <linearGradient id={g('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef1f6" />
          <stop offset="55%" stopColor="#98a1b2" />
          <stop offset="100%" stopColor="#59616f" />
        </linearGradient>
        <radialGradient id={g('shadow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={g('clip')}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>

      {showShadow && <ellipse cx="450" cy="292" rx="330" ry="24" fill={`url(#${g('shadow')})`} />}

      {/* Rear wheel — single, driven, sits behind the body */}
      <g>
        <circle cx="676" cy="246" r="54" fill={`url(#${g('tyre')})`} />
        <circle cx="676" cy="246" r="54" stroke="#000" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="676" cy="246" r="29" fill={`url(#${g('rim')})`} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="672.5"
            y="220"
            width="7"
            height="22"
            rx="3"
            fill="#10141b"
            opacity="0.5"
            transform={`rotate(${deg} 676 246)`}
          />
        ))}
        <circle cx="676" cy="246" r="9" fill="#1b1f28" />
      </g>

      {/* Body */}
      <path d={BODY_PATH} fill={`url(#${g('body')})`} />

      {/* Everything painted on the body is clipped to the silhouette */}
      <g clipPath={`url(#${g('clip')})`}>
        {/* Gloss sweep along the shoulder */}
        <path
          d="M150 232c10-30 36-52 70-59l64-13 58-50c18-16 41-25 65-26l70-3c28-1 55 9 76 27l58 49-10 6-56-47c-19-16-43-24-68-23l-68 3c-20 1-39 8-54 21l-60 52-66 13c-29 6-52 24-62 50z"
          fill={`url(#${g('gloss')})`}
        />

        {/* Glass house */}
        <path d="M336 146l54-46c14-12 32-19 51-20l58-2c25-1 49 8 68 25l46 43z" fill={`url(#${g('glass')})`} />
        <path
          d="M336 146l54-46c14-12 32-19 51-20l58-2c25-1 49 8 68 25l46 43"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Door seam and A-pillar */}
        <path d="M452 78v68" stroke="#000" strokeOpacity="0.3" strokeWidth="3" />
        <path
          d="M344 152c50-11 100-12 150-4 30 5 58 15 84 30"
          stroke="#000"
          strokeOpacity="0.16"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Wheel arches */}
        <path d="M170 250a86 86 0 0 1 172 0" stroke="#000" strokeOpacity="0.28" strokeWidth="5" fill="none" />
        <path d="M600 250a76 76 0 0 1 152 0" stroke="#000" strokeOpacity="0.28" strokeWidth="5" fill="none" />

        {/* Head- and tail-lamp signatures, clipped into the bodywork */}
        <rect x="110" y="208" width="96" height="24" rx="9" fill={accent} />
        <rect x="110" y="208" width="96" height="10" rx="5" fill="#fff" opacity="0.22" />
        <rect x="762" y="198" width="96" height="26" rx="10" fill={accent} />
        <rect x="762" y="198" width="96" height="10" rx="5" fill="#fff" opacity="0.2" />

        {/* Rocker shading */}
        <rect x="120" y="236" width="720" height="24" fill="#000" opacity="0.32" />
      </g>

      {/* Charge port */}
      <circle cx="690" cy="170" r="8" fill="#000" opacity="0.32" />
      <circle cx="690" cy="170" r="4" fill={accent} />

      {/* The second front wheel, set back and dimmed — this is what makes the
          stance read as three-wheeled rather than as an ordinary coupe. */}
      <g opacity="0.6">
        <circle cx="212" cy="252" r="52" fill="#080a0f" />
        <circle cx="212" cy="252" r="52" stroke="#000" strokeOpacity="0.5" strokeWidth="3" />
        <circle cx="212" cy="252" r="27" fill="#39404d" />
      </g>

      {/* Front wheel — nearest to camera, drawn over the body */}
      <g>
        <circle cx="268" cy="246" r="60" fill={`url(#${g('tyre')})`} />
        <circle cx="268" cy="246" r="60" stroke="#000" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="268" cy="246" r="33" fill={`url(#${g('rim')})`} />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="264"
            y="217"
            width="8"
            height="25"
            rx="3.5"
            fill="#10141b"
            opacity="0.5"
            transform={`rotate(${deg} 268 246)`}
          />
        ))}
        <circle cx="268" cy="246" r="10" fill="#1b1f28" />
      </g>

      {/* Ground line */}
      <path d="M206 292h516" stroke="#000" strokeOpacity="0.45" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
