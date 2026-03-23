const express = require('express');
const router = express.Router();
const { createCacheMiddleware } = require('../middleware/cache');
const { getGoogleSearchResults } = require('../services/googleSearchService');

// GET /api/search/google/:coin
router.get('/google/:coin', createCacheMiddleware(120), async (req, res) => {
  try {
    const results = await getGoogleSearchResults(req.params.coin);
    res.json(results);
  } catch (error) {
    console.error('[Search/Google] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
