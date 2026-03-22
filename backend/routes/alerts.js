const express = require('express');
const router = express.Router();
const { analyzeWithAI } = require('../services/aiService');
const { ALERT_PROMPT } = require('../services/prompts');
const { isDemoMode } = require('../services/runtime');

// POST /api/alerts
router.post('/', async (req, res, next) => {
  try {
    const { coin, sentiment_score, hype_stage, velocity } = req.body;

    if (!coin) {
      return res.status(400).json({ error: 'coin is required' });
    }

    // Only fire alert if threshold crossed
    const shouldAlert = velocity > 3 || sentiment_score > 70 || hype_stage === 'early_whisper';

    if (!shouldAlert) {
      return res.json(null);
    }

    const isCritical = velocity > 8 && sentiment_score > 75;

    const userMessage = `Coin: ${coin}\nSentiment Score: ${sentiment_score}\nHype Stage: ${hype_stage}\nMention Velocity: ${velocity}\nCritical Alert: ${isCritical}`;

    if (isDemoMode()) {
      const result = getMockAlert(coin, sentiment_score, velocity, isCritical);
      return res.json(result);
    }

    try {
      const result = await analyzeWithAI(ALERT_PROMPT, userMessage);
      result.timestamp = Date.now();
      result.is_critical = isCritical;
      res.json(result);
    } catch (aiError) {
      console.log('[Alert] AI unavailable, using mock');
      res.json(getMockAlert(coin, sentiment_score, velocity, isCritical));
    }
  } catch (error) {
    next(error);
  }
});

function getMockAlert(coin, sentiment, velocity, isCritical) {
  const alerts = {
    'floki': {
      coin: 'FLOKI',
      alert_level: isCritical ? 'critical' : 'alert',
      headline: '🚨 FLOKI — Strongest social signal in 72 hours',
      body: `Mention velocity spiked ${velocity || 6.2}x in 2 hours with sentiment at +${sentiment || 91}. Partnership announcement driving organic community expansion across 4 major crypto subreddits simultaneously.`,
      emoji: '🚨',
      timestamp: Date.now(),
      is_critical: isCritical
    },
    'pepe': {
      coin: 'PEPE',
      alert_level: 'alert',
      headline: '🐸 PEPE — Elon engagement triggers FOMO wave',
      body: `Trading volume up 400% after Elon Musk liked PEPE-related tweet. Sentiment score at +${sentiment || 78} with 3 new exchange listing rumors circulating.`,
      emoji: '🐸',
      timestamp: Date.now(),
      is_critical: false
    },
    'bonk': {
      coin: 'BONK',
      alert_level: 'alert',
      headline: '🦴 BONK — Solana memecoin throne captured',
      body: `BONK flipped MYRO market cap with BONKbot processing $100M+ in 24hr volume. Social mentions accelerating ${velocity || 4.5}x across Solana communities.`,
      emoji: '🦴',
      timestamp: Date.now(),
      is_critical: false
    },
    'doge': {
      coin: 'DOGE',
      alert_level: 'caution',
      headline: '🐕 DOGE — X payment integration signals intensify',
      body: `Multiple insider sources confirming X payments in final testing. Transaction volume at 6-month high with sentiment at +${sentiment || 72}.`,
      emoji: '🐕',
      timestamp: Date.now(),
      is_critical: false
    },
  };

  return alerts[coin.toLowerCase()] || {
    coin,
    alert_level: isCritical ? 'critical' : 'watch',
    headline: `${coin} crossing hype threshold`,
    body: `Sentiment score at +${sentiment || 65} with velocity ratio at ${velocity || 3.5}x. Social signals suggest increased market attention.`,
    emoji: '📡',
    timestamp: Date.now(),
    is_critical: isCritical
  };
}

module.exports = router;
