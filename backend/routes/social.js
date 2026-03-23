const express = require('express');
const router = express.Router();
const { createCacheMiddleware } = require('../middleware/cache');
const { getNewsForCoin, computeNewsVelocity } = require('../services/cryptoPanicService');
const { getSocialData } = require('../services/lunarCrushService');

// GET /api/social/cryptopanic/:coin
router.get('/cryptopanic/:coin', createCacheMiddleware(90), async (req, res) => {
  try {
    const coin = req.params.coin;
    const news = await getNewsForCoin(coin);
    const velocity = computeNewsVelocity(news);

    res.json({
      posts: news,
      velocity,
      sources: ['cryptopanic'],
      cached_at: Date.now(),
    });
  } catch (error) {
    console.error('[Social/CryptoPanic] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/social/lunarcrush/:coin
router.get('/lunarcrush/:coin', createCacheMiddleware(90), async (req, res) => {
  try {
    const coin = req.params.coin;
    const socialData = await getSocialData(coin);

    res.json({
      posts: [],
      velocity: null,
      social: socialData,
      sources: ['lunarcrush'],
      cached_at: Date.now(),
    });
  } catch (error) {
    console.error('[Social/LunarCrush] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
