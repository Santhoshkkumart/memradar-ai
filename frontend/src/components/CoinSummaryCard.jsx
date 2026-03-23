import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { fetchCoinSummary } from '../api/client';
import GlareCard from './ui/GlareCard';
import { TextShimmer } from './ui/TextShimmer';
import { cn } from '@/lib/utils';

const CACHE = new Map();

function SummarySkeleton() {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-5">
      <div className="loader mb-4 scale-75" />
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function CoinSummaryCard() {
  const { selectedCoin } = useMemeStore();
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const startTimeRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!selectedCoin) return;

      const cacheKey = selectedCoin.id || selectedCoin.symbol || selectedCoin.name;
      setExpanded(false);
      setError('');

      if (CACHE.has(cacheKey)) {
        setSummary(CACHE.get(cacheKey));
        setLoading(false);
        return;
      }

      setLoading(true);
      setSummary(null);
      startTimeRef.current = Date.now();

      try {
        const data = await fetchCoinSummary(selectedCoin.symbol || selectedCoin.name || selectedCoin.id);
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed < 300) {
          await new Promise((resolve) => setTimeout(resolve, 300 - elapsed));
        }
        if (!active) return;
        CACHE.set(cacheKey, data);
        setSummary(data);
      } catch {
        if (!active) return;
        setError('Could not load summary. Try again.');
        setSummary(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [selectedCoin?.id, selectedCoin?.name, selectedCoin?.symbol]);

  const handleRetry = async () => {
    if (!selectedCoin) return;
    const cacheKey = selectedCoin.id || selectedCoin.symbol || selectedCoin.name;
    CACHE.delete(cacheKey);
    setError('');
    setLoading(true);
    setSummary(null);
    startTimeRef.current = Date.now();
    try {
      const data = await fetchCoinSummary(selectedCoin.symbol || selectedCoin.name || selectedCoin.id);
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 300) {
        await new Promise((resolve) => setTimeout(resolve, 300 - elapsed));
      }
      CACHE.set(cacheKey, data);
      setSummary(data);
    } catch {
      setError('Could not load summary. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCoin) return null;

  const riskTone = summary?.risk_tone || { label: 'Lower risk', color: 'text-green', border: 'border-green/30', bg: 'bg-green/10' };

  return (
    <GlareCard className="mb-6">
      <div className="border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,37,0.96),rgba(6,12,24,0.98))]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            'w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors',
            expanded ? 'border-b border-white/10 rounded-t-[18px]' : 'rounded-[18px]'
          )}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-muted font-black">Coin Summary</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan">
                <Sparkles className="h-3 w-3" />
                Live
              </span>
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest', riskTone.border, riskTone.bg, riskTone.color)}>
                <ShieldAlert className="h-3 w-3" />
                {riskTone.label}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-black text-white tracking-tight">
              <TextShimmer as="span" duration={1.2} className="text-inherit [--base-color:#ffffff] [--base-gradient-color:#00e5ff]">
                {selectedCoin.name} at a glance
              </TextShimmer>
            </h3>
            <p className="mt-2 text-sm text-slate-300 line-clamp-2">
              {summary?.explanation || 'Loading market context and social signals...'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-cyan" />
            ) : expanded ? (
              <ChevronUp className="h-5 w-5 text-muted" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {loading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-5 overflow-hidden"
            >
              <SummarySkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {!loading && error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-5 overflow-hidden"
            >
              <div className="rounded-[18px] border border-red/20 bg-red/10 p-4">
                <p className="text-sm text-red font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-red/30 bg-red/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-red"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {!loading && !error && expanded && summary && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              className="px-5 pb-5 overflow-hidden"
            >
              <div className="space-y-4">
                <section className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted font-black mb-2">Explanation</p>
                  <p className="text-sm text-white leading-relaxed">{summary.explanation}</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="rounded-[18px] border border-green/20 bg-green/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-green font-black mb-2">What looks good</p>
                    <ul className="space-y-2">
                      {summary.love?.length ? summary.love.map((item) => (
                        <li key={item} className="text-sm text-slate-100 leading-relaxed">
                          <span className="text-green font-bold">+</span> {item}
                        </li>
                      )) : <li className="text-sm text-muted">No positives available.</li>}
                    </ul>
                  </section>

                  <section className="rounded-[18px] border border-red/20 bg-red/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-red font-black mb-2">What can break it</p>
                    <ul className="space-y-2">
                      {summary.hate?.length ? summary.hate.map((item) => (
                        <li key={item} className="text-sm text-slate-100 leading-relaxed">
                          <span className="text-red font-bold">-</span> {item}
                        </li>
                      )) : <li className="text-sm text-muted">No risks available.</li>}
                    </ul>
                  </section>
                </div>

                <section className="rounded-[18px] border border-cyan/20 bg-cyan/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan font-black mb-2">Historical Context</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{summary.historical_context}</p>
                </section>

                <section className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted font-black mb-2">Community Vibe</p>
                  <p className="text-sm italic text-slate-300 leading-relaxed">{summary.community_vibe}</p>
                </section>

                {summary.fun_fact ? (
                  <section className="rounded-[18px] border border-yellow/20 bg-yellow/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-yellow font-black mb-2">Fun Fact</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{summary.fun_fact}</p>
                  </section>
                ) : null}

                <p className="text-[10px] italic text-muted leading-relaxed">
                  {summary.disclaimer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlareCard>
  );
}
