import Cookies from 'js-cookie';

// 30 Days expiration for persistent login
const COOKIE_EXPIRES_DAYS = 30;

// Keys
const TOKEN_KEY = 'karovita_token';
const USER_KEY = 'karovita_user';
const ROLE_KEY = 'karovita_role';
const MOBILE_KEY = 'draft_mobile';

/**
 * Save authentication state to both Cookies (persistent) and LocalStorage (speed/compatibility)
 */
export function saveAuthState(token, user = null) {
  if (!token) return;

  try {
    // 1. Set in Cookie with secure, sameSite, path, 30 days
    Cookies.set(TOKEN_KEY, token, {
      expires: COOKIE_EXPIRES_DAYS,
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    });

    if (user) {
      Cookies.set(USER_KEY, JSON.stringify(user), {
        expires: COOKIE_EXPIRES_DAYS,
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      });
      if (user.role) {
        Cookies.set(ROLE_KEY, user.role, {
          expires: COOKIE_EXPIRES_DAYS,
          path: '/',
          sameSite: 'lax',
          secure: window.location.protocol === 'https:',
        });
      }
    }
  } catch (err) {
    console.warn('Failed to set cookie', err);
  }

  // 2. Set in LocalStorage as synchronized fallback
  try {
    localStorage.setItem('token', token);
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.role) {
        localStorage.setItem('role', user.role);
        localStorage.setItem(ROLE_KEY, user.role);
      }
    }
  } catch (err) {
    console.warn('Failed to set localStorage', err);
  }
}

/**
 * Get active auth token from Cookie first, then fallback to LocalStorage
 */
export function getAuthToken() {
  try {
    const cookieToken = Cookies.get(TOKEN_KEY);
    if (cookieToken && cookieToken.trim() !== '') {
      return cookieToken;
    }
  } catch (e) {}

  try {
    return localStorage.getItem('token') || localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Get active user data from Cookie or LocalStorage
 */
export function getStoredUser() {
  try {
    const cookieUser = Cookies.get(USER_KEY);
    if (cookieUser) {
      return JSON.parse(cookieUser);
    }
  } catch (e) {}

  try {
    const localUser = localStorage.getItem('user') || localStorage.getItem(USER_KEY);
    if (localUser) {
      return JSON.parse(localUser);
    }
  } catch (e) {}

  return null;
}

/**
 * Get user role ('admin' | 'user')
 */
export function getStoredRole() {
  try {
    const cookieRole = Cookies.get(ROLE_KEY);
    if (cookieRole) return cookieRole;
  } catch (e) {}

  try {
    return localStorage.getItem('role') || localStorage.getItem(ROLE_KEY) || null;
  } catch (e) {}

  return null;
}

/**
 * Clear all cookies and storage upon logout
 */
export function clearAuthState() {
  try {
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });
    Cookies.remove(ROLE_KEY, { path: '/' });
    Cookies.remove('token', { path: '/' });
  } catch (e) {}

  try {
    localStorage.removeItem('token');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('role');
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem('intent');
  } catch (e) {}
}
