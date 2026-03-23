const express = require('express');
const { createCacheMiddleware } = require('../middleware/cache');
const { getPair, searchPairs } = require('../services/dexscreenerService');

const router = express.Router();

// GET /api/dexscreener/search?q=PEPE
router.get('/search', createCacheMiddleware(60), async (req, res, next) => {
  try {
    const results = await searchPairs(req.query.q);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// GET /api/dexscreener/pair/:chainId/:pairId
router.get('/pair/:chainId/:pairId', createCacheMiddleware(120), async (req, res, next) => {
  try {
    const pair = await getPair(req.params.chainId, req.params.pairId);
    if (!pair) {
      return res.status(404).json({ error: 'pair not found' });
    }

    res.json(pair);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
