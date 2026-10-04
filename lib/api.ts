import { fallback } from './fallback';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4400/api';

export interface ApiResult<T> {
  data: T;
  live: boolean;
}

/**
 * Fetches from the NestJS API and transparently degrades to the bundled demo
 * dataset when the API is unreachable, so a live pitch never dead-ends on a
 * connection error. `live` tells the UI which source it is rendering.
 */
export async function apiGet<T>(path: string, fallbackData: T, revalidateSeconds = 0): Promise<ApiResult<T>> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
      ...(revalidateSeconds > 0 ? { next: { revalidate: revalidateSeconds } } : { cache: 'no-store' as RequestCache }),
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return { data: (await res.json()) as T, live: true };
  } catch {
    return { data: fallbackData, live: false };
  }
}

export const qs = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== 'all') search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : '';
};

/* ---------------------------------------------------------------------------
 * Typed endpoint helpers used by the admin pages and the public site.
 * ------------------------------------------------------------------------ */

export const getDashboard = () => apiGet<any>('/dashboard', fallback.dashboard);

export const getOrders = (params: Record<string, string | number | undefined> = {}) =>
  apiGet<any>(`/orders${qs(params)}`, fallback.orders(Number(params.page) || 1, Number(params.pageSize) || 20));

export const getDealers = (params: Record<string, string | number | undefined> = {}) =>
  apiGet<any>(`/dealers${qs(params)}`, fallback.dealers(Number(params.page) || 1, Number(params.pageSize) || 20));

export const getDealerRegions = () => apiGet<any>('/dealers/regions', fallback.regionsList);

export const getVehicles = (params: Record<string, string | number | undefined> = {}) =>
  apiGet<any>(`/vehicles${qs(params)}`, fallback.vehicles(Number(params.page) || 1, Number(params.pageSize) || 20));

export const getVehicleSummary = () => apiGet<any>('/vehicles/summary', fallback.vehicleSummary);

export const getCustomers = (params: Record<string, string | number | undefined> = {}) =>
  apiGet<any>(`/customers${qs(params)}`, fallback.customers(Number(params.page) || 1, Number(params.pageSize) || 20));

export const getCustomerSummary = () => apiGet<any>('/customers/summary', fallback.customerSummary);

export const getTickets = (params: Record<string, string | number | undefined> = {}) =>
  apiGet<any>(`/service${qs(params)}`, fallback.tickets(Number(params.page) || 1, Number(params.pageSize) || 20));

export const getServiceSummary = () => apiGet<any>('/service/summary', fallback.serviceSummary);

export const getAnalytics = () => apiGet<any>('/analytics', fallback.analytics);

export const getLocator = (search?: string) =>
  apiGet<any>(`/dealers/locator${qs({ search })}`, fallback.locator, 60);
