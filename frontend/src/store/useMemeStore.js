import { create } from 'zustand';

function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures, keep runtime state working.
  }
}

function mergeLivePatch(coin, coinId, patch) {
  if (!coin || coin.id !== coinId) return coin;

  return {
    ...coin,
    ...patch,
    price_usd: patch.price_usd ?? coin.price_usd,
    change_24h: patch.change_24h ?? coin.change_24h,
    live_price: patch.live_price ?? patch.price_usd ?? coin.live_price ?? coin.price_usd,
    live_volume_5m: patch.live_volume_5m ?? coin.live_volume_5m,
    live_price_change_5m: patch.live_price_change_5m ?? coin.live_price_change_5m,
    live_updated_at: patch.live_updated_at ?? Date.now(),
    live_source: patch.live_source ?? coin.live_source ?? 'binance',
    live_history: patch.live_history ?? coin.live_history,
  };
}

const useMemeStore = create((set) => ({
  // State
  coins: [],
  selectedCoin: null,
  selectedCoinId: readStoredValue('memeradar.selectedCoinId', ''),
  posts: [],
  sentiment: null,
  hypeStage: null,
  prediction: null,
  alerts: [],
  fearGreed: null,
  velocity: null,
  social: null,
  trends: null,
  activeTab: readStoredValue('memeradar.activeTab', 'dashboard'),
  socialSource: 'cryptopanic',
  lastScanAt: null,
  lastScanCount: 0,
  notificationsMuted: Boolean(readStoredValue('memeradar.notificationsMuted', 'false') === 'true'),
  alertSeverity: readStoredValue('memeradar.alertSeverity', 'all'),
  liveFeedStatus: 'fallback polling',
  liveFeedProvider: null,
  soundEnabled: false,
  loading: {
    coins: false,
    posts: false,
    sentiment: false,
    prediction: false,
  },
  errors: {},

  // Actions
  setCoins: (coins) => set((state) => ({
    coins: typeof coins === 'function' ? coins(state.coins) : coins,
  })),
  setSelectedCoin: (coin) => {
    const selectedCoinId = coin?.id || '';
    writeStoredValue('memeradar.selectedCoinId', selectedCoinId);
    set({ selectedCoin: coin, selectedCoinId });
  },
  updateCoinLiveData: (coinId, patch) => set((state) => {
    return {
      coins: state.coins.map((coin) => mergeLivePatch(coin, coinId, patch)),
      selectedCoin: mergeLivePatch(state.selectedCoin, coinId, patch),
    };
  }),
  updateCoinLiveDataBatch: (updates) => set((state) => {
    const updateMap = updates instanceof Map ? updates : new Map(updates || []);
    if (updateMap.size === 0) return {};
    const selectedPatch = updateMap.get(state.selectedCoin?.id);

    return {
      coins: state.coins.map((coin) => {
        const patch = updateMap.get(coin?.id);
        return patch ? mergeLivePatch(coin, coin.id, patch) : coin;
      }),
      selectedCoin: selectedPatch ? mergeLivePatch(state.selectedCoin, state.selectedCoin?.id, selectedPatch) : state.selectedCoin,
    };
  }),
  selectCoin: (coin) => set({
    selectedCoin: coin,
    selectedCoinId: coin?.id || '',
    sentiment: null,
    hypeStage: null,
    prediction: null,
    posts: [],
    velocity: null,
    social: null,
    trends: null,
  }),
  setPosts: (posts) => set({ posts }),
  setSentiment: (data) => set({ sentiment: data }),
  setHypeStage: (data) => set({ hypeStage: data }),
  setPrediction: (data) => set({ prediction: data }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 20)
  })),
  setFearGreed: (data) => set({ fearGreed: data }),
  setVelocity: (data) => set({ velocity: data }),
  setSocial: (data) => set({ social: data }),
  setTrends: (data) => set({ trends: data }),
  setActiveTab: (tab) => {
    writeStoredValue('memeradar.activeTab', tab);
    set({ activeTab: tab });
  },
  setSocialSource: (source) => set({ socialSource: source }),
  setScanSummary: (summary) => set({
    lastScanAt: summary?.at ?? null,
    lastScanCount: summary?.count ?? 0,
  }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setNotificationsMuted: (muted) => {
    writeStoredValue('memeradar.notificationsMuted', muted ? 'true' : 'false');
    set({ notificationsMuted: muted });
  },
  toggleNotificationsMuted: () => set((state) => {
    const next = !state.notificationsMuted;
    writeStoredValue('memeradar.notificationsMuted', next ? 'true' : 'false');
    return { notificationsMuted: next };
  }),
  setAlertSeverity: (severity) => {
    writeStoredValue('memeradar.alertSeverity', severity);
    set({ alertSeverity: severity });
  },
  cycleAlertSeverity: () => set((state) => {
    const order = ['all', 'watch', 'caution', 'alert', 'critical'];
    const currentIndex = order.indexOf(state.alertSeverity);
    const next = order[(currentIndex + 1) % order.length];
    writeStoredValue('memeradar.alertSeverity', next);
    return { alertSeverity: next };
  }),
  setLiveFeedStatus: (status) => set((state) => ({
    liveFeedStatus: status?.status ?? state.liveFeedStatus,
    liveFeedProvider: status?.provider ?? state.liveFeedProvider,
  })),
  setLoading: (key, bool) => set((state) => ({
    loading: { ...state.loading, [key]: bool }
  })),
  setError: (key, message) => set((state) => ({
    errors: { ...state.errors, [key]: message }
  })),
  clearError: (key) => set((state) => {
    const newErrors = { ...state.errors };
    delete newErrors[key];
    return { errors: newErrors };
  }),
}));

export default useMemeStore;
