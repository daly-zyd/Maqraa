import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

/** Base URL of the Django API, e.g. https://api.example.tn/api/v1 (empty = same origin `/api/v1`). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api/v1';

export const apiClient = axios.create({ baseURL: API_BASE, timeout: 15000 });

const AUTH_PATHS = ['/auth/login/', '/auth/refresh/', '/auth/otp/', '/auth/password/'];
const isAuthCall = (url?: string) => AUTH_PATHS.some((p) => url?.includes(p));

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token && !isAuthCall(config.url)) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

/** One refresh at a time: concurrent 401s wait for the same promise. */
let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
    tokenStore.setAccess(data.access);
    tokenStore.setRefresh(data.refresh);
    return data.access as string;
  } catch {
    tokenStore.clear();
    return null;
  }
}

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined;
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall(original.url)) {
      original._retried = true;
      refreshing ??= refreshAccess().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`);
        return apiClient(original);
      }
      window.dispatchEvent(new Event('maqraa:session-expired'));
    }
    return Promise.reject(error);
  }
);

/** Arabic, user-facing message for any API failure. Never says whether an account exists. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'تعذّر الاتصال بالخادم. تحقّق من الاتصال بالإنترنت ثم أعد المحاولة.';
    const status = error.response.status;
    if (status === 429) return 'محاولات كثيرة. انتظر قليلا ثم حاول مرة أخرى.';
    if (status === 401) return (error.response.data?.detail as string) || 'بيانات الدخول غير صحيحة.';
    if (status === 400 && error.response.data?.detail) return error.response.data.detail as string;
    if (status >= 500) return 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.';
  }
  return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}
