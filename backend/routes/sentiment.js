const express = require('express');
const router = express.Router();
const { analyzeWithAI } = require('../services/aiService');
const { SENTIMENT_PROMPT, HYPE_STAGE_PROMPT } = require('../services/prompts');
const { isDemoMode } = require('../services/runtime');

// POST /api/sentiment
router.post('/', async (req, res, next) => {
  try {
    const { coin, posts } = req.body;

    if (!coin || !posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ error: 'coin and posts (non-empty array) are required' });
    }

    const userMessage = `Coin: ${coin}\n\nPosts:\n${posts.map(p => '- ' + p.title).join('\n')}`;

    if (isDemoMode()) {
      return res.json(getMockSentiment(coin));
    }

    try {
      const result = await analyzeWithAI(SENTIMENT_PROMPT, userMessage);
      res.json(result);
    } catch (aiError) {
      console.log('[Sentiment] AI unavailable, using mock data');
      res.json(getMockSentiment(coin));
    }
  } catch (error) {
    next(error);
  }
});

function getMockSentiment(coin) {
  const mocks = {
    'floki': { coin: 'FLOKI', sentiment_score: 91, primary_emotion: 'hype', confidence: 87, themes: ['partnership announcement', 'whale accumulation', 'breakout pattern'], coordinated_flag: false, summary: 'FLOKI is experiencing a surge of organic enthusiasm driven by partnership news and whale activity. Community sentiment is overwhelmingly bullish with authentic, non-coordinated posting patterns.' },
    'pepe': { coin: 'PEPE', sentiment_score: 78, primary_emotion: 'FOMO', confidence: 82, themes: ['Elon engagement', 'volume explosion', 'exchange listings'], coordinated_flag: false, summary: 'PEPE sentiment is strongly bullish with FOMO driving new entrants. Elon Musk social engagement has amplified market attention significantly.' },
    'doge': { coin: 'DOGE', sentiment_score: 72, primary_emotion: 'belief', confidence: 79, themes: ['X payments integration', 'adoption growth', 'institutional interest'], coordinated_flag: false, summary: 'Dogecoin community shows strong conviction driven by persistent X payment rumors. On-chain metrics support growing real-world adoption narrative.' },
    'shib': { coin: 'SHIB', sentiment_score: 45, primary_emotion: 'speculation', confidence: 64, themes: ['Shibarium growth', 'burn rate increase', 'ecosystem expansion'], coordinated_flag: false, summary: 'SHIB sentiment is cautiously optimistic with focus on ecosystem development. Shibarium metrics are positive but broader sentiment remains tepid.' },
    'bonk': { coin: 'BONK', sentiment_score: 85, primary_emotion: 'hype', confidence: 76, themes: ['Solana memecoin leader', 'trading volume surge', 'NFT collection'], coordinated_flag: false, summary: 'BONK is riding high on Solana ecosystem momentum. BONKbot volume milestones and community growth are driving strong positive sentiment.' },
  };
  return mocks[coin.toLowerCase()] || {
    coin, sentiment_score: 65, primary_emotion: 'speculation', confidence: 60,
    themes: ['community growth', 'market momentum', 'new listings'],
    coordinated_flag: false, summary: `${coin} shows moderate positive sentiment with growing community interest and speculative energy.`
  };
}

module.exports = router;
