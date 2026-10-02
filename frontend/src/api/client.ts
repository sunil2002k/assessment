import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// The ONE API client. Cookies are httpOnly, so JS never sees tokens;
// withCredentials just makes sure the browser attaches them.
export const api = axios.create({ baseURL: '/api', withCredentials: true });

let onAuthFailure: () => void = () => {};
export const setAuthFailureHandler = (fn: () => void) => {
  onAuthFailure = fn;
};

// Single-flight: every 401 that arrives while a refresh is running awaits the same promise,
// so N parallel failures cause exactly one POST /auth/refresh.
let refreshPromise: Promise<void> | null = null;
const refresh = (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// These endpoints must never trigger a refresh (wrong password, loops, logout).
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout'];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      NO_REFRESH.some((p) => original.url?.includes(p))
    ) {
      return Promise.reject(error);
    }

    original._retry = true; // retry each request at most once
    try {
      await refresh();
      return api(original);
    } catch (refreshError) {
      onAuthFailure(); // clear user state -> route guards send the user to /login
      return Promise.reject(refreshError);
    }
  },
);
