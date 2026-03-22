const express = require('express');
const router = express.Router();
const { searchCoinMentions, computeMentionVelocity } = require('../services/redditService');
const { createCacheMiddleware } = require('../middleware/cache');

// GET /api/reddit/:coin
router.get('/:coin', createCacheMiddleware(90), async (req, res, next) => {
  try {
    const posts = await searchCoinMentions(req.params.coin);
    const velocity = computeMentionVelocity(posts);
    res.json({
      posts,
      velocity,
      cached_at: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
