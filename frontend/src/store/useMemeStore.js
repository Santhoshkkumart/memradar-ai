import { create } from 'zustand';

const useMemeStore = create((set) => ({
  // State
  coins: [],
  selectedCoin: null,
  posts: [],
  sentiment: null,
  hypeStage: null,
  prediction: null,
  alerts: [],
  fearGreed: null,
  velocity: null,
  activeTab: 'dashboard',
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
  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  selectCoin: (coin) => set({
    selectedCoin: coin,
    sentiment: null,
    hypeStage: null,
    prediction: null,
    posts: [],
    velocity: null,
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
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
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
