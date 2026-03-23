const axios = require('axios');
const { withRetry } = require('./safety');

let dexscreenerCooldownUntil = 0;

function tripCooldown(ms = 30000) {
  dexscreenerCooldownUntil = Date.now() + ms;
}

function isCoolingDown() {
  return Date.now() < dexscreenerCooldownUntil;
}

async function searchPairs(query) {
  const q = String(query || '').trim();
  if (!q) {
    throw new Error('query is required');
  }

  if (isCoolingDown()) {
    return [];
  }

  try {
    const response = await withRetry(
      () => axios.get('https://api.dexscreener.com/latest/dex/search', {
        params: { q },
        timeout: 8000,
      }),
      { retries: 1, delayMs: 200, label: 'DEXScreener search' }
    );

    dexscreenerCooldownUntil = 0;
    return normalizePairs(response.data?.pairs || []);
  } catch (error) {
    console.error('[DEXScreener] Search failed:', error.message);
    tripCooldown();
    return [];
  }
}

async function getPair(chainId, pairId) {
  const chain = String(chainId || '').trim();
  const pair = String(pairId || '').trim();

  if (!chain || !pair) {
    throw new Error('chainId and pairId are required');
  }

  if (isCoolingDown()) {
    return null;
  }

  try {
    const response = await withRetry(
      () => axios.get(`https://api.dexscreener.com/latest/dex/pairs/${encodeURIComponent(chain)}/${encodeURIComponent(pair)}`, {
        timeout: 8000,
      }),
      { retries: 1, delayMs: 200, label: 'DEXScreener pair' }
    );

    dexscreenerCooldownUntil = 0;
    const pairData = response.data?.pairs?.[0] || null;
    return pairData ? normalizePair(pairData) : null;
  } catch (error) {
    console.error('[DEXScreener] Pair fetch failed:', error.message);
    tripCooldown();
    return null;
  }
}

function normalizePairs(pairs) {
  return pairs
    .filter(Boolean)
    .slice(0, 10)
    .map(normalizePair);
}

function normalizePair(pair) {
  return {
    chainId: pair.chainId,
    dexId: pair.dexId,
    pairAddress: pair.pairAddress,
    url: pair.url,
    labels: pair.labels || [],
    baseToken: pair.baseToken || {},
    quoteToken: pair.quoteToken || {},
    priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
    priceNative: pair.priceNative ? Number(pair.priceNative) : null,
    priceChange: pair.priceChange || {},
    liquidity: pair.liquidity || {},
    volume: pair.volume || {},
    fdv: pair.fdv ?? null,
    marketCap: pair.marketCap ?? null,
    boosts: pair.boosts || {},
    info: pair.info || {},
    pairCreatedAt: pair.pairCreatedAt || null,
  };
}

module.exports = {
  getPair,
  searchPairs,
};
