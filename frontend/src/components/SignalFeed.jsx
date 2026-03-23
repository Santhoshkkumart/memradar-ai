import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RefreshCw, PlusCircle } from 'lucide-react';
import useSignalStore from '../store/useSignalStore';
import SignalCard from './SignalCard';
import { cn } from '@/lib/utils';

export default function SignalFeed() {
  const { signals, filterCoin, setFilterCoin, following, addSignal } = useSignalStore();

  const coins = useMemo(() => {
    const items = Array.from(new Set(signals.map((signal) => signal.coin)));
    return items.sort();
  }, [signals]);

  const filteredSignals = filterCoin
    ? signals.filter((signal) => signal.coin === filterCoin)
    : signals;

  const handleAddDemoSignal = () => {
    const nextSignal = {
      id: Date.now(),
      type: 'breakout',
      coin: 'BONK',
      icon: 'bolt',
      emoji: 'flare',
      headline: 'BONK social chatter picked up in the last 5 minutes',
      body: 'A fresh cluster of posts is showing higher engagement than the previous scan. The feed prepends new signals so the most recent item appears first.',
      time: 'just now',
      timeAgo: 0,
      alert_level: 'alert',
      stats: { spike: '+84%', sentiment: '+66', velocity: '3.1x', stage: 'Building' },
      color: 'ff8c00',
    };

    addSignal(nextSignal);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-border bg-surface shadow-2xl p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-black">Signal Feed</p>
            <h2 className="mt-2 text-3xl font-black text-white tracking-tight">Live AI signals across every coin</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              A Twitter-style timeline for market intelligence. Like, comment, follow coins, and keep the feed focused on the tokens you care about.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddDemoSignal}
              className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-cyan"
            >
              <PlusCircle className="h-4 w-4" />
              Add Signal
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-muted">
              <RefreshCw className="h-4 w-4" />
              {signals.length} total
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterCoin(null)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              filterCoin === null ? 'border-cyan/30 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/5 text-muted hover:text-white'
            )}
          >
            <Filter className="h-4 w-4" />
            All
          </button>
          {coins.map((coin) => (
            <button
              key={coin}
              type="button"
              onClick={() => setFilterCoin(coin)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                filterCoin === coin ? 'border-green/30 bg-green/10 text-green' : 'border-white/10 bg-white/5 text-muted hover:text-white'
              )}
            >
              {coin}
            </button>
          ))}
          <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-muted font-black">
            Following {following.length} coins
          </span>
        </div>
      </motion.section>

      <AnimatePresence>
        {filteredSignals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border bg-surface px-6 py-12 text-center text-muted"
          >
            No signals match this filter.
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
