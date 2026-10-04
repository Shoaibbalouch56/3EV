import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Visionary Vehicles | Bricklin 3EV',
    template: '%s | Visionary Vehicles',
  },
  description:
    'The Bricklin 3EV — a pure-electric, three-wheel, two-passenger vehicle. 275+ miles of range from $39,980, delivered through a nationwide dealer sales and service network.',
  keywords: ['Bricklin 3EV', 'Visionary Vehicles', 'electric vehicle', 'three wheel EV', 'EV dealer network'],
  openGraph: {
    title: 'Visionary Vehicles | Bricklin 3EV',
    description: 'Pure-electric. Three wheels. 275+ miles of range. From $39,980.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#06070A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
