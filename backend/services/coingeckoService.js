const axios = require('axios');
const { isDemoMode } = require('./runtime');
const { withRetry } = require('./safety');
const { searchPairs } = require('./dexscreenerService');

const COINGECKO_BASE_URLS = [
  'https://api.coingecko.com/api/v3',
  'https://www.coingecko.com/api/v3',
];

let coingeckoCooldownUntil = 0;
let coingeckoWarningUntil = 0;
let lastTrendingCoins = null;
let lastTrendingCoinsAt = 0;
const lastPriceByCoin = new Map();

function tripCooldown(ms = 60000) {
  coingeckoCooldownUntil = Date.now() + ms;
}

function warnOnce(message) {
  if (Date.now() < coingeckoWarningUntil) return;
  coingeckoWarningUntil = Date.now() + 5 * 60 * 1000;
  console.warn(message);
}

function isNetworkLookupError(error) {
  return ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ENETUNREACH', 'ECONNRESET'].includes(error?.code);
}

async function requestCoinGecko(path, params = {}, label = 'CoinGecko request') {
  let lastError = null;

  for (const baseURL of COINGECKO_BASE_URLS) {
    try {
      return await withRetry(
        () => axios.get(`${baseURL}${path}`, { params, timeout: 8000 }),
        { retries: 1, delayMs: 300, label }
      );
    } catch (error) {
      lastError = error;
      if (!isNetworkLookupError(error)) {
        break;
      }
    }
  }

  throw lastError || new Error(`${label} failed`);
}

function getCoinAlias(coinId) {
  const id = String(coinId || '').trim().toLowerCase();
  const aliases = {
    pepe: ['pepe'],
    dogecoin: ['dogecoin', 'doge'],
    'floki-inu': ['floki-inu', 'floki'],
    'shiba-inu': ['shiba-inu', 'shib'],
    bonk: ['bonk'],
    wojak: ['wojak'],
    brett: ['brett'],
    bitcoin: ['bitcoin', 'btc'],
  };
  return aliases[id] || [id];
}

const TRENDING_FALLBACK_SEEDS = [
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'floki-inu', name: 'FLOKI', symbol: 'FLOKI' },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK' },
  { id: 'wojak', name: 'Wojak', symbol: 'WOJAK' },
  { id: 'brett', name: 'Brett', symbol: 'BRETT' },
];

