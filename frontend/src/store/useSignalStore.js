import { create } from 'zustand';

const INITIAL_SIGNALS = [
  {
    id: 1,
    type: 'early_whisper',
    coin: 'FLOKI',
    icon: 'zap',
    emoji: 'alert',
    headline: 'FLOKI just entered Early Whisper stage',
    body: '601% mention spike detected across CryptoPanic and LunarCrush. Sentiment score +91. No bot activity. Galaxy Score jumped from 44 to 78 in 6 hours.',
    time: '2 min ago',
    timeAgo: 2,
    alert_level: 'critical',
    stats: { spike: '+601%', sentiment: '+91', velocity: '12.8x', stage: 'Early Whisper' },
    color: '00e5ff',
  },
  {
    id: 2,
    type: 'sentiment_spike',
    coin: 'PEPE',
    icon: 'frog',
    emoji: 'chart',
    headline: 'PEPE sentiment crossed +80 for first time today',
    body: 'Sentiment arc showing sharp upward curve over last 3 hours. Primary emotion: FOMO. 3 major news articles published in last hour.',
    time: '8 min ago',
    timeAgo: 8,
    alert_level: 'alert',
    stats: { spike: '+284%', sentiment: '+82', velocity: '9.4x', stage: 'Building' },
    color: '00ff88',
  },
  {
    id: 3,
    type: 'bot_warning',
    coin: 'SHIB',
    icon: 'fire',
    emoji: 'warning',
    headline: 'SHIB showing elevated bot activity',
    body: '60% of recent posts flagged as coordinated. Copy-paste patterns detected across 847 accounts. Real organic sentiment is actually -30. Exercise caution.',
    time: '15 min ago',
    timeAgo: 15,
    alert_level: 'caution',
    stats: { spike: '-43%', sentiment: '-30', velocity: '0.4x', stage: 'Cooling' },
    color: 'ff3355',
  },
  {
    id: 4,
    type: 'new_token',
    coin: 'WOJAK',
    icon: 'new',
    emoji: 'launch',
    headline: 'New token WOJAK detected - 4 hours old',
    body: '340 organic mentions in first 4 hours. Very early community forming on Telegram. No exchange listing yet. Extremely high risk but extremely early signal.',
    time: '22 min ago',
    timeAgo: 22,
    alert_level: 'watch',
    stats: { spike: 'NEW', sentiment: '+44', velocity: '4.2x', stage: 'Pre-Whisper' },
    color: 'ffd700',
  },
  {
    id: 5,
    type: 'breakout',
    coin: 'BONK',
    icon: 'bolt',
    emoji: 'flare',
    headline: 'BONK Google Trends breakout detected',
    body: 'Search score jumped from 28 to 61 in 24 hours. Philippines and Vietnam leading search volume. Related searches include "bonk coin buy" and "bonk listing".',
    time: '31 min ago',
    timeAgo: 31,
    alert_level: 'alert',
    stats: { spike: '+212%', sentiment: '+62', velocity: '5.7x', stage: 'Building' },
    color: 'ff8c00',
  },
  {
    id: 6,
    type: 'whale_move',
    coin: 'PEPE',
    icon: 'whale',
    emoji: 'whale',
    headline: 'Large wallet accumulating PEPE quietly',
    body: 'Wallet 0x742d...f8e2 added 847M PEPE tokens in last 6 hours. This wallet bought FLOKI 3 days before its last 2200% pump. Smart money signal.',
    time: '44 min ago',
    timeAgo: 44,
    alert_level: 'alert',
    stats: { spike: '+284%', sentiment: '+82', velocity: '9.4x', stage: 'Building' },
    color: '00ff88',
  },
  {
    id: 7,
    type: 'prediction_correct',
    coin: 'FLOKI',
    icon: 'zap',
    emoji: 'target',
    headline: 'MemeRadar prediction verified - FLOKI +44% in 24hrs',
    body: 'Signal fired 26 hours ago: BULLISH 89% confidence. Actual result: +44% price increase. Prediction accuracy this week: 7/9 correct.',
    time: '1 hr ago',
    timeAgo: 60,
    alert_level: 'watch',
    stats: { predicted: 'BULLISH', confidence: '89%', result: '+44%', accuracy: '78%' },
    color: '00e5ff',
  },
  {
    id: 8,
    type: 'cooling_warning',
    coin: 'DOGE',
    icon: 'dog',
    emoji: 'down',
    headline: 'DOGE entering cooling stage - exit signals forming',
    body: 'Sentiment dropped from +72 to +28 in 12 hours. Mention velocity decelerating. Early holder wallets showing distribution pattern. Hype cycle peak may have passed.',
    time: '1.5 hrs ago',
    timeAgo: 90,
    alert_level: 'caution',
    stats: { spike: '+12%', sentiment: '+28', velocity: '1.2x', stage: 'Cooling' },
    color: 'ffd700',
  },
  {
    id: 9,
    type: 'narrative_shift',
    coin: 'BONK',
    icon: 'refresh',
    emoji: 'shift',
    headline: 'BONK narrative shifted - now driven by exchange listing rumour',
    body: 'Previous narrative: community meme. New narrative: Binance listing rumour spreading across 3 Telegram channels simultaneously. Unconfirmed but high engagement.',
    time: '2 hrs ago',
    timeAgo: 120,
    alert_level: 'watch',
    stats: { spike: '+212%', sentiment: '+62', velocity: '5.7x', stage: 'Building' },
    color: 'ff8c00',
  },
  {
    id: 10,
    type: 'convergence',
    coin: 'FLOKI',
    icon: 'spark',
    emoji: 'fire',
    headline: 'FLOKI - All 5 signals converging simultaneously',
    body: 'News sentiment, LunarCrush galaxy score, mention velocity, Google Trends, and on-chain wallet growth all pointing bullish at the same time. Convergence score: 91/100.',
    time: '2.5 hrs ago',
    timeAgo: 150,
    alert_level: 'critical',
    stats: { convergence: '91/100', signals: '5/5', confidence: '94%', stage: 'Convergence' },
    color: '00e5ff',
  },
  {
    id: 11,
    type: 'community_surge',
    coin: 'PEPE',
    icon: 'users',
    emoji: 'chat',
    headline: 'PEPE community activity surged in Discord and X',
    body: 'Organic posts doubled in under 90 minutes. The ratio of unique authors to total posts improved, suggesting real participation instead of bot amplification.',
    time: '3 hrs ago',
    timeAgo: 180,
    alert_level: 'alert',
    stats: { spike: '+144%', sentiment: '+77', velocity: '4.8x', stage: 'Building' },
    color: '00ff88',
  },
  {
    id: 12,
    type: 'exchange_watch',
    coin: 'BONK',
    icon: 'tower',
    emoji: 'watch',
    headline: 'BONK exchange listing chatter reached watch threshold',
    body: 'A repeated cluster of listing mentions is now visible across social and news. No confirmation yet, but engagement pattern is consistent with early rumor ignition.',
    time: '4 hrs ago',
    timeAgo: 240,
    alert_level: 'watch',
    stats: { spike: '+98%', sentiment: '+59', velocity: '3.6x', stage: 'Watch' },
    color: 'ff8c00',
  },
];

