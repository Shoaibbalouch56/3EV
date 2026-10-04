'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, KeyRound, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/client-api';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  roleName: string;
  roleColor: string;
  status: string;
  permissionCount: number;
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login, user, ready } = useAuth();

  const [email, setEmail] = useState('malcolm@vvcars.com');
  const [password, setPassword] = useState('demo1234');
  const [busy, setBusy] = useState(false);
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    api
      .get('/auth/demo-accounts')
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (ready && user) router.replace('/admin');
  }, [ready, user, router]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const signedIn = await login(email, password);
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}`, `Signed in as ${signedIn.roleName}.`);
      router.replace('/admin');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Something went wrong.';
      toast.error('Sign in failed', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-dark bg-[size:64px_64px] opacity-40" />
        <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(225,29,46,0.25),transparent_60%)] blur-3xl" />
      </div>

      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Sign-in card */}
        <div className="panel p-7 sm:p-9">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-display text-sm font-semibold text-white">
              Visionary<span className="text-brand"> Vehicles</span>
            </span>
          </Link>

          <h1 className="heading-md mt-8 text-white">Sign in</h1>
          <p className="mt-2 text-sm text-chalk-500">
            Management platform — orders, dealers, inventory, CRM and service.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-500">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-chalk-600 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-500">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-chalk-600 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-ember/25 bg-ember/[0.06] px-3.5 py-3 text-[11px] leading-relaxed text-chalk-400">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />
            Demonstration authentication. Passwords are stored in plain text in the demo dataset;
            production uses hashed credentials and short-lived tokens.
          </p>

          <Link href="/" className="mt-5 inline-flex items-center gap-1.5 text-xs text-chalk-500 hover:text-white">
            Back to the public site
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Role switcher */}
        <div className="panel p-7 sm:p-9">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <h2 className="font-display text-base font-semibold text-white">Sign in as any role</h2>
          </div>
          <p className="mt-2 text-sm text-chalk-500">
            Each account carries a different permission set. Pick one to see exactly what that role
            can open, edit and delete — the restrictions are enforced by the API, not just hidden in
            the UI.
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {accounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  toast.info('Credentials filled', `${account.name} · ${account.roleName}`);
                }}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{account.name}</p>
                  {account.status !== 'active' && (
                    <span className="rounded-full border border-brand/35 bg-brand/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-brand-400">
                      Suspended
                    </span>
                  )}
                </div>
                <span
                  className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: `${account.roleColor}22`, color: account.roleColor }}
                >
                  {account.roleName}
                </span>
                <p className="mt-2 truncate text-[11px] text-chalk-600">{account.email}</p>
                <p className="mt-1 text-[11px] text-chalk-600">{account.permissionCount} permissions</p>
              </button>
            ))}

            {accounts.length === 0 && (
              <p className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-chalk-500">
                Demo accounts load from the API. Start the backend on port 4400 to see them
                (<span className="font-mono text-xs">npm run dev</span> in <span className="font-mono text-xs">backend/</span>).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
