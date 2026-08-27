// In unified full-stack architecture, all API requests route directly to /api on the current host
const BASE = '/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
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
    throw new Error('خطا در اتصال به سرور. لطفا اتصال اینترنت یا سرور را بررسی کنید.');
  }
  
  let d = {};
  try {
    d = await r.json();
  } catch (err) {
    if (!r.ok) {
      throw new Error(`خطای سرور (${r.status})`);
    }
    return {};
  }
  
  if (!r.ok) {
    throw new Error(d.message || `خطا در پردازش درخواست (${r.status})`);
  }
  
  return d;
}


