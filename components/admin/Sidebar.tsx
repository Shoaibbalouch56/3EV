'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Car,
  ChevronLeft,
  ClipboardList,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { useAuth } from '@/lib/auth';

export const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Executive dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ClipboardList, permission: 'orders:view' },
      { href: '/admin/vehicles', label: 'Inventory & VINs', icon: Car, permission: 'vehicles:view' },
      { href: '/admin/customers', label: 'Customers', icon: Users, permission: 'customers:view' },
    ],
  },
  {
    title: 'Network',
    items: [
      { href: '/admin/dealers', label: 'Dealer network', icon: Store, permission: 'dealers:view' },
      { href: '/admin/service', label: 'Service & warranty', icon: LifeBuoy, permission: 'service:view' },
    ],
  },
  {
    title: 'Insight',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics:view' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/admin/roles', label: 'Roles & permissions', icon: ShieldCheck, permission: 'roles:view' },
      { href: '/admin/users', label: 'Users', icon: UserCog, permission: 'users:view' },
    ],
  },
];

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen,
  onClose,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { can, user } = useAuth();

  // Navigation is permission-driven: a role without `roles:view` never sees the
  // administration section at all.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !user || can(item.permission)),
  })).filter((section) => section.items.length > 0);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-5">
        <Logo className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-white">Visionary Vehicles</p>
            <p className="truncate text-[10px] uppercase tracking-[0.16em] text-chalk-600">
              Management platform
            </p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-chalk-400 lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-chalk-600">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        active
                          ? 'bg-brand/[0.12] text-white'
                          : 'text-chalk-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" aria-hidden="true" />
                      )}
                      <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand' : ''}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && user && (
        <div className="mx-3 mb-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-chalk-600">Signed in as</p>
          <p className="mt-1 truncate text-sm text-white">{user.name}</p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: `${user.roleColor}22`, color: user.roleColor }}
          >
            <ShieldCheck className="h-3 w-3" />
            {user.roleName} · {user.permissions.length} perms
          </span>
        </div>
      )}

      <div className="border-t border-white/[0.07] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-chalk-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Globe className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Public website</span>}
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-chalk-500 transition hover:bg-white/[0.05] hover:text-white lg:flex"
        >
          <ChevronLeft className={`h-[18px] w-[18px] shrink-0 transition ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.07] bg-ink-900/70 backdrop-blur-xl transition-all duration-300 lg:block ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-[272px] animate-fade-in border-r border-white/10 bg-ink-900">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
