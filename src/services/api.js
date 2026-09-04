// In unified full-stack architecture, all API requests route directly to /api on the current host
import { logError } from './logger';
import { getAuthToken } from './authStorage';

const BASE = '/api';

export async function api(path, options = {}) {
  const token = getAuthToken();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const fullUrl = BASE + cleanPath;
  
  let r;
  try {
    r = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (networkErr) {
    console.error('API Fetch Network Error on:', fullUrl, networkErr);
    logError(networkErr, { url: fullUrl, type: 'network_failure' });
    throw new Error('خطا در اتصال به سرور. لطفا اتصال اینترنت یا سرور را بررسی کنید.');
  }
  
  let d = {};
  try {
    d = await r.json();
  } catch (err) {
    if (!r.ok) {
      logError(new Error(`Server returned ${r.status} non-json`), { url: fullUrl, status: r.status });
      throw new Error(`خطای سرور (${r.status})`);
    }
    return {};
  }
  
  if (!r.ok) {
    if (r.status >= 500) {
      logError(new Error(d.message || `Server 5xx Error (${r.status})`), { url: fullUrl, status: r.status, response: d });
    }
    throw new Error(d.message || `خطا در پردازش درخواست (${r.status})`);
  }
  
  return d;
}



