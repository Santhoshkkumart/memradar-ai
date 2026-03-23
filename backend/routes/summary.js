const express = require('express');
const router = express.Router();
const { createCacheMiddleware } = require('../middleware/cache');
const { getCoinSummary } = require('../services/coinSummaryService');

router.get('/:coin', createCacheMiddleware(300), async (req, res) => {
  try {
    const summary = await getCoinSummary(req.params.coin);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Could not load summary. Try again.' });
  }
});

module.exports = router;
