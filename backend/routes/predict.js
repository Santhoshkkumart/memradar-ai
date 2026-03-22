const express = require('express');
const router = express.Router();
const { analyzeWithAI } = require('../services/aiService');
const { PREDICTION_PROMPT, HYPE_STAGE_PROMPT } = require('../services/prompts');
const { isDemoMode } = require('../services/runtime');

// POST /api/predict
router.post('/', async (req, res, next) => {
  try {
    const { coin, sentiment_score, velocity, stage, posts, mode } = req.body;

    if (!coin) {
      return res.status(400).json({ error: 'coin is required' });
    }

    // Hype stage classification mode
    if (mode === 'hype_stage') {
      if (isDemoMode()) {
        return res.json(getMockHypeStage(coin));
      }

      const userMessage = `Coin: ${coin}\nSentiment Score: ${sentiment_score}\nVelocity Ratio: ${velocity}\nCurrent context: Analyze what hype stage this coin is in based on social signals.`;

      try {
        const result = await analyzeWithAI(HYPE_STAGE_PROMPT, userMessage);
        return res.json(result);
      } catch (aiError) {
        return res.json(getMockHypeStage(coin));
      }
    }

    // Prediction mode
    const userMessage = `Coin: ${coin}\nSentiment Score: ${sentiment_score}\nMention Velocity: ${velocity}\nHype Stage: ${stage}\nRecent post titles: ${posts ? posts.map(p => p.title).join('; ') : 'N/A'}`;

    if (isDemoMode()) {
      return res.json(getMockPrediction(coin));
    }

    try {
      const result = await analyzeWithAI(PREDICTION_PROMPT, userMessage);
      res.json(result);
    } catch (aiError) {
      console.log('[Predict] AI unavailable, using mock');
      res.json(getMockPrediction(coin));
    }
  } catch (error) {
    next(error);
  }
});

function getMockHypeStage(coin) {
  const mocks = {
    'floki': { coin: 'FLOKI', hype_stage: 'early_whisper', stage_confidence: 89, velocity_trend: 'accelerating', estimated_hours_in_stage: 8, signal: 'Sharp 601% mention spike with 91+ sentiment concentrated in niche crypto subreddits — classic early whisper pattern before mainstream discovery' },
    'pepe': { coin: 'PEPE', hype_stage: 'building_momentum', stage_confidence: 84, velocity_trend: 'accelerating', estimated_hours_in_stage: 14, signal: 'Elon engagement combined with 400% volume increase signals transition from whisper to momentum phase' },
    'doge': { coin: 'DOGE', hype_stage: 'building_momentum', stage_confidence: 76, velocity_trend: 'stable', estimated_hours_in_stage: 24, signal: 'X payment rumors sustained across multiple communities with growing mainstream attention' },
    'shib': { coin: 'SHIB', hype_stage: 'cooling_down', stage_confidence: 68, velocity_trend: 'decelerating', estimated_hours_in_stage: 36, signal: 'Declining mention velocity despite positive ecosystem updates suggests momentum exhaustion' },
    'bonk': { coin: 'BONK', hype_stage: 'building_momentum', stage_confidence: 81, velocity_trend: 'accelerating', estimated_hours_in_stage: 10, signal: 'Solana ecosystem rotation into memecoins with BONK as primary beneficiary driving rapid community growth' },
  };
  return mocks[coin.toLowerCase()] || { coin, hype_stage: 'building_momentum', stage_confidence: 65, velocity_trend: 'stable', estimated_hours_in_stage: 18, signal: 'Moderate social activity detected across relevant communities' };
}

function getMockPrediction(coin) {
  const mocks = {
    'floki': { coin: 'FLOKI', direction: 'bullish', confidence: 89, time_window: '24-48 hours', catalyst: 'Partnership announcement combined with viral tweet thread from 2M follower influencer', key_signals: ['601% mention spike in 2 hours', 'Sentiment score 91 — organic, no bots', 'Early Whisper classification with 89% confidence'], risk_factors: ['Partnership details may disappoint on specifics', 'Broader crypto market downturn could override signal'], prediction_summary: 'FLOKI is showing the strongest social signal convergence in 72 hours. The combination of organic whale accumulation, partnership hype, and influencer attention in niche communities mirrors the pattern that preceded the April 2023 PEPE pump. High probability of significant upward movement within 48 hours.' },
    'pepe': { coin: 'PEPE', direction: 'bullish', confidence: 78, time_window: '24-48 hours', catalyst: 'Elon Musk engagement with PEPE-related content amplifying FOMO-driven buying', key_signals: ['Elon liked PEPE meme — historically correlated with pumps', '400% volume surge in 24 hours', 'New staking protocol launch creating utility narrative'], risk_factors: ['RSI overbought at 82 — short-term pullback likely before continuation', 'Elon engagement may not translate to sustained attention'], prediction_summary: 'PEPE is riding a wave of social momentum driven by Elon engagement and exchange listing rumors. While short-term overbought conditions suggest a possible dip, the overall trajectory remains strongly bullish with volume confirming the trend.' },
    'doge': { coin: 'DOGE', direction: 'bullish', confidence: 72, time_window: '24-48 hours', catalyst: 'X payments integration confirmation from credible insider sources', key_signals: ['Transaction volume at 6-month high', 'Payment integration narrative gaining mainstream traction', 'Foundation progress report reinforcing development activity'], risk_factors: ['X payment timeline remains unconfirmed officially', 'Potential sell-the-news event if announcement is anticlimactic'], prediction_summary: 'Dogecoin is positioned for upward movement driven by mounting X payment integration evidence. The fundamental adoption metrics support the narrative, but execution risk on the payment platform timeline remains the key variable.' },
    'shib': { coin: 'SHIB', direction: 'sideways', confidence: 58, time_window: '24-48 hours', catalyst: 'Shibarium activity increase offset by broader meme coin rotation', key_signals: ['Burn rate spike of 1000% temporarily bullish', 'Shibarium transactions growing steadily', 'BONE price action signaling ecosystem interest'], risk_factors: ['Attention rotating to newer meme coins', 'Burn rate spikes historically unsustained'], prediction_summary: 'SHIB is in a consolidation phase with mixed signals. Ecosystem development is positive but insufficient to overcome the current rotation of speculative attention toward fresher narratives. Expect range-bound trading.' },
    'bonk': { coin: 'BONK', direction: 'bullish', confidence: 82, time_window: '24-48 hours', catalyst: 'Solana memecoin season 2.0 with BONK as ecosystem leader after flipping MYRO', key_signals: ['BONKbot 24hr volume exceeding $100M', 'Market cap flip of MYRO establishing dominance', 'NFT collection sellout demonstrating community strength'], risk_factors: ['Solana network congestion could slow momentum', 'Memecoin rotation could shift to newer projects'], prediction_summary: 'BONK is the clear leader in the current Solana memecoin cycle with multiple converging signals. High trading infrastructure activity, market cap milestones, and strong community engagement suggest continued upward momentum in the near term.' },
  };
  return mocks[coin.toLowerCase()] || { coin, direction: 'bullish', confidence: 65, time_window: '24-48 hours', catalyst: 'Growing social media attention and community expansion', key_signals: ['Increasing social volume', 'Positive sentiment trend', 'Growing community size'], risk_factors: ['Broader market conditions', 'Low liquidity risk'], prediction_summary: `${coin} shows moderate bullish signals based on social metrics. Community growth and positive sentiment support a cautiously optimistic near-term outlook.` };
}

module.exports = router;
