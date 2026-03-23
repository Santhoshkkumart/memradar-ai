const axios = require('axios');
const { isDemoMode } = require('./runtime');

const SERPAPI_BASE = 'https://serpapi.com/search.json';
const SEARCH_TIMEOUT_MS = 8000;
let searchWarningUntil = 0;

function normalizeCoinName(value) {
  return String(value || '').trim();
}

function normalizeCoinSymbol(value) {
  return String(value || '').trim().toUpperCase();
}

function warnOnce(message) {
  if (Date.now() < searchWarningUntil) return;
  searchWarningUntil = Date.now() + 5 * 60 * 1000;
  console.warn(message);
}

function getApiKey() {
  return String(process.env.SERPAPI_KEY || '').trim();
}

function getSearchQuery(coinName) {
  const symbol = normalizeCoinSymbol(coinName);
  const name = normalizeCoinName(coinName);
  return `${symbol || name} crypto meme coin news`.trim();
}

function parseOrganicResults(payload) {
  const organic = payload?.organic_results;
  if (Array.isArray(organic)) return organic;

  const news = payload?.news_results;
  if (Array.isArray(news)) return news;

  return [];
}

function buildResult(item, index) {
  return {
    position: index + 1,
    title: item?.title || item?.headline || 'Unknown result',
    link: item?.link || item?.source || '#',
    snippet: item?.snippet || item?.summary || item?.description || '',
    source: item?.source || item?.publication || item?.displayed_link || item?.domain || 'Google',
    date: item?.date || item?.published || null,
  };
}

function getMockSearchResults(coinName) {
  const coin = normalizeCoinSymbol(coinName);

  const mockByCoin = {
    PEPE: [
      {
        title: 'PEPE price prediction gains traction after volume spike',
        link: '#',
        snippet: 'Analysts are watching PEPE social momentum, exchange chatter, and rising search interest.',
        source: 'Google',
      },
      {
        title: 'PEPE community activity jumps across social platforms',
        link: '#',
        snippet: 'News coverage highlights exchange listings and meme-driven accumulation.',
        source: 'Google',
      },
      {
        title: 'Is PEPE entering another breakout cycle?',
        link: '#',
        snippet: 'Search demand and trading interest are both trending upward.',
        source: 'Google',
      },
    ],
    FLOKI: [
      {
        title: 'FLOKI search trend surges after ecosystem updates',
        link: '#',
        snippet: 'Google results cluster around exchange listings and community expansion.',
        source: 'Google',
      },
      {
        title: 'FLOKI momentum keeps building in meme coin rotation',
        link: '#',
        snippet: 'Traders are looking for confirmation of the latest catalyst.',
        source: 'Google',
      },
      {
        title: 'What is driving FLOKI attention right now?',
        link: '#',
        snippet: 'Coverage points to rising social and search interest across markets.',
        source: 'Google',
      },
    ],
    DOGE: [
      {
        title: 'Dogecoin price outlook stays active on Google search',
        link: '#',
        snippet: 'Search interest continues to track headline-driven attention.',
        source: 'Google',
      },
      {
        title: 'DOGE community still reacts to payment and adoption rumors',
        link: '#',
        snippet: 'Search results remain anchored to price and utility speculation.',
        source: 'Google',
      },
      {
        title: 'Is Dogecoin still a top meme coin narrative?',
        link: '#',
        snippet: 'The search landscape remains broad and highly liquid.',
        source: 'Google',
      },
    ],
    SHIB: [
      {
        title: 'Shiba Inu search activity focuses on ecosystem growth',
        link: '#',
        snippet: 'Users are searching for burns, Shibarium updates, and price action.',
        source: 'Google',
      },
      {
        title: 'SHIB holders watch for the next catalyst',
        link: '#',
        snippet: 'Google results show mixed sentiment but steady attention.',
        source: 'Google',
      },
      {
        title: 'Shiba Inu news and price predictions trending together',
        link: '#',
        snippet: 'Search demand reflects a consolidation phase rather than a breakout.',
        source: 'Google',
      },
    ],
    BONK: [
      {
        title: 'BONK price and Solana ecosystem searches spike together',
        link: '#',
        snippet: 'Search traffic points to renewed meme rotation and listing chatter.',
        source: 'Google',
      },
      {
        title: 'BONK becomes a top searched Solana meme coin',
        link: '#',
        snippet: 'The query landscape is dominated by price, buy, and listing terms.',
        source: 'Google',
      },
      {
        title: 'What is BONK and why is everyone searching for it?',
        link: '#',
        snippet: 'Attention is still growing across news and community channels.',
        source: 'Google',
      },
    ],
  };

  return {
    query: getSearchQuery(coinName),
    top_results: mockByCoin[coin] || [
      {
        title: `${coin || 'Coin'} search interest is building`,
        link: '#',
        snippet: 'Search activity is available in demo mode.',
        source: 'Google',
      },
    ],
    search_information: {
      total_results: 0,
      related_questions: [],
    },
    source: 'mock',
    cached_at: Date.now(),
  };
}

async function getGoogleSearchResults(coinName) {
  const apiKey = getApiKey();
  const query = getSearchQuery(coinName);

  if (isDemoMode() || !apiKey || apiKey === 'your_serpapi_key_here') {
    return getMockSearchResults(coinName);
  }

  try {
    const response = await axios.get(SERPAPI_BASE, {
      params: {
        engine: 'google',
        q: query,
        api_key: apiKey,
        num: 5,
        hl: 'en',
        gl: 'us',
        safe: 'active',
      },
      timeout: SEARCH_TIMEOUT_MS,
    });

    const organicResults = parseOrganicResults(response.data);
    if (organicResults.length === 0) {
      warnOnce('[GoogleSearch] No results returned, using mock results');
      return getMockSearchResults(coinName);
    }

    return {
      query,
      top_results: organicResults.slice(0, 5).map(buildResult),
      search_information: {
        total_results: Number(response.data?.search_information?.total_results ?? 0),
        organic_results_state: response.data?.search_information?.organic_results_state || null,
      },
      source: 'serpapi',
      cached_at: Date.now(),
    };
  } catch (error) {
    const status = error?.response?.status;
    warnOnce(`[GoogleSearch] Fetch failed${status ? ` (${status})` : ''}, using mock results: ${error.message}`);
    return getMockSearchResults(coinName);
  }
}

module.exports = { getGoogleSearchResults };
