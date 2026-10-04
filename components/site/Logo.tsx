/** VV monogram inside a three-wheel stance — used in the header, footer and admin rail. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="vv-logo-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6A1F" />
          <stop offset="55%" stopColor="#E11D2E" />
          <stop offset="100%" stopColor="#8F0F1C" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#vv-logo-grad)" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />
      <path
        d="M12 16l7 16 5-11 5 11 7-16"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="38" r="2.4" fill="#fff" />
    </svg>
  );
}
