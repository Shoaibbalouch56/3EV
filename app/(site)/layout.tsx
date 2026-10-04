import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { ToastProvider } from '@/components/ui/Toast';
import { IntroCurtain } from '@/components/site/IntroCurtain';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="public-3d relative flex min-h-screen flex-col">
        <IntroCurtain />
        <div className="site-ambient" aria-hidden="true" />
        <SiteHeader />
        <main className="relative flex-1">{children}</main>
        <SiteFooter />
      </div>
    </ToastProvider>
  );
}
