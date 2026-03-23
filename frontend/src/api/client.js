import axios from 'axios';

const apiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || '';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
});

export async function fetchTrendingCoins() {
  const response = await api.get('/api/coins/trending');
  return response.data;
}

export async function fetchCoinPrice(coinId) {
  const response = await api.get(`/api/coins/price/${coinId}`);
  return response.data;
}

export async function fetchCryptoPanicNews(coin) {
  const response = await api.get(`/api/social/cryptopanic/${coin}`);
  return response.data;
}

export async function fetchYouTubePosts(coin) {
  const response = await api.get(`/api/youtube/${coin}`);
  return response.data;
}

export async function fetchLunarCrushData(coin) {
  const response = await api.get(`/api/social/lunarcrush/${coin}`);
  return response.data;
}

export async function fetchSocialPosts(source, coin) {
  if (source === 'youtube') {
    return fetchYouTubePosts(coin);
  }
  if (source === 'lunarcrush') {
    return fetchLunarCrushData(coin);
  }
  return fetchCryptoPanicNews(coin);
}

export async function analyzeSentiment(coin, posts) {
  const response = await api.post('/api/sentiment', { coin, posts });
  return response.data;
}

export async function classifyHypeStage(coin, sentiment, velocity) {
  const response = await api.post('/api/predict', {
    coin,
    sentiment_score: sentiment?.sentiment_score || 0,
    velocity: velocity?.velocity_ratio || 1,
    mode: 'hype_stage'
  });
  return response.data;
}

export async function getPrediction(coin, sentiment, velocity, stage) {
  const response = await api.post('/api/predict', {
    coin,
    sentiment_score: sentiment?.sentiment_score || 0,
    velocity: velocity?.velocity_ratio || 1,
    stage: stage?.hype_stage || 'building_momentum',
    posts: []
  });
  return response.data;
}

export async function generateAlert(coin, sentiment_score, hype_stage, velocity) {
  const response = await api.post('/api/alerts', {
    coin,
    sentiment_score,
    hype_stage,
    velocity
  });
  return response.data;
}

export async function fetchFearGreed() {
  try {
    const response = await api.get('/api/fear-greed');
    return response.data;
  } catch {
    return { value: '72', value_classification: 'Greed' };
  }
}

export async function searchDexScreenerPairs(query) {
  const response = await api.get('/api/dexscreener/search', {
    params: { q: query },
  });
  return response.data;
}

export async function fetchDexScreenerPair(chainId, pairId) {
  const response = await api.get(`/api/dexscreener/pair/${chainId}/${pairId}`);
  return response.data;
}

export default api;
