const express = require('express');
const axios = require('axios');
const { createCacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// GET /api/fear-greed
router.get('/', createCacheMiddleware(600), async (req, res, next) => {
  try {
    const response = await axios.get('https://api.alternative.me/fng/', {
      timeout: 8000
    });

    const entry = response.data?.data?.[0];

    if (!entry) {
      return res.json(getMockFearGreed());
    }

    res.json({
      value: entry.value,
      value_classification: entry.value_classification,
      timestamp: entry.timestamp
    });
  } catch (error) {
    console.error('[FearGreed] Fetch failed:', error.message);
    res.json(getMockFearGreed());
  }
});

function getMockFearGreed() {
  return {
    value: '72',
    value_classification: 'Greed',
    timestamp: Math.floor(Date.now() / 1000).toString()
  };
}

module.exports = router;
