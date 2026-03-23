const axios = require('axios');

async function getNewsForCoin(coinSymbol) {
  try {
    const apiKey = process.env.CRYPTOPANIC_KEY;
    if (!apiKey || apiKey === 'your_cryptopanic_key_here') {
      return getMockNews(coinSymbol);
    }

    const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
      params: {
        auth_token: apiKey,
        currencies: coinSymbol.toUpperCase(),
        public: true,
        kind: 'news',
        filter: 'rising',
      },
      timeout: 8000,
    });

    const results = response.data?.results;
    if (!results || !Array.isArray(results) || results.length === 0) {
      return getMockNews(coinSymbol);
    }

    return results.map((post) => ({
      title: post.title,
      source: post.source?.title || 'Unknown',
      published_at: post.published_at,
      url: post.url,
      positive_votes: post.votes?.positive || 0,
      negative_votes: post.votes?.negative || 0,
      sentiment: (post.votes?.positive || 0) > (post.votes?.negative || 0) ? 'bullish' : 'bearish',
      score: (post.votes?.positive || 0) - (post.votes?.negative || 0),
      text: post.title,
    }));
  } catch (error) {
    console.error('[CryptoPanic] Fetch failed:', error.message);
    return getMockNews(coinSymbol);
  }
}

function computeNewsVelocity(posts) {
  const now = Date.now();
  const sixHoursMs = 6 * 60 * 60 * 1000;

  let recent_count = 0;
  let previous_count = 0;

  posts.forEach((post) => {
    const publishedAt = post.published_at ? new Date(post.published_at).getTime() : 0;
    const ageMs = now - publishedAt;

    if (ageMs <= sixHoursMs) {
      recent_count++;
    } else if (ageMs <= sixHoursMs * 2) {
      previous_count++;
    }
  });

  const velocity_ratio = recent_count / Math.max(previous_count, 1);

  return {
    recent_count,
    previous_count,
    velocity_ratio: Math.round(velocity_ratio * 100) / 100,
  };
}

function getMockNews(coinSymbol) {
  const coin = coinSymbol.toUpperCase();
  const now = new Date().toISOString();
  const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

  return [
    {
      title: `${coin} surges 15% as major exchange announces new listing`,
      source: 'CoinDesk',
      published_at: now,
      url: '#',
      positive_votes: 98,
      negative_votes: 12,
      sentiment: 'bullish',
      score: 142,
      text: `${coin} surges 15% as major exchange announces new listing`,
    },
    {
      title: `Why analysts are watching ${coin} closely this week`,
      source: 'Decrypt',
      published_at: hoursAgo(1),
      url: '#',
      positive_votes: 65,
      negative_votes: 8,
      sentiment: 'bullish',
      score: 89,
      text: `Why analysts are watching ${coin} closely this week`,
    },
    {
      title: `${coin} whale accumulation hits 30-day high — on-chain data`,
      source: 'CryptoSlate',
      published_at: hoursAgo(2),
      url: '#',
      positive_votes: 140,
      negative_votes: 18,
      sentiment: 'bullish',
      score: 201,
      text: `${coin} whale accumulation hits 30-day high — on-chain data`,
    },
    {
      title: `${coin} community votes on major governance proposal`,
      source: 'The Block',
      published_at: hoursAgo(4),
      url: '#',
      positive_votes: 45,
      negative_votes: 22,
      sentiment: 'bullish',
      score: 67,
      text: `${coin} community votes on major governance proposal`,
    },
    {
      title: `Market update: ${coin} holds key support level amid volatility`,
      source: 'BeInCrypto',
      published_at: hoursAgo(6),
      url: '#',
      positive_votes: 30,
      negative_votes: 14,
      sentiment: 'bullish',
      score: 44,
      text: `Market update: ${coin} holds key support level amid volatility`,
    },
  ];
}

module.exports = { getNewsForCoin, computeNewsVelocity };
