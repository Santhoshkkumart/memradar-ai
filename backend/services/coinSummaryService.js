const { getNewsForCoin, computeNewsVelocity } = require('./cryptoPanicService');
const { getSocialData } = require('./lunarCrushService');
const { getTrendsForCoin } = require('./googleTrendsService');
const { getGoogleSearchResults } = require('./googleSearchService');

function getRiskLevel(sentimentScore, velocityRatio, breakout) {
  if (breakout || sentimentScore >= 75 || velocityRatio >= 3) return 'high';
  if (sentimentScore >= 55 || velocityRatio >= 1.5) return 'medium';
  return 'low';
}

function getRiskTone(level) {
  if (level === 'high') return { label: 'High risk', color: 'text-red', border: 'border-red/30', bg: 'bg-red/10' };
  if (level === 'medium') return { label: 'Medium risk', color: 'text-orange', border: 'border-orange/30', bg: 'bg-orange/10' };
  return { label: 'Lower risk', color: 'text-green', border: 'border-green/30', bg: 'bg-green/10' };
}

function getFunFact(coin) {
  const facts = {
    FLOKI: 'FLOKI was named after Elon Musk’s Shiba Inu.',
    PEPE: 'PEPE began as a meme before becoming a major social trading narrative.',
    DOGE: 'DOGE is one of the oldest meme coin communities still active today.',
    SHIB: 'SHIB grew into a full ecosystem with burns, L2, and ecosystem tokens.',
    BONK: 'BONK became a flagship Solana meme coin during a major ecosystem rotation.',
  };
  return facts[String(coin || '').toUpperCase()] || '';
}

function buildSummary(coin, social, trends, velocity, news, search) {
  const symbol = String(coin || '').toUpperCase();
  const sentimentScore = Number(social?.sentiment_score ?? 50);
  const velocityRatio = Number(velocity?.velocity_ratio ?? 1);
  const breakout = Boolean(trends?.breakout);
  const riskLevel = getRiskLevel(sentimentScore, velocityRatio, breakout);
  const tone = getRiskTone(riskLevel);
  const topCountry = trends?.top_countries?.[0]?.country || 'global markets';
  const topQuery = trends?.related_queries?.[0] || `${symbol.toLowerCase()} price`;
  const topSearch = search?.top_results?.[0];
  const searchHeadline = topSearch?.title || `${symbol} search interest`;
  const articleCount = Array.isArray(news) ? news.length : 0;

  const explanation = breakout
    ? `${symbol} is in breakout territory with search intensity building across ${topCountry} and coverage centered on "${searchHeadline}".`
    : `${symbol} is showing active social traction with the strongest interest clustering around ${topCountry}, while search coverage is led by "${searchHeadline}".`;

  const love = [
    `Sentiment score sits near ${sentimentScore}, which keeps the tone constructive.`,
    `News velocity is ${velocityRatio.toFixed(1)}x, suggesting attention is still building.`,
    `Top search query: "${topQuery}".`,
  ];

  if (topSearch?.snippet) {
    love.push(`Leading Google result: "${topSearch.title}".`);
  }

  const hate = [
    'Memecoins can reverse quickly when hype cools.',
    breakout ? 'Search breakouts often attract late momentum buyers.' : 'Search interest is still uneven outside the leading countries.',
    articleCount > 0 ? `${articleCount} recent headlines still need confirmation from price action.` : 'There is limited news confirmation from the current feed.',
  ];

  const historicalContext = breakout
    ? `The current shape resembles prior meme-coin expansion windows where social search and news mention acceleration lined up before the widest price move.`
    : `The current shape looks like a steady awareness phase rather than a full mania cycle.`;

  const communityVibe = breakout
    ? 'Community mood feels sharp, opportunistic, and highly alert.'
    : 'Community mood feels constructive but still measured.';

  return {
    coin: symbol,
    title: `${symbol} quick read`,
    explanation,
    love,
    hate,
    historical_context: historicalContext,
    community_vibe: communityVibe,
    risk_level: riskLevel,
    risk_tone: tone,
    fun_fact: getFunFact(symbol),
    search_query: search?.query || `${symbol.toLowerCase()} coin`,
    search_results: Array.isArray(search?.top_results) ? search.top_results : [],
    disclaimer: 'This summary is generated from live market, social, and search signals. It is informational only, not financial advice.',
    cached_at: Date.now(),
  };
}

async function getCoinSummary(coin) {
  try {
    const [news, social, trends, search] = await Promise.all([
      getNewsForCoin(coin),
      getSocialData(coin),
      getTrendsForCoin(coin),
      getGoogleSearchResults(coin),
    ]);
    const velocity = computeNewsVelocity(news);
    return buildSummary(coin, social, trends, velocity, news, search);
  } catch (error) {
    const fallbackNews = [];
    const fallbackVelocity = { velocity_ratio: 1 };
    return buildSummary(coin, {}, {}, fallbackVelocity, fallbackNews, {});
  }
}

module.exports = { getCoinSummary, getRiskTone };
