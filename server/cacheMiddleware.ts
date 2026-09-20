/**
 * Lightweight in-memory GET response cache middleware (server-side).
 * Caches successful 2xx JSON responses per URL for `ttlMs` milliseconds.
 * Used for low-cardinality endpoints like /configurator/data, /packages.
 * Max 200 entries with LRU-style eviction.
 */
const _cache = new Map();

export function cacheGet(ttlMs = 30000) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = `${req.originalUrl}`;
    const entry = _cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttlMs) {
      res.setHeader('X-Karovita-Cache', 'HIT');
      return res.json(entry.data);
    }
    if (entry) _cache.delete(key);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (_cache.size > 200) {
          const oldest = _cache.keys().next().value;
          _cache.delete(oldest);
        }
        _cache.set(key, { data: body, timestamp: Date.now() });
        res.setHeader('X-Karovita-Cache', 'MISS');
      }
      return originalJson(body);
    };
    next();
  };
}

// Invalidate cache entries whose key starts with the given prefix
export function invalidateCache(prefix) {
  for (const key of _cache.keys()) {
    if (!prefix || key.startsWith(prefix)) _cache.delete(key);
  }
}
