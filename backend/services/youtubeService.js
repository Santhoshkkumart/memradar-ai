const axios = require('axios');
const { withRetry } = require('./safety');
const { isDemoMode } = require('./runtime');

let youtubeCooldownUntil = 0;

const CRYPTO_SIGNAL_TERMS = [
  'crypto',
  'cryptocurrency',
  'coin',
  'token',
  'memecoin',
  'meme coin',
  'market',
  'trading',
  'chart',
  'price',
  'bullish',
  'bearish',
  'analysis',
  'pump',
  'dump',
];

function tripCooldown(ms = 60000) {
  youtubeCooldownUntil = Date.now() + ms;
}

function isCoolingDown() {
  return Date.now() < youtubeCooldownUntil;
}

async function searchYouTubeMentions(query) {
  const q = String(query || '').trim();
  if (!q) {
    throw new Error('query is required');
  }

  if (isDemoMode()) {
    return getMockPosts(q);
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return getMockPosts(q);
  }

  if (isCoolingDown()) {
    return getMockPosts(q);
  }

  try {
    const searchQuery = `${q} crypto meme coin token`.trim();
    const searchResponse = await withRetry(
      () => axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: apiKey,
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          order: 'date',
          maxResults: 15,
          safeSearch: 'none',
        },
        timeout: 8000,
      }),
      { retries: 1, delayMs: 300, label: 'YouTube search' }
    );

    const rawItems = searchResponse.data?.items || [];
    const items = rawItems.filter((item) => isRelevantVideo(item, q));
    const usableItems = items.length > 0 ? items : rawItems;
    const videoIds = usableItems.map((item) => item?.id?.videoId).filter(Boolean);

    let statsById = {};
    if (videoIds.length > 0) {
      const statsResponse = await withRetry(
        () => axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            key: apiKey,
            part: 'statistics',
            id: videoIds.join(','),
          },
          timeout: 8000,
        }),
        { retries: 1, delayMs: 300, label: 'YouTube video stats' }
      );

      statsById = (statsResponse.data?.items || []).reduce((acc, item) => {
        acc[item.id] = item.statistics || {};
        return acc;
      }, {});
    }

    youtubeCooldownUntil = 0;
    return usableItems.map((item) => {
      const videoId = item?.id?.videoId;
      const stats = statsById[videoId] || {};
      return {
        title: item.snippet?.title || q,
        score: parseInt(stats.viewCount || '0', 10),
        num_comments: parseInt(stats.commentCount || '0', 10),
        created_utc: Math.floor(new Date(item.snippet?.publishedAt || Date.now()).getTime() / 1000),
        subreddit: item.snippet?.channelTitle || 'YouTube',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        selftext: (item.snippet?.description || '').slice(0, 200),
      };
    });
  } catch (error) {
    console.error('[YouTube] Search failed:', error.message);
    tripCooldown();
    return getMockPosts(q);
  }
}

function isRelevantVideo(item, query) {
  const needle = String(query || '').toLowerCase();
  const haystack = [
    item?.snippet?.title || '',
    item?.snippet?.description || '',
    item?.snippet?.channelTitle || '',
  ].join(' ').toLowerCase();

  if (!haystack.includes(needle)) {
    return false;
  }

  return CRYPTO_SIGNAL_TERMS.some((term) => haystack.includes(term));
}

function computeMentionVelocity(posts) {
  const now = Date.now() / 1000;
  const sixHoursAgo = now - 21600;
  const twelveHoursAgo = now - 43200;

  let recentCount = 0;
  let previousCount = 0;

  posts.forEach((post) => {
    if (post.created_utc >= sixHoursAgo) {
      recentCount++;
    } else if (post.created_utc >= twelveHoursAgo) {
      previousCount++;
    }
  });

  const velocity_ratio = recentCount / Math.max(previousCount, 1);

  return {
    recent_count: recentCount,
    previous_count: previousCount,
    velocity_ratio: Math.round(velocity_ratio * 100) / 100
  };
}

function getMockPosts(query) {
  const now = Date.now() / 1000;
  const q = String(query || 'coin').toUpperCase();

  return [
    { title: `${q} analysis: community reacts to latest move`, score: 1200, num_comments: 180, created_utc: now - 1800, subreddit: 'YouTube', url: '#', selftext: `A short analysis covering the latest ${q} community chatter.` },
    { title: `${q} price prediction sparks debate`, score: 980, num_comments: 140, created_utc: now - 3600, subreddit: 'YouTube', url: '#', selftext: `Creators are debating whether ${q} can keep momentum going.` },
    { title: `Why traders are watching ${q} this week`, score: 760, num_comments: 90, created_utc: now - 5400, subreddit: 'YouTube', url: '#', selftext: `Market commentary focused on ${q} and the latest catalysts.` },
    { title: `${q} update: bullish or overhyped?`, score: 540, num_comments: 75, created_utc: now - 7200, subreddit: 'YouTube', url: '#', selftext: `A video discussion of ${q} sentiment and momentum.` },
    { title: `Live stream on ${q} reactions and sentiment`, score: 430, num_comments: 60, created_utc: now - 14400, subreddit: 'YouTube', url: '#', selftext: `Streamer analysis and chat reactions to ${q}.` },
  ];
}

module.exports = {
  computeMentionVelocity,
  searchYouTubeMentions,
};
