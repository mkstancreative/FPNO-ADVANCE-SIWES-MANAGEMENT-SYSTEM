import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { RefreshTokenResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Token Storage Helpers ─────────────────────────────────────────────────────
export const TOKEN_KEY = "siwes_access_token";
export const REFRESH_KEY = "siwes_refresh_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export function dispatchSessionExpired() {
  clearTokens();
  window.dispatchEvent(new CustomEvent("siwes:session-expired"));
}

/**
 * An admin can switch a staff account off. Every request then fails with
 * `401 "Account is deactivated"` — a 401 no refresh token can fix, so it must
 * not go down the refresh path, and the reason has to reach the user rather
 * than dropping them at the login screen with no explanation.
 */
export function dispatchAccountDeactivated(message: string) {
  clearTokens();
  window.dispatchEvent(
    new CustomEvent("siwes:account-deactivated", { detail: { message } }),
  );
}

/** Reads as a deactivation rather than an expired or missing token. */
const isDeactivatedResponse = (error: AxiosError): boolean =>
  /deactivat|disabled/i.test(
    (error.response?.data as { message?: string } | undefined)?.message ?? "",
  );

// ─── Axios Instances ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
});

/**
 * Bare instance for endpoints the backend serves without authentication —
 * the Remita `verify-payment` callbacks and public certificate verification.
 * Those routes take no `Authorization` header by design, and routing them
 * through `api` would also drag an expired token into the refresh/session-
 * expired flow on pages a signed-out visitor is allowed to open.
 */
export const publicApi = axios.create({
  baseURL: API_URL,
});

// ─── Request Interceptor — Attach Access Token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — Auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const url = originalRequest.url || "";
    const isLoginOrRefresh =
      url.includes("/auth/login") || url.includes("/auth/refresh-token");

    // A deactivated account is terminal: refreshing would succeed and the next
    // call would fail the same way, so say why and stop.
    if (error.response?.status === 401 && isDeactivatedResponse(error)) {
      if (!isLoginOrRefresh) {
        dispatchAccountDeactivated(
          (error.response?.data as { message?: string } | undefined)?.message ||
            "This account has been deactivated.",
        );
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginOrRefresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        dispatchSessionExpired();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<
          RefreshTokenResponse & { data: { refreshToken?: string } }
        >(`${API_URL}/auth/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken || refreshToken;

        storeTokens(newToken, newRefreshToken);
        processQueue(null, newToken);
        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        dispatchSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── Shared Utilities ─────────────────────────────────────────────────────────

/**
 * Extracts a human-readable API error message from an unknown error object.
 * Checks for Axios response payloads, standard Errors, and provides a clean fallback.
 */
/**
 * What a user is told when their role is the thing standing in the way. The
 * backend's own wording — "Role 'coordinator' is not authorized to access this
 * resource" — is diagnostic, and naming the role back at someone reads as an
 * accusation rather than an explanation.
 */
export const PERMISSION_DENIED_MESSAGE =
  "You do not have permission for this. Contact the SIWES administrator.";

/** True when the request failed because of the caller's role. */
export const isForbidden = (error: unknown): boolean =>
  getApiErrorStatus(error) === 403;

export const getApiErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    // Swap only the role-authorization wording; a 403 carrying a real business
    // reason should still say what it says.
    if (
      error.response.status === 403 &&
      /not authorized to access this resource|^Role /i.test(
        error.response.data.message,
      )
    ) {
      return PERMISSION_DENIED_MESSAGE;
    }
    return error.response.data.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

/** HTTP status of a failed request, or `undefined` if it never reached the server. */
export const getApiErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/**
 * Response body of a failed request. The payment endpoints lean on this — a 400
 * from `POST /certificates/request` carries the `rrr` of the unpaid order so the
 * student can be sent straight back to it instead of starting over.
 */
export const getApiErrorData = <T = Record<string, unknown>>(
  error: unknown,
): T | undefined =>
  axios.isAxiosError(error)
    ? (error.response?.data as T | undefined)
    : undefined;
