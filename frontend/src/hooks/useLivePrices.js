import { useEffect, useMemo, useRef, useState } from 'react';
import useMemeStore from '../store/useMemeStore';
import { fetchCoinPrice } from '../api/client';

const PRICE_WINDOW_MS = 5 * 60 * 1000;
const PRICE_ALERT_COOLDOWN_MS = 10 * 60 * 1000;
const VOLUME_ALERT_COOLDOWN_MS = 10 * 60 * 1000;
const MIN_VOLUME_SPIKE_RATIO = 2.5;
const MAX_HISTORY_POINTS = 20;

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/stream?streams=';
const KRAKEN_WS_BASE = 'wss://ws.kraken.com/v2';

const BINANCE_SYMBOLS = {
  'pepe': 'pepeusdt',
  'dogecoin': 'dogeusdt',
  'shiba-inu': 'shibusdt',
  'floki-inu': 'flokiusdt',
  'bonk': 'bonkusdt',
  'wif': 'wifusdt',
  'dogwifhat': 'wifusdt',
  'turbo': 'turbousdt',
  'mog-coin': 'mogusdt',
  'brett': 'brettusdt',
  'popcat': 'popcatusdt',
  'fartcoin': 'fartcoinusdt',
};

const KRAKEN_SYMBOLS = {
  'pepe': 'PEPE/USD',
  'dogecoin': 'DOGE/USD',
  'doge': 'DOGE/USD',
  'shiba-inu': 'SHIB/USD',
  'shib': 'SHIB/USD',
  'floki-inu': 'FLOKI/USD',
  'floki': 'FLOKI/USD',
  'bonk': 'BONK/USD',
  'wif': 'WIF/USD',
  'dogwifhat': 'WIF/USD',
  'turbo': 'TURBO/USD',
  'mog-coin': 'MOG/USD',
  'mog': 'MOG/USD',
  'brett': 'BRETT/USD',
  'popcat': 'POPCAT/USD',
  'fartcoin': 'FARTCOIN/USD',
};

function resolveProvider(coin) {
  const binanceSymbol = BINANCE_SYMBOLS[coin.id] || null;
  if (binanceSymbol) {
    return { provider: 'binance', symbol: binanceSymbol };
  }

  const krakenSymbol = KRAKEN_SYMBOLS[coin.id] || KRAKEN_SYMBOLS[String(coin.symbol || '').toLowerCase()] || null;
  if (krakenSymbol) {
    return { provider: 'kraken', symbol: krakenSymbol };
  }

  return null;
}

function toDisplaySymbol(coin) {
  return coin.symbol || coin.name || coin.id.toUpperCase();
}

function formatPrice(price) {
  if (!Number.isFinite(price)) return null;
  return price;
}

function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function parseTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function buildAlertBody(symbol, oldPrice, newPrice, minutes) {
  return `${symbol} moved from $${oldPrice.toFixed(oldPrice < 1 ? 6 : 2)} to $${newPrice.toFixed(newPrice < 1 ? 6 : 2)} in the last ${minutes} minutes. Live WebSocket data is feeding the dashboard in real time.`;
}

function appendHistory(historyMap, coinId, entry) {
  const current = historyMap.get(coinId) || [];
  const next = [...current, entry].slice(-MAX_HISTORY_POINTS);
  historyMap.set(coinId, next);
  return next;
}

function getWindowStats(entries, now) {
  const currentWindow = entries.filter((entry) => now - entry.ts <= PRICE_WINDOW_MS);
  const previousWindow = entries.filter((entry) => now - entry.ts > PRICE_WINDOW_MS && now - entry.ts <= 2 * PRICE_WINDOW_MS);
  const baselinePrice = currentWindow[0]?.price || entries[0]?.price || 0;
  const price = currentWindow[currentWindow.length - 1]?.price || baselinePrice;
  const currentVolume = currentWindow.reduce((sum, entry) => sum + (entry.volume || 0), 0);
  const previousVolume = previousWindow.reduce((sum, entry) => sum + (entry.volume || 0), 0);
  const priceChange5m = baselinePrice > 0 ? ((price - baselinePrice) / baselinePrice) * 100 : 0;
  const volumeRatio = previousVolume > 0 ? currentVolume / previousVolume : 0;

  return {
    baselinePrice,
    price,
    currentVolume,
    previousVolume,
    priceChange5m,
    volumeRatio,
  };
}

function normalizeProviderName(provider) {
  if (provider === 'binance') return 'Binance';
  if (provider === 'kraken') return 'Kraken';
  return 'Polling';
}

