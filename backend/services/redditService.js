const axios = require('axios');
const { isDemoMode } = require('./runtime');

let accessToken = null;
let tokenExpiry = 0;

async function getRedditToken() {
  try {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_SECRET;
    const userAgent = process.env.REDDIT_USER_AGENT || 'MemeRadarBot/1.0';

    if (!clientId || !clientSecret || clientId === 'your_reddit_client_id') {
      return null;
    }

    if (accessToken && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        auth: { username: clientId, password: clientSecret },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': userAgent
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
    return accessToken;
  } catch (error) {
    console.error('[Reddit] Auth failed:', error.message);
    return null;
  }
}

async function searchCoinMentions(coinName) {
  if (isDemoMode()) {
    return getMockPosts(coinName);
  }

  const token = await getRedditToken();

  if (!token) {
    return getMockPosts(coinName);
  }

  try {
    const response = await axios.get('https://oauth.reddit.com/search', {
      params: {
        q: coinName,
        sort: 'new',
        limit: 25,
        t: 'day'
      },
      headers: {
        'Authorization': `bearer ${token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'MemeRadarBot/1.0'
      },
      timeout: 8000
    });

    const posts = response.data.data.children.map(child => ({
      title: child.data.title,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      subreddit: child.data.subreddit,
      url: child.data.url,
      selftext: (child.data.selftext || '').slice(0, 200)
    }));

    return posts;
  } catch (error) {
    console.error('[Reddit] Search failed:', error.message);
    if (error.response && error.response.status === 401) {
      accessToken = null;
      tokenExpiry = 0;
    }
    return getMockPosts(coinName);
  }
}

function computeMentionVelocity(posts) {
  const now = Date.now() / 1000;
  const sixHoursAgo = now - 21600;
  const twelveHoursAgo = now - 43200;

  let recentCount = 0;
  let previousCount = 0;

  posts.forEach(post => {
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

function getMockPosts(coinName) {
  const coin = coinName.toLowerCase();
  const now = Date.now() / 1000;

  const mockSets = {
    'floki': [
      { title: '🚀 FLOKI partnership with major DeFi protocol just dropped! This is HUGE', score: 892, num_comments: 156, created_utc: now - 1800, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Just announced a massive partnership that could change everything for FLOKI. The team has been building silently...' },
      { title: 'FLOKI whale wallet just accumulated 2.3B tokens in 4 hours', score: 567, num_comments: 89, created_utc: now - 3600, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'On-chain data shows a massive accumulation pattern. Smart money is moving in before something big.' },
      { title: 'Technical analysis: FLOKI breaking out of 3-month descending wedge', score: 345, num_comments: 67, created_utc: now - 5400, subreddit: 'CryptoCurrency', url: '#', selftext: 'The chart pattern is textbook bullish. Volume is confirming the breakout with 3x average.' },
      { title: 'Why FLOKI could be the next 100x — DD inside', score: 234, num_comments: 45, created_utc: now - 7200, subreddit: 'memecoins', url: '#', selftext: 'After deep research into the tokenomics and upcoming catalysts, here is why I think FLOKI is severely undervalued...' },
      { title: 'FLOKI mentioned by top crypto influencer with 2M followers', score: 178, num_comments: 34, created_utc: now - 14400, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Major influencer just tweeted about FLOKI. Last time they mentioned a coin it did 5x in a week.' },
      { title: 'Just aped into FLOKI — am I too late?', score: 89, num_comments: 23, created_utc: now - 18000, subreddit: 'dogecoin', url: '#', selftext: 'Saw the community growing fast and decided to get in. The vibe in the TG is insane right now.' },
    ],
    'pepe': [
      { title: 'PEPE showing signs of another massive run — volume up 400%', score: 1245, num_comments: 234, created_utc: now - 2400, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Trading volume has exploded in the last 24 hours. Multiple CEX listings rumored to be incoming.' },
      { title: 'Elon just liked a PEPE meme tweet 👀', score: 2100, num_comments: 456, created_utc: now - 4800, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'THE TWEET IS REAL. Check Elons liked tweets. Last time he did this with DOGE it went parabolic.' },
      { title: 'PEPE ecosystem expanding — new staking protocol launches tomorrow', score: 567, num_comments: 89, created_utc: now - 7200, subreddit: 'CryptoCurrency', url: '#', selftext: 'The team is building actual utility. Staking rewards of 15% APY on launch day.' },
      { title: 'Weekly PEPE discussion — are we at ATH this month?', score: 234, num_comments: 156, created_utc: now - 10800, subreddit: 'memecoins', url: '#', selftext: 'The community consensus seems bullish. Market cap still has room compared to DOGE and SHIB.' },
      { title: 'Warning: PEPE might be overbought short-term', score: 45, num_comments: 67, created_utc: now - 16200, subreddit: 'CryptoCurrency', url: '#', selftext: 'RSI is at 82 on the 4H chart. While long-term bullish, expect a healthy pullback before continuation.' },
      { title: 'Just sold 50% of my PEPE bag — taking profits is not a sin', score: 123, num_comments: 45, created_utc: now - 21600, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'Been holding since the early days. Taking some profits but keeping a core position for the long term.' },
    ],
    'doge': [
      { title: 'DOGE integration with X payments confirmed by insider source', score: 3456, num_comments: 567, created_utc: now - 3600, subreddit: 'dogecoin', url: '#', selftext: 'Multiple credible sources confirming X payment integration is in final testing. This could be massive.' },
      { title: 'Dogecoin transaction volume hits 6-month high', score: 892, num_comments: 123, created_utc: now - 7200, subreddit: 'CryptoCurrency', url: '#', selftext: 'On-chain metrics showing increased adoption. Daily transactions up 200% from last month.' },
      { title: 'DOGE to $1? Updated price model with regression analysis', score: 456, num_comments: 89, created_utc: now - 10800, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'New model based on network value and transaction growth suggests $1 is achievable in the next market cycle.' },
      { title: 'Community update: Dogecoin Foundation Q1 progress report', score: 234, num_comments: 45, created_utc: now - 14400, subreddit: 'dogecoin', url: '#', selftext: 'Major progress on the GigaWallet, LibDogecoin, and RadioDoge projects. The ecosystem is growing.' },
      { title: 'I converted all my DOGE to BTC — here is why (unpopular opinion)', score: 67, num_comments: 234, created_utc: now - 18000, subreddit: 'CryptoCurrency', url: '#', selftext: 'I love the DOGE community but from a risk/reward perspective, I think BTC is the safer play right now.' },
      { title: 'Do Only Good Everyday — my DOGE coffee shop now accepts it!', score: 345, num_comments: 56, created_utc: now - 21600, subreddit: 'dogecoin', url: '#', selftext: 'Real adoption happening! My coffee shop started accepting DOGE yesterday and already had 12 transactions.' },
    ],
    'shib': [
      { title: 'Shibarium L2 hitting record transaction counts', score: 678, num_comments: 89, created_utc: now - 4200, subreddit: 'shib', url: '#', selftext: 'The L2 network is growing rapidly. Gas fees near zero and transaction speed is impressive.' },
      { title: 'SHIB burn rate spikes 1000% in last 24 hours', score: 456, num_comments: 67, created_utc: now - 8400, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Massive burn event triggered by the new burn portal. Supply decreasing faster than expected.' },
      { title: 'SHIB metaverse update — first gameplay footage leaked', score: 234, num_comments: 45, created_utc: now - 12600, subreddit: 'CryptoCurrency', url: '#', selftext: 'The metaverse project is further along than people think. Gameplay looks solid.' },
      { title: 'Is SHIB dead? Honest analysis from a long-term holder', score: 89, num_comments: 123, created_utc: now - 16800, subreddit: 'memecoins', url: '#', selftext: 'Sentiment is low but the fundamentals are actually stronger than ever. Building while others despair.' },
      { title: 'SHIB ecosystem token BONE pumping — 40% today', score: 345, num_comments: 56, created_utc: now - 19200, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'BONE is the governance token for Shibarium. As L2 grows, BONE could see massive upside.' },
      { title: 'Weekly SHIB thread — patience is a virtue', score: 123, num_comments: 34, created_utc: now - 23400, subreddit: 'shib', url: '#', selftext: 'We are in accumulation phase. Smart money is loading up while retail is scared.' },
    ],
    'bonk': [
      { title: 'BONK just flipped MYRO as #1 Solana memecoin', score: 567, num_comments: 89, created_utc: now - 3000, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Market cap surpassed MYRO today. The Solana memecoin king is back with a vengeance.' },
      { title: 'Solana memecoin season 2.0 — BONK leading the charge', score: 345, num_comments: 67, created_utc: now - 6000, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'Every Solana memecoin cycle starts with BONK pumping. History is about to repeat.' },
      { title: 'BONKbot volume exceeds $100M in 24hrs', score: 234, num_comments: 45, created_utc: now - 9000, subreddit: 'CryptoCurrency', url: '#', selftext: 'The trading bot ecosystem built around BONK is generating insane volume numbers.' },
      { title: 'New BONK NFT collection selling out in minutes', score: 178, num_comments: 34, created_utc: now - 12000, subreddit: 'memecoins', url: '#', selftext: 'Limited collection of 5000 BONK-themed NFTs sold out in under 10 minutes. Community is dedicated.' },
      { title: 'BONK price prediction: conservative $0.0001 by Q2', score: 89, num_comments: 23, created_utc: now - 18000, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Based on Solana ecosystem growth and upcoming catalysts, this target seems very achievable.' },
      { title: 'Took profits on BONK too early — lesson learned', score: 56, num_comments: 12, created_utc: now - 21600, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'Sold at 2x and it went on to do 10x. Diamond hands would have paid off big time.' },
    ],
  };

  const defaultPosts = [
    { title: `${coinName} gaining traction in crypto communities — volume surge detected`, score: 456, num_comments: 78, created_utc: now - 3600, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Social metrics showing increased interest. Multiple communities discussing entry points.' },
    { title: `Why ${coinName} could surprise everyone in the next 48 hours`, score: 234, num_comments: 45, created_utc: now - 7200, subreddit: 'SatoshiStreetBets', url: '#', selftext: 'Chart setup looks promising with increasing social volume. Key catalyst events approaching.' },
    { title: `${coinName} daily discussion thread — accumulation zone?`, score: 123, num_comments: 34, created_utc: now - 10800, subreddit: 'CryptoCurrency', url: '#', selftext: 'Price has been consolidating for weeks. Community sentiment turning cautiously bullish.' },
    { title: `New listings for ${coinName} — bullish signal?`, score: 89, num_comments: 23, created_utc: now - 14400, subreddit: 'memecoins', url: '#', selftext: 'Exchange listings usually precede price moves. Two new listings confirmed this week.' },
    { title: `${coinName} whale activity increasing — on-chain analysis`, score: 67, num_comments: 12, created_utc: now - 18000, subreddit: 'CryptoCurrency', url: '#', selftext: 'Large wallet movements detected. Smart money appears to be positioning ahead of an event.' },
    { title: `Is ${coinName} undervalued? Market cap comparison`, score: 45, num_comments: 8, created_utc: now - 21600, subreddit: 'CryptoMoonShots', url: '#', selftext: 'Compared to similar projects, the market cap leaves room for significant upside.' },
  ];

  return mockSets[coin] || defaultPosts;
}

module.exports = { searchCoinMentions, computeMentionVelocity };
