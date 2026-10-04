'use client';

import { API_URL } from './api';

export const TOKEN_KEY = 'vv.token';

export function readToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function writeToken(token: string) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — the session simply does not persist */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Browser-side API call that always carries the session token and turns a
 * NestJS error body into a readable message, so every caller can show the real
 * reason ("Your role does not include ...") in a toast instead of "failed".
 */
export async function request<T = any>(
  path: string,
  options: { method?: string; body?: any; signal?: AbortSignal } = {},
): Promise<T> {
  const token = readToken();
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Cannot reach the API. Is the backend running on port 4400?', 0);
  }

  const text = await res.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { message: text };
  }

  if (!res.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body: any) => request<T>(path, { method: 'POST', body }),
  patch: <T = any>(path: string, body: any) => request<T>(path, { method: 'PATCH', body }),
  del: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};
