'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, readToken, writeToken } from './client-api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleColor: string;
  permissions: string[];
  dealerId: string | null;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  permissions: string[];
  ready: boolean;
  /** True when the caller's role grants `resource:action`. */
  can: (permission: string) => boolean;
  canAny: (...permissions: string[]) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const me = await api.get('/auth/me');
      setUser({ ...me.user, permissions: me.permissions });
    } catch {
      // Token no longer resolves (API restarted, user deleted) — sign out quietly.
      writeToken('');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Permissions can change while the user is signed in (an admin edits their
  // role), so re-read them whenever the tab regains focus.
  useEffect(() => {
    const onFocus = () => {
      if (readToken()) refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post('/auth/login', { email, password });
    writeToken(result.token);
    const me = await api.get('/auth/me');
    const nextUser = { ...me.user, permissions: me.permissions };
    setUser(nextUser);
    return nextUser as AuthUser;
  }, []);

  const logout = useCallback(() => {
    writeToken('');
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const permissions = user?.permissions ?? [];
    return {
      user,
      permissions,
      ready,
      can: (permission: string) => permissions.includes(permission),
      canAny: (...list: string[]) => list.some((p) => permissions.includes(p)),
      login,
      logout,
      refresh,
    };
  }, [user, ready, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Renders children only when the signed-in role has the permission. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}
