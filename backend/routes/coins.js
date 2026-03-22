const express = require('express');
const router = express.Router();
const { getTrendingCoins, getCoinPrice } = require('../services/coingeckoService');
const { createCacheMiddleware } = require('../middleware/cache');

// GET /api/coins/trending
router.get('/trending', createCacheMiddleware(120), async (req, res, next) => {
  try {
    const coins = await getTrendingCoins();
    const enriched = await Promise.all(
      coins.map(async (coin) => {
        const price = await getCoinPrice(coin.id);
        return { ...coin, ...price };
      })
    );
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

// GET /api/coins/price/:coinId
router.get('/price/:coinId', createCacheMiddleware(60), async (req, res, next) => {
  try {
    const price = await getCoinPrice(req.params.coinId);
    res.json(price);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