function getInitialLikes(signalId) {
  return signalId * 3;
}

const useSignalStore = create((set) => ({
  signals: INITIAL_SIGNALS,
  comments: {},
  likes: INITIAL_SIGNALS.reduce((acc, signal) => {
    acc[signal.id] = getInitialLikes(signal.id);
    return acc;
  }, {}),
  liked: {},
  following: ['FLOKI', 'PEPE'],
  filterCoin: null,
  activeComment: null,

  setSignals: (signals) => set({ signals }),
  addSignal: (signal) => set((state) => ({
    signals: [signal, ...state.signals].slice(0, 50),
  })),
  toggleLike: (signalId) => set((state) => {
    const liked = Boolean(state.liked[signalId]);
    const currentLikes = state.likes[signalId] || 0;

    return {
      liked: {
        ...state.liked,
        [signalId]: !liked,
      },
      likes: {
        ...state.likes,
        [signalId]: liked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
      },
    };
  }),
  addComment: (signalId, text, author) => set((state) => {
    const nextComment = {
      id: Date.now(),
      text,
      author,
      time: 'just now',
    };

    return {
      comments: {
        ...state.comments,
        [signalId]: [...(state.comments[signalId] || []), nextComment],
      },
    };
  }),
  toggleFollow: (coin) => set((state) => {
    const isFollowing = state.following.includes(coin);
    return {
      following: isFollowing
        ? state.following.filter((item) => item !== coin)
        : [...state.following, coin],
    };
  }),
  setFilterCoin: (coin) => set({ filterCoin: coin || null }),
  setActiveComment: (signalId) => set({ activeComment: signalId || null }),
}));

export default useSignalStore;