export default function useLivePrices() {
  const { coins, updateCoinLiveDataBatch, addAlert, setLiveFeedStatus } = useMemeStore();
  const socketRefs = useRef({ binance: null, kraken: null });
  const reconnectRefs = useRef({ binance: null, kraken: null });
  const providerStateRef = useRef({ binance: false, kraken: false });
  const retryPendingRef = useRef({ binance: false, kraken: false });
  const closingRef = useRef({ binance: false, kraken: false });
  const mountedRef = useRef(false);
  const historyRef = useRef(new Map());
  const krakenVolumeRef = useRef(new Map());
  const lastAlertRef = useRef(new Map());
  const pendingUpdatesRef = useRef(new Map());
  const flushTimerRef = useRef(null);
  const pricePollRef = useRef(null);
  const [retryTick, setRetryTick] = useState(0);

  const subscriptionKey = useMemo(() => {
    return coins
      .map((coin) => `${coin.id}:${coin.symbol || ''}`)
      .sort()
      .join('|');
  }, [coins]);

  const pricePollKey = useMemo(() => {
    return coins
      .slice(0, 6)
      .map((coin) => coin.id)
      .sort()
      .join('|');
  }, [coins]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function pollCoinPrices() {
      if (!coins.length) return;

      try {
        const settled = await Promise.allSettled(
          coins.slice(0, 6).map(async (coin) => {
            const price = await fetchCoinPrice(coin.id);
            return [coin.id, {
              price_usd: price?.price_usd ?? coin.price_usd,
              change_24h: price?.change_24h ?? coin.change_24h,
              live_price: price?.price_usd ?? coin.live_price ?? coin.price_usd,
              live_updated_at: Date.now(),
              live_source: coin.live_source || 'polling',
            }];
          })
        );

        const updates = settled
          .filter((result) => result.status === 'fulfilled' && Array.isArray(result.value))
          .map((result) => result.value);

        if (updates.length > 0) {
          updateCoinLiveDataBatch(updates);
        }
      } catch {
        // Keep the websocket feed as the primary source.
      }
    }

    pollCoinPrices();
    if (pricePollRef.current) clearInterval(pricePollRef.current);
    pricePollRef.current = setInterval(pollCoinPrices, 5000);

    return () => {
      if (pricePollRef.current) {
        clearInterval(pricePollRef.current);
        pricePollRef.current = null;
      }
    };
  }, [pricePollKey, updateCoinLiveDataBatch]);

  const flushPendingUpdates = () => {
    if (pendingUpdatesRef.current.size === 0) return;

    const updates = Array.from(pendingUpdatesRef.current.entries());
    pendingUpdatesRef.current.clear();
    updateCoinLiveDataBatch(updates);
  };

  const queueLiveUpdate = (coinId, patch) => {
    const existing = pendingUpdatesRef.current.get(coinId) || {};
    pendingUpdatesRef.current.set(coinId, { ...existing, ...patch });

    if (flushTimerRef.current) return;

    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      flushPendingUpdates();
    }, 100);
  };

  useEffect(() => {
    const providerPlans = {
      binance: [],
      kraken: [],
    };

    coins.forEach((coin) => {
      const resolved = resolveProvider(coin);
      if (!resolved) return;

      providerPlans[resolved.provider].push({
        coin,
        symbol: resolved.symbol,
      });
    });

    const activeProviders = Object.entries(providerPlans)
      .filter(([, items]) => items.length > 0)
      .map(([provider]) => provider);

    const syncStatus = () => {
      const openProviders = activeProviders.filter((provider) => providerStateRef.current[provider]);
      if (openProviders.length > 0) {
        setLiveFeedStatus({
          status: 'connected',
          provider: openProviders.map(normalizeProviderName).join(' + '),
        });
        return;
      }

      const retryProviders = activeProviders.filter((provider) => retryPendingRef.current[provider]);
      if (retryProviders.length > 0) {
        setLiveFeedStatus({
          status: 'reconnecting',
          provider: retryProviders.map(normalizeProviderName).join(' + '),
        });
        return;
      }

      setLiveFeedStatus({
        status: activeProviders.length > 0 ? 'fallback polling' : 'polling only',
        provider: activeProviders.map(normalizeProviderName).join(' + ') || null,
      });
    };

    const clearProviderTimers = (provider) => {
      if (reconnectRefs.current[provider]) {
        clearTimeout(reconnectRefs.current[provider]);
        reconnectRefs.current[provider] = null;
      }
    };

    const scheduleRetry = (provider) => {
      if (reconnectRefs.current[provider]) {
        retryPendingRef.current[provider] = true;
        syncStatus();
        return;
      }

      retryPendingRef.current[provider] = true;
      syncStatus();

      clearProviderTimers(provider);
      reconnectRefs.current[provider] = setTimeout(() => {
        if (!mountedRef.current) return;
        setRetryTick((value) => value + 1);
      }, 5000);
    };

    const maybeAddAlert = (key, cooldownMs, alert) => {
      const now = Date.now();
      const lastAlertAt = lastAlertRef.current.get(key) || 0;
      if (now - lastAlertAt < cooldownMs) return;

      lastAlertRef.current.set(key, now);
      addAlert(alert);
    };

    const updateHistory = (coinId, price, volume, ts) => {
      const next = appendHistory(historyRef.current, coinId, { ts, price, volume });
      const stats = getWindowStats(next, ts);

      queueLiveUpdate(coinId, {
        price_usd: price,
        live_price: price,
        live_volume_5m: stats.currentVolume,
        live_price_change_5m: stats.priceChange5m,
        live_updated_at: ts,
        live_history: next.map((entry) => entry.price),
      });

      return stats;
    };

    const openBinance = () => {
      const plan = providerPlans.binance;
      if (plan.length === 0) return;

      const streamList = plan.map(({ symbol }) => `${symbol}@aggTrade`).join('/');
      const socket = new WebSocket(`${BINANCE_WS_BASE}${streamList}`);
      socketRefs.current.binance = socket;
      retryPendingRef.current.binance = false;
      syncStatus();

      socket.onopen = () => {
        providerStateRef.current.binance = true;
        retryPendingRef.current.binance = false;
        syncStatus();
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const stream = payload.stream || '';
          const data = payload.data || {};
          const streamSymbol = stream.split('@')[0];
          const entry = plan.find((item) => item.symbol === streamSymbol);
          if (!entry || !data) return;

          const price = formatPrice(Number(data.p));
          const qty = Number(data.q);
          const ts = Number(data.T || data.E || Date.now());
          if (!Number.isFinite(price) || !Number.isFinite(qty)) return;

          const stats = updateHistory(entry.coin.id, price, price * qty, ts);

          if (Math.abs(stats.priceChange5m) >= 10) {
            maybeAddAlert(`${entry.coin.id}:price`, PRICE_ALERT_COOLDOWN_MS, {
              coin: toDisplaySymbol(entry.coin),
              alert_level: 'critical',
              headline: `${toDisplaySymbol(entry.coin)} price spiked ${formatPercent(stats.priceChange5m)} in 5 minutes`,
              body: buildAlertBody(toDisplaySymbol(entry.coin), stats.baselinePrice, stats.price, 5),
              timestamp: Date.now(),
              is_critical: true,
              source: 'binance_ws',
            });
          }

          if (stats.volumeRatio >= MIN_VOLUME_SPIKE_RATIO && stats.currentVolume > 0) {
            maybeAddAlert(`${entry.coin.id}:volume`, VOLUME_ALERT_COOLDOWN_MS, {
              coin: toDisplaySymbol(entry.coin),
              alert_level: 'alert',
              headline: `${toDisplaySymbol(entry.coin)} volume surged ${stats.volumeRatio.toFixed(1)}x in 5 minutes`,
              body: `${toDisplaySymbol(entry.coin)} recorded ${stats.currentVolume.toFixed(0)} USDT of traded volume over the last 5 minutes versus ${stats.previousVolume.toFixed(0)} USDT in the prior window. Live trade flow is materially above baseline.`,
              timestamp: Date.now(),
              is_critical: false,
              source: 'binance_ws',
            });
          }
        } catch {
          // Ignore malformed messages and keep the socket alive.
        }
      };

      socket.onerror = () => {
        providerStateRef.current.binance = false;
        scheduleRetry('binance');
      };

      socket.onclose = () => {
        providerStateRef.current.binance = false;
        socketRefs.current.binance = null;
        syncStatus();

        if (closingRef.current.binance) {
          closingRef.current.binance = false;
          return;
        }

        scheduleRetry('binance');
      };
    };

    const openKraken = () => {
      const plan = providerPlans.kraken;
      if (plan.length === 0) return;

      const socket = new WebSocket(KRAKEN_WS_BASE);
      socketRefs.current.kraken = socket;
      retryPendingRef.current.kraken = false;
      syncStatus();

      socket.onopen = () => {
        providerStateRef.current.kraken = true;
        retryPendingRef.current.kraken = false;
        syncStatus();

        socket.send(JSON.stringify({
          method: 'subscribe',
          params: {
            channel: 'ticker',
            symbol: plan.map(({ symbol }) => symbol),
            snapshot: true,
          },
        }));
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const records = Array.isArray(payload.data) ? payload.data : [];
          if (payload.channel !== 'ticker' || records.length === 0) return;

          records.forEach((record) => {
            const entry = plan.find((item) => item.symbol === record.symbol);
            if (!entry) return;

            const price = formatPrice(Number(record.last));
            if (!Number.isFinite(price)) return;

            const now = parseTimestamp(record.timestamp);
            const currentVolume = Number(record.volume || 0);
            const previousVolume = krakenVolumeRef.current.get(entry.coin.id) || 0;
            const volumeDelta = Math.max(0, currentVolume - previousVolume);
            krakenVolumeRef.current.set(entry.coin.id, currentVolume);

            const stats = updateHistory(entry.coin.id, price, volumeDelta, now);

          if (typeof record.change_pct === 'number') {
              queueLiveUpdate(entry.coin.id, {
                change_24h: record.change_pct,
                live_source: 'kraken',
              });
            }

            if (Math.abs(stats.priceChange5m) >= 10) {
              maybeAddAlert(`${entry.coin.id}:price`, PRICE_ALERT_COOLDOWN_MS, {
                coin: toDisplaySymbol(entry.coin),
                alert_level: 'critical',
                headline: `${toDisplaySymbol(entry.coin)} price spiked ${formatPercent(stats.priceChange5m)} in 5 minutes`,
                body: buildAlertBody(toDisplaySymbol(entry.coin), stats.baselinePrice, stats.price, 5),
                timestamp: Date.now(),
                is_critical: true,
                source: 'kraken_ws',
              });
            }

            if (stats.volumeRatio >= MIN_VOLUME_SPIKE_RATIO && stats.currentVolume > 0) {
              maybeAddAlert(`${entry.coin.id}:volume`, VOLUME_ALERT_COOLDOWN_MS, {
                coin: toDisplaySymbol(entry.coin),
                alert_level: 'alert',
                headline: `${toDisplaySymbol(entry.coin)} volume surged ${stats.volumeRatio.toFixed(1)}x in 5 minutes`,
                body: `${toDisplaySymbol(entry.coin)} recorded ${stats.currentVolume.toFixed(0)} units of activity over the last 5 minutes versus ${stats.previousVolume.toFixed(0)} in the prior window. Live Kraken ticker flow is materially above baseline.`,
                timestamp: Date.now(),
                is_critical: false,
                source: 'kraken_ws',
              });
            }
          });
        } catch {
          // Ignore malformed payloads from the public stream.
        }
      };

      socket.onerror = () => {
        providerStateRef.current.kraken = false;
        scheduleRetry('kraken');
      };

      socket.onclose = () => {
        providerStateRef.current.kraken = false;
        socketRefs.current.kraken = null;
        syncStatus();

        if (closingRef.current.kraken) {
          closingRef.current.kraken = false;
          return;
        }

        scheduleRetry('kraken');
      };
    };

    const closeProvider = (provider) => {
      const socket = socketRefs.current[provider];
      if (!socket) return;

      closingRef.current[provider] = true;
      socket.close();
      socketRefs.current[provider] = null;
    };

    closeProvider('binance');
    closeProvider('kraken');
    clearProviderTimers('binance');
    clearProviderTimers('kraken');
    providerStateRef.current = { binance: false, kraken: false };
    retryPendingRef.current = { binance: false, kraken: false };

    if (activeProviders.length === 0) {
      setLiveFeedStatus({
        status: 'polling only',
        provider: null,
      });
      return undefined;
    }

    setLiveFeedStatus({
      status: 'connecting',
      provider: activeProviders.map(normalizeProviderName).join(' + '),
    });

    openBinance();
    openKraken();

    return () => {
      closeProvider('binance');
      closeProvider('kraken');
      clearProviderTimers('binance');
      clearProviderTimers('kraken');
      if (pricePollRef.current) {
        clearInterval(pricePollRef.current);
        pricePollRef.current = null;
      }
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [addAlert, retryTick, setLiveFeedStatus, subscriptionKey, updateCoinLiveDataBatch]);
}
