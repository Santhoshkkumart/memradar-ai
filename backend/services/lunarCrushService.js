const axios = require('axios');

const LUNARCRUSH_BASE = 'https://lunarcrush.com/api4/public';

function getApiKey() {
  return String(process.env.LUNARCRUSH_KEY || '').trim();
}

function createHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
  };
}

function normalizeCoinKey(value) {
  return String(value || '').trim().toLowerCase();
}

function parseListPayload(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload)) return payload;
  return [];
}

async function fetchLunarCrush(path, params = {}) {
  const apiKey = getApiKey();
  const response = await axios.get(`${LUNARCRUSH_BASE}${path}`, {
    headers: createHeaders(apiKey),
    params,
    timeout: 8000,
  });
  return response.data;
}

async function resolveCoinId(coinSymbol) {
  const key = normalizeCoinKey(coinSymbol);
  if (!key) return null;

  try {
    const payload = await fetchLunarCrush('/coins/list/v1', {
      sort: 'galaxy_score',
      limit: 250,
    });

    const coins = parseListPayload(payload);
    if (coins.length === 0) return null;

    const exact = coins.find((coin) => {
      const symbol = normalizeCoinKey(coin.symbol);
      const name = normalizeCoinKey(coin.name);
      const id = normalizeCoinKey(coin.id);
      return key === symbol || key === name || key === id;
    });

    if (exact?.id) return exact.id;

    const partial = coins.find((coin) => {
      const symbol = normalizeCoinKey(coin.symbol);
      const name = normalizeCoinKey(coin.name);
      const id = normalizeCoinKey(coin.id);
      return symbol.includes(key) || name.includes(key) || id.includes(key);
    });

    return partial?.id || null;
  } catch (error) {
    console.error('[LunarCrush] Coin list fetch failed:', error.message);
    return null;
  }
}

async function getSocialData(coinSymbol) {
  try {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'your_lunarcrush_key_here') {
      return getMockSocialData(coinSymbol);
    }

    const coinId = (await resolveCoinId(coinSymbol)) || normalizeCoinKey(coinSymbol);
    const payload = await fetchLunarCrush(`/coins/${coinId}/v1`);
    const data = payload?.data || payload;

    if (!data) {
      return getMockSocialData(coinSymbol);
    }

    return {
      galaxy_score: data.galaxy_score ?? data.galaxyScore ?? null,
      alt_rank: data.alt_rank ?? data.altRank ?? null,
      social_volume_24h: data.social_volume_24h ?? data.socialVolume24h ?? null,
      social_engagement_24h: data.social_engagement_24h ?? data.socialEngagement24h ?? null,
      sentiment_score: data.sentiment_score ?? data.sentiment ?? null,
      social_dominance: data.social_dominance ?? data.socialDominance ?? null,
      influencers_active: data.influencers_active ?? data.influencersActive ?? null,
      price_change_24h: data.percent_change_24h ?? data.price_change_24h ?? null,
    };
  } catch (error) {
    const status = error?.response?.status;
    console.error(`[LunarCrush] Fetch failed${status ? ` (${status})` : ''}:`, error.message);
    return getMockSocialData(coinSymbol);
  }
}

async function getTopCoinsBySocial() {
  try {
    const apiKey = getApiKey();
    if (!apiKey || apiKey === 'your_lunarcrush_key_here') {
      return null;
    }

    const payload = await fetchLunarCrush('/coins/list/v1', {
      sort: 'galaxy_score',
      limit: 10,
    });

    const coins = parseListPayload(payload);
    if (!coins || !Array.isArray(coins)) return null;

    return coins.map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      galaxy_score: c.galaxy_score ?? c.galaxyScore ?? null,
      alt_rank: c.alt_rank ?? c.altRank ?? null,
      social_volume: c.social_volume_24h ?? c.socialVolume24h ?? null,
      sentiment: c.sentiment ?? c.sentiment_score ?? null,
      price: c.price ?? c.price_usd ?? null,
      change_24h: c.percent_change_24h ?? c.price_change_24h ?? null,
    }));
  } catch (error) {
    console.error('[LunarCrush] Top coins fetch failed:', error.message);
    return null;
  }
}

function getMockSocialData(coinSymbol) {
  const coin = coinSymbol.toUpperCase();

  const mockData = {
    PEPE: {
      galaxy_score: 78,
      alt_rank: 3,
      social_volume_24h: 48291,
      sentiment_score: 82,
      social_engagement_24h: 892034,
      influencers_active: 47,
      social_dominance: 4.2,
      price_change_24h: 12.4,
    },
    DOGE: {
      galaxy_score: 65,
      alt_rank: 8,
      social_volume_24h: 31204,
      sentiment_score: 55,
      social_engagement_24h: 421847,
      influencers_active: 28,
      social_dominance: 2.8,
      price_change_24h: 3.2,
    },
    FLOKI: {
      galaxy_score: 91,
      alt_rank: 1,
      social_volume_24h: 82019,
      sentiment_score: 91,
      social_engagement_24h: 1847293,
      influencers_active: 73,
      social_dominance: 7.1,
      price_change_24h: 24.8,
    },
    SHIB: {
      galaxy_score: 42,
      alt_rank: 22,
      social_volume_24h: 18472,
      sentiment_score: 31,
      social_engagement_24h: 198472,
      influencers_active: 12,
      social_dominance: 1.4,
      price_change_24h: -2.1,
    },
    BONK: {
      galaxy_score: 61,
      alt_rank: 11,
      social_volume_24h: 24819,
      sentiment_score: 62,
      social_engagement_24h: 384729,
      influencers_active: 19,
      social_dominance: 2.1,
      price_change_24h: 8.7,
    },
  };

  return mockData[coin] || {
    galaxy_score: 50,
    alt_rank: 50,
    social_volume_24h: 10000,
    sentiment_score: 50,
    social_engagement_24h: 50000,
    influencers_active: 10,
    social_dominance: 0.5,
    price_change_24h: 0,
  };
}

module.exports = { getSocialData, getTopCoinsBySocial };
