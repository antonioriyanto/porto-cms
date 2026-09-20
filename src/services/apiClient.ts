/**
 * Universal Admin API Client Helper
 * Handles authentication tokens (Bearer + X-Admin-Token) and credentials
 * to ensure reliable communication across direct windows, cross-origin embeds, and iframes.
 */

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('admin_session_token') || sessionStorage.getItem('admin_session_token');
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('admin_session_token', token);
      sessionStorage.setItem('admin_session_token', token);
    } else {
      localStorage.removeItem('admin_session_token');
      sessionStorage.removeItem('admin_session_token');
    }
  } catch (err) {
    console.warn('Unable to persist admin token:', err);
  }
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);

  if (token) {
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('X-Admin-Token')) {
      headers.set('X-Admin-Token', token);
    }
  }

  // Ensure JSON content-type if body is a string and no header set
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include' // Sends cookies along with headers for maximum compatibility
  });
}
