'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Command, LogOut, Menu, Search, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { AuthProvider, useAuth } from '@/lib/auth';

const NOTIFICATIONS = [
  { title: '12 orders moved to production', detail: 'Saint John Assembly · build week 37', at: '8m ago', level: 'info' },
  { title: 'Critical service ticket SR-050118', detail: 'Premier VV Dallas · drive unit', at: '41m ago', level: 'critical' },
  { title: 'Dealer onboarding complete', detail: 'VV Calgary passed certification', at: '3h ago', level: 'success' },
  { title: 'Allocation request', detail: 'VV Miami requested +40 units for Q4', at: '6h ago', level: 'warning' },
];

const LEVEL_DOT: Record<string, string> = {
  critical: 'bg-brand',
  warning: 'bg-ember',
  success: 'bg-volt',
  info: 'bg-chalk-500',
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShellBody>{children}</ShellBody>
      </AuthProvider>
    </ToastProvider>
  );
}

function ShellBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, ready, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLogin = pathname === '/admin/login';

  // Everything under /admin requires a session; the sign-in screen is the one
  // page that renders without the shell.
  useEffect(() => {
    if (ready && !user && !isLogin) router.replace('/admin/login');
  }, [ready, user, isLogin, router]);

  // Dropdowns must not survive a route change — the shell stays mounted across
  // sign-out, so a menu left open would block the next page's clicks.
  useEffect(() => {
    setMenuOpen(false);
    setBellOpen(false);
  }, [pathname]);

  if (isLogin) return <>{children}</>;

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
          <p className="text-sm text-chalk-500">
            {ready ? 'Redirecting to sign in…' : 'Checking your session…'}
          </p>
        </div>
      </div>
    );
  }

  const signOut = () => {
    setMenuOpen(false);
    setBellOpen(false);
    logout();
    toast.info('Signed out', 'Your session has ended.');
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[260px]'}`}>
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-chalk-300 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden max-w-md flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-600" />
              <input
                type="search"
                placeholder="Search orders, VINs, dealers, customers"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const term = (e.target as HTMLInputElement).value.trim();
                    if (term) router.push(`/admin/orders?search=${encodeURIComponent(term)}`);
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-16 text-sm text-white placeholder:text-chalk-600 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-chalk-600 md:flex">
                <Command className="h-3 w-3" />K
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBellOpen((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-chalk-300 transition hover:border-white/25 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-ink-950" />
                </button>

                {bellOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-80 animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-ink-900/97 shadow-panel backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium text-brand">
                          4 new
                        </span>
                      </div>
                      <ul className="max-h-80 overflow-y-auto">
                        {NOTIFICATIONS.map((n) => (
                          <li
                            key={n.title}
                            className="flex gap-3 border-b border-white/[0.05] px-4 py-3 transition hover:bg-white/[0.03]"
                          >
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[n.level]}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm text-white">{n.title}</p>
                              <p className="truncate text-xs text-chalk-500">{n.detail}</p>
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-chalk-600">{n.at}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  data-testid="user-menu"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition hover:border-white/25"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${user.roleColor}, ${user.roleColor}88)` }}
                  >
                    {user.name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-medium text-white">{user.name}</span>
                    <span className="block text-[10px] text-chalk-600">{user.roleName}</span>
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-72 animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-ink-900/97 shadow-panel backdrop-blur-xl">
                      <div className="border-b border-white/[0.07] px-4 py-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-white">
                          <UserCircle2 className="h-4 w-4 text-chalk-500" />
                          {user.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-chalk-500">{user.email}</p>
                        <span
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                          style={{ background: `${user.roleColor}22`, color: user.roleColor }}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {user.roleName} · {user.permissions.length} permissions
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/admin/roles"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-chalk-300 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Roles & permissions
                        </Link>
                        <button
                          type="button"
                          data-testid="sign-out"
                          onClick={signOut}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-chalk-300 transition hover:bg-brand/10 hover:text-brand-400"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