async function getDexScreenerTrendingFallback() {
  try {
    const picks = [];

    for (const seed of TRENDING_FALLBACK_SEEDS) {
      const results = await searchPairs(seed.symbol || seed.name || seed.id);
      if (!Array.isArray(results) || results.length === 0) continue;

      const best = results.find((pair) => {
        const baseSymbol = String(pair?.baseToken?.symbol || '').trim().toLowerCase();
        const baseName = String(pair?.baseToken?.name || '').trim().toLowerCase();
        return [baseSymbol, baseName].includes(String(seed.symbol || seed.name || seed.id).trim().toLowerCase());
      }) || results[0];

      if (!best) continue;

      picks.push({
        id: seed.id,
        name: seed.name,
        symbol: seed.symbol,
        thumb: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/128/color/${String(seed.symbol || seed.id).toLowerCase()}.png`,
        market_cap_rank: null,
        price_btc: null,
        score: Number(best.priceChange?.h24 ?? 0),
        price_usd: best.priceUsd != null ? Number(best.priceUsd) : null,
        change_24h: best.priceChange?.h24 != null ? Number(best.priceChange.h24) : null,
        volume_24h: best.volume?.h24 != null ? Number(best.volume.h24) : null,
        source: 'dexscreener',
      });
    }

    return picks
      .sort((a, b) => {
        const aScore = Math.abs(a.change_24h ?? a.score ?? 0) + Math.log10((a.volume_24h || 0) + 1);
        const bScore = Math.abs(b.change_24h ?? b.score ?? 0) + Math.log10((b.volume_24h || 0) + 1);
        return bScore - aScore;
      })
      .slice(0, 8)
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        thumb: item.thumb,
        market_cap_rank: item.market_cap_rank,
        price_btc: item.price_btc,
        score: index,
        price_usd: item.price_usd,
        change_24h: item.change_24h,
      }));
  } catch (error) {
    warnOnce(`[CoinGecko] DEXScreener trending fallback failed: ${error.message}`);
    return null;
  }
}

async function getDexScreenerPriceFallback(coinId) {
  try {
    const aliases = getCoinAlias(coinId);
    for (const alias of aliases) {
      const results = await searchPairs(alias);
      if (!Array.isArray(results) || results.length === 0) continue;

      const exact = results.find((pair) => {
        const baseSymbol = String(pair?.baseToken?.symbol || '').trim().toLowerCase();
        const baseName = String(pair?.baseToken?.name || '').trim().toLowerCase();
        const pairSymbol = String(pair?.baseToken?.symbol || '').trim().toLowerCase();
        return [baseSymbol, baseName, pairSymbol].some((value) => value === alias);
      }) || results[0];

      if (exact?.priceUsd != null) {
        return {
          price_usd: Number(exact.priceUsd),
          change_24h: Number(exact.priceChange?.h24 ?? exact.priceChange?.h24 ?? null),
        };
      }
    }
  } catch (error) {
    warnOnce(`[CoinGecko] DEXScreener fallback failed for ${coinId}: ${error.message}`);
  }

  return null;
}

async function getTrendingCoins() {
  if (isDemoMode()) {
    return getMockTrendingCoins();
  }

  if (Date.now() < coingeckoCooldownUntil) {
    if (lastTrendingCoins && Date.now() - lastTrendingCoinsAt < 10 * 60 * 1000) {
      return lastTrendingCoins;
    }
    return getMockTrendingCoins();
  }

  try {
    const response = await requestCoinGecko('/search/trending', {}, 'CoinGecko trending');
    const coins = response.data.coins || [];
    coingeckoCooldownUntil = 0;
    const trending = coins.slice(0, 10).map(c => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      thumb: c.item.thumb,
      market_cap_rank: c.item.market_cap_rank,
      price_btc: c.item.price_btc,
      score: c.item.score
    }));
    lastTrendingCoins = trending;
    lastTrendingCoinsAt = Date.now();
    return trending;
  } catch (error) {
    tripCooldown();
    const fallback = await getDexScreenerTrendingFallback();
    if (fallback && fallback.length > 0) {
      lastTrendingCoins = fallback;
      lastTrendingCoinsAt = Date.now();
      return fallback;
    }

    warnOnce(`[CoinGecko] Trending fetch failed, using mock data: ${error.message}`);
    if (lastTrendingCoins && Date.now() - lastTrendingCoinsAt < 10 * 60 * 1000) {
      return lastTrendingCoins;
    }
    return getMockTrendingCoins();
  }
}

async function getCoinPrice(coinId) {
  if (isDemoMode()) {
    return getMockPrice(coinId);
  }

  if (Date.now() < coingeckoCooldownUntil) {
    const cached = lastPriceByCoin.get(String(coinId || '').trim().toLowerCase());
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
      return cached.value;
    }
    return getMockPrice(coinId);
  }

  try {
    const response = await requestCoinGecko('/simple/price', {
      ids: coinId,
      vs_currencies: 'usd',
      include_24hr_change: true,
    }, 'CoinGecko price');
    const data = response.data[coinId];
    coingeckoCooldownUntil = 0;
    const value = {
      price_usd: data ? data.usd : null,
      change_24h: data ? data.usd_24h_change : null
    };
    lastPriceByCoin.set(String(coinId || '').trim().toLowerCase(), { value, at: Date.now() });
    return value;
  } catch (error) {
    const fallback = await getDexScreenerPriceFallback(coinId);
    if (fallback) {
      lastPriceByCoin.set(String(coinId || '').trim().toLowerCase(), { value: fallback, at: Date.now() });
      return fallback;
    }

    tripCooldown();
    warnOnce(`[CoinGecko] Price fetch failed for ${coinId}, using mock data: ${error.message}`);
    const cached = lastPriceByCoin.get(String(coinId || '').trim().toLowerCase());
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
      return cached.value;
    }
    return getMockPrice(coinId);
  }
}

function getMockTrendingCoins() {
  return [
    { id: 'pepe', name: 'Pepe', symbol: 'PEPE', thumb: 'https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg', market_cap_rank: 46, price_btc: 0.00000000018, score: 0 },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', thumb: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png', market_cap_rank: 8, price_btc: 0.0000024, score: 1 },
    { id: 'floki-inu', name: 'FLOKI', symbol: 'FLOKI', thumb: 'https://assets.coingecko.com/coins/images/16746/thumb/PNG_image.png', market_cap_rank: 55, price_btc: 0.0000000035, score: 2 },
    { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', thumb: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png', market_cap_rank: 15, price_btc: 0.00000000032, score: 3 },
    { id: 'bonk', name: 'Bonk', symbol: 'BONK', thumb: 'https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg', market_cap_rank: 62, price_btc: 0.00000000004, score: 4 },
    { id: 'wojak', name: 'Wojak', symbol: 'WOJAK', thumb: 'https://assets.coingecko.com/coins/images/29855/thumb/wojak.png', market_cap_rank: 800, price_btc: 0.0000000001, score: 5 },
    { id: 'brett', name: 'Brett', symbol: 'BRETT', thumb: 'https://assets.coingecko.com/coins/images/35529/thumb/brett.png', market_cap_rank: 120, price_btc: 0.0000000025, score: 6 },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png', market_cap_rank: 1, price_btc: 1, score: 7 },
  ];
}

function getMockPrice(coinId) {
  const prices = {
    'pepe': { price_usd: 0.0000089, change_24h: 12.5 },
    'dogecoin': { price_usd: 0.152, change_24h: 5.3 },
    'floki-inu': { price_usd: 0.000187, change_24h: 28.7 },
    'shiba-inu': { price_usd: 0.0000198, change_24h: -2.1 },
    'bonk': { price_usd: 0.0000234, change_24h: 15.8 },
    'wojak': { price_usd: 0.000045, change_24h: -8.2 },
    'brett': { price_usd: 0.128, change_24h: 22.4 },
    'bitcoin': { price_usd: 67500.0, change_24h: 1.2 },
  };
  return prices[coinId] || { price_usd: 0.001, change_24h: 3.5 };
}

module.exports = { getTrendingCoins, getCoinPrice };
