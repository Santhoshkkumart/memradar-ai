const axios = require('axios');
const { isDemoMode } = require('./runtime');

async function getTrendingCoins() {
  if (isDemoMode()) {
    return getMockTrendingCoins();
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    const coins = response.data.coins || [];
    return coins.slice(0, 10).map(c => ({
      id: c.item.id,
      name: c.item.name,
      symbol: c.item.symbol,
      thumb: c.item.thumb,
      market_cap_rank: c.item.market_cap_rank,
      price_btc: c.item.price_btc,
      score: c.item.score
    }));
  } catch (error) {
    console.error('[CoinGecko] Trending fetch failed:', error.message);
    return getMockTrendingCoins();
  }
}

async function getCoinPrice(coinId) {
  if (isDemoMode()) {
    return getMockPrice(coinId);
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: coinId, vs_currencies: 'usd', include_24hr_change: true }
    });
    const data = response.data[coinId];
    return {
      price_usd: data ? data.usd : null,
      change_24h: data ? data.usd_24h_change : null
    };
  } catch (error) {
    console.error('[CoinGecko] Price fetch failed for', coinId);
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
