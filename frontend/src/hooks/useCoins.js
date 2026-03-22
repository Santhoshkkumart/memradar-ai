import { useEffect, useRef } from 'react';
import useMemeStore from '../store/useMemeStore';
import { fetchTrendingCoins, fetchFearGreed } from '../api/client';
import { computeHypeScore } from '../utils/hypeScore';

const DEMO_COINS = [
  { id: 'floki-inu', name: 'FLOKI', symbol: 'FLOKI', thumb: 'https://assets.coingecko.com/coins/images/16746/thumb/PNG_image.png', market_cap_rank: 55, price_usd: 0.000187, change_24h: 28.7 },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', thumb: 'https://assets.coingecko.com/coins/images/29850/thumb/pepe-token.jpeg', market_cap_rank: 46, price_usd: 0.0000089, change_24h: 12.5 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', thumb: 'https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpg', market_cap_rank: 62, price_usd: 0.0000234, change_24h: 15.8 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', thumb: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png', market_cap_rank: 8, price_usd: 0.152, change_24h: 5.3 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', thumb: 'https://assets.coingecko.com/coins/images/11939/thumb/shiba.png', market_cap_rank: 15, price_usd: 0.0000198, change_24h: -2.1 },
];

export default function useCoins() {
  const { setCoins, setFearGreed, setLoading, setError, clearError, selectCoin, selectedCoin, setSelectedCoin, sentiment, hypeStage, velocity } = useMemeStore();
  const intervalRef = useRef(null);
  const fearIntervalRef = useRef(null);
  const selectedCoinRef = useRef(selectedCoin);

  useEffect(() => {
    selectedCoinRef.current = selectedCoin;
  }, [selectedCoin]);

  useEffect(() => {
    async function loadCoins() {
      setLoading('coins', true);
      clearError('coins');
      try {
        const data = await fetchTrendingCoins();
        // Compute hype scores for sorting
        const enriched = data.map(coin => ({
          ...coin,
          hypeScore: computeHypeScore(
            Math.random() * 100, // initial random sentiment for sorting
            1 + Math.random() * 4,
            ['early_whisper', 'building_momentum', 'peak_frenzy', 'cooling_down'][Math.floor(Math.random() * 4)]
          )
        }));
        enriched.sort((a, b) => b.hypeScore - a.hypeScore);
        setCoins(enriched);

        // Auto-select first coin
        const currentSelected = selectedCoinRef.current;

        if (!currentSelected && enriched.length > 0) {
          selectCoin(enriched[0]);
        } else if (currentSelected && enriched.length > 0) {
          const updatedSelected = enriched.find(coin => coin.id === currentSelected.id);
          if (updatedSelected) {
            setSelectedCoin(updatedSelected);
          }
        }
      } catch (err) {
        const fallback = DEMO_COINS.map(coin => ({
          ...coin,
          hypeScore: computeHypeScore(
            Math.random() * 100,
            1 + Math.random() * 4,
            ['early_whisper', 'building_momentum', 'peak_frenzy', 'cooling_down'][Math.floor(Math.random() * 4)]
          )
        })).sort((a, b) => b.hypeScore - a.hypeScore);

        setCoins(fallback);
        if (!selectedCoinRef.current && fallback.length > 0) {
          selectCoin(fallback[0]);
        }
        setError('coins', 'Backend unavailable, using demo data');
      } finally {
        setLoading('coins', false);
      }
    }

    loadCoins();
    intervalRef.current = setInterval(loadCoins, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectCoin, setSelectedCoin, setCoins, setLoading, setError, clearError]);

  // Update hype scores when sentiment/velocity data changes for selected coin
  useEffect(() => {
    if (!selectedCoin || !sentiment || !velocity || !hypeStage) return;

    setCoins((currentCoins) => currentCoins.map(coin => {
      if (coin.id === selectedCoin.id) {
        return {
          ...coin,
          hypeScore: computeHypeScore(
            sentiment.sentiment_score,
            velocity.velocity_ratio,
            hypeStage.hype_stage
          ),
          sentiment_score: sentiment.sentiment_score,
          hype_stage: hypeStage.hype_stage,
          velocity_ratio: velocity.velocity_ratio,
        };
      }
      return coin;
    }));
  }, [sentiment, velocity, hypeStage, selectedCoin, setCoins]);

  useEffect(() => {
    async function loadFearGreed() {
      try {
        const data = await fetchFearGreed();
        setFearGreed(data);
      } catch (err) {
        setFearGreed({ value: '65', value_classification: 'Greed' });
      }
    }

    loadFearGreed();
    fearIntervalRef.current = setInterval(loadFearGreed, 600000);

    return () => {
      if (fearIntervalRef.current) clearInterval(fearIntervalRef.current);
    };
  }, []);
}
