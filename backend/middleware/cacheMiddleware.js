const cache = new Map();

/**
 * Express API caching middleware.
 * Scopes cache key by user ID to prevent data leakage across sessions.
 * Intercepts res.send to save data for GET requests.
 * 
 * @param {Number} durationInSeconds Cache duration in seconds (default 60)
 */
export const cacheMiddleware = (durationInSeconds = 60) => {
  return (req, res, next) => {
    // Only cache safe retrieval requests
    if (req.method !== 'GET') {
      return next();
    }

    // Scope cache key by user identifier to respect tenancy constraints
    const userId = req.user ? req.user._id.toString() : 'anonymous';
    const key = `${req.originalUrl || req.url}::user::${userId}`;

    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Cache-Status', 'HIT');
      return res.send(cached.body);
    }

    // Intercept send method
    const originalSend = res.send;
    res.send = function (body) {
      // Only cache success responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          body,
          expiresAt: Date.now() + durationInSeconds * 1000,
        });
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Selective cache purger utility
 * @param {String} pattern Substring or keyword matching keys to delete
 */
export const clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
