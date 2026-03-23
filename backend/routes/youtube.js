const express = require('express');
const router = express.Router();
const { createCacheMiddleware } = require('../middleware/cache');
const { searchYouTubeMentions, computeMentionVelocity } = require('../services/youtubeService');

// GET /api/youtube/:coin
router.get('/:coin', createCacheMiddleware(30), async (req, res, next) => {
  try {
    const posts = await searchYouTubeMentions(req.params.coin);
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
