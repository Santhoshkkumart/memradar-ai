const axios = require('axios');

const CRYPTOPANIC_BASE = 'https://cryptopanic.com/api/v1/posts/';
const CRYPTOPANIC_TIMEOUT_MS = 8000;
let cryptoPanicWarningUntil = 0;

function normalizeCoinSymbol(coinSymbol) {
  return String(coinSymbol || '').trim().toUpperCase();
}

function warnOnce(message) {
  if (Date.now() < cryptoPanicWarningUntil) return;
  cryptoPanicWarningUntil = Date.now() + 5 * 60 * 1000;
  console.warn(message);
}

function parseResults(payload) {
  const results = payload?.results;
  if (Array.isArray(results)) return results;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function fetchCryptoPanic(params) {
  const response = await axios.get(CRYPTOPANIC_BASE, {
    params,
    timeout: CRYPTOPANIC_TIMEOUT_MS,
  });
  return response.data;
}

async function getNewsForCoin(coinSymbol) {
  try {
    const apiKey = process.env.CRYPTOPANIC_KEY;
    if (!apiKey || apiKey === 'your_cryptopanic_key_here') {
      return getMockNews(coinSymbol);
    }

    const coin = normalizeCoinSymbol(coinSymbol);
    const requestVariants = [
      {
        auth_token: apiKey,
        currencies: coin,
        public: true,
        kind: 'news',
        filter: 'rising',
      },
      {
        auth_token: apiKey,
        currencies: coin,
        kind: 'news',
        filter: 'rising',
      },
      {
        auth_token: apiKey,
        kind: 'news',
        filter: 'rising',
      },
    ];

    let lastError = null;
    for (const params of requestVariants) {
      try {
        const payload = await fetchCryptoPanic(params);
        const results = parseResults(payload);

        if (results.length === 0) {
          continue;
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
        lastError = error;
        const status = error?.response?.status;
        if (status && ![404, 429].includes(status)) {
          break;
        }
      }
    }

    if (lastError) {
      const status = lastError?.response?.status;
      if (![404, 429].includes(status)) {
        warnOnce(`[CryptoPanic] Fetch failed${status ? ` (${status})` : ''}, using mock news: ${lastError.message}`);
      }
      return getMockNews(coinSymbol);
    }

    return getMockNews(coinSymbol);
  } catch (error) {
    const status = error?.response?.status;
    if (![404, 429].includes(status)) {
      warnOnce(`[CryptoPanic] Fetch failed${status ? ` (${status})` : ''}, using mock news: ${error.message}`);
    }
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
