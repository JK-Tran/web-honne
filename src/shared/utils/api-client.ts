/**
 * Centralized API Client with Automatic JWT Refresh & Queue Mutex
 * Handles Access Token (1h) and Refresh Token (7 days / 1 week)
 * Automatically intercepts 401 and pro-actively refreshes expired tokens
 */

export const API_BASE_URL = 'https://api-honne.hanhan02102012.workers.dev/api';

const ACCESS_TOKEN_KEY = 'honne_access_token';
const REFRESH_TOKEN_KEY = 'honne_refresh_token';
const AUTH_USER_KEY = 'honne_auth_user';

export function getStoredAccessToken(): string | null {
  try {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) {
      const adminToken = localStorage.getItem('honne_admin_token');
      if (adminToken) return adminToken;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('honne_admin_token');
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  try {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdmin) {
      const adminRefresh = localStorage.getItem('honne_admin_refresh_token');
      if (adminRefresh) return adminRefresh;
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('honne_admin_refresh_token');
  } catch {
    return null;
  }
}

export function setStoredTokens(accessToken?: string, refreshToken?: string): void {
  try {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (accessToken) {
      if (isAdmin) {
        localStorage.setItem('honne_admin_token', accessToken);
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      if (isAdmin) {
        localStorage.setItem('honne_admin_refresh_token', refreshToken);
      }
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    window.dispatchEvent(
      new CustomEvent('honne:token_refreshed', {
        detail: { accessToken, refreshToken }
      })
    );
  } catch (e) {
    console.error('Failed to store tokens in localStorage:', e);
  }
}

export function clearStoredTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('honne_admin_token');
    localStorage.removeItem('honne_admin_refresh_token');
    localStorage.removeItem('honne_admin_user');
    window.dispatchEvent(new CustomEvent('honne:auth_expired'));
  } catch (e) {
    console.error('Failed to clear tokens:', e);
  }
}

/**
 * Decode JWT payload and check whether token is expired or about to expire
 */
export function isTokenExpired(token: string | null | undefined, bufferSeconds = 30): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Base64Url decode payload
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    // Returns true if expired or will expire within bufferSeconds
    return payload.exp <= now + bufferSeconds;
  } catch {
    return true;
  }
}

// Single-flight refresh mutex to prevent duplicate concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

/**
 * Execute Token Refresh with deduplication
 */
export async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = getStoredRefreshToken();
  if (!currentRefreshToken) {
    clearStoredTokens();
    return null;
  }

  // If a refresh is already in-flight, return the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.accessToken) {
        setStoredTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }

      // If refresh token is expired (7 days) or invalid, clear session
      if (res.status === 401 || data?.code === 'REFRESH_TOKEN_EXPIRED_OR_INVALID') {
        console.warn('Refresh token expired or invalid (1 week limit reached). Logging out.');
        clearStoredTokens();
      }
      return null;
    } catch (err) {
      console.warn('Network error during refreshAccessToken:', err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Robust fetch wrapper that automatically:
 * 1. Checks if access token is expired before sending (proactive refresh)
 * 2. Attaches Authorization: Bearer <token>
 * 3. Catches 401 responses, performs mutex token refresh, and retries the request once
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  let accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  // 1. Proactive Refresh: If token is expired or within 30s of expiring, refresh first
  if (isTokenExpired(accessToken) && refreshToken) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      accessToken = newAccessToken;
    }
  }

  // Helper to build headers with current token
  const buildHeaders = (token: string | null) => {
    const headers = new Headers(init.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  };

  // Perform initial request
  let response = await fetch(input, {
    ...init,
    headers: buildHeaders(accessToken)
  });

  // 2. Reactive Refresh: If unauthorized (401), attempt refresh and retry once
  if (response.status === 401) {
    const requestUrl = typeof input === 'string' ? input : (input as Request).url || '';
    const isAuthRoute = requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/login');

    if (!isAuthRoute && refreshToken) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        // Retry the original request with the fresh token
        response = await fetch(input, {
          ...init,
          headers: buildHeaders(newAccessToken)
        });
      }
    }
  }

  return response;
}
