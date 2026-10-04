import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06070A',
          900: '#0A0C11',
          850: '#0E1117',
          800: '#12161E',
          700: '#1A1F29',
          600: '#252B38',
        },
        chalk: {
          50: '#F7F8FA',
          100: '#EDEFF3',
          300: '#C3C8D2',
          500: '#8A92A2',
          600: '#6B7384',
        },
        brand: {
          DEFAULT: '#E11D2E',
          50: '#FFF1F2',
          400: '#FF4A5A',
          500: '#E11D2E',
          600: '#BE1425',
          700: '#8F0F1C',
        },
        ember: '#FF6A1F',
        volt: '#2ED3A7',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(225,29,46,0.25), 0 18px 60px -18px rgba(225,29,46,0.55)',
        panel: '0 24px 70px -30px rgba(0,0,0,0.85)',
        lift: '0 10px 40px -16px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-brand':
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(225,29,46,0.22), transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(320%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.8s ease both',
        marquee: 'marquee 32s linear infinite',
        sweep: 'sweep 3.6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
