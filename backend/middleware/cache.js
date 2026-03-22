const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 120 });

function createCacheMiddleware(ttl = 120) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

module.exports = { createCacheMiddleware, cache };
