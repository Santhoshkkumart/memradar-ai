import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Sparkles } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { fetchGoogleSearchResults } from '../api/client';
import { cn } from '@/lib/utils';

const CACHE = new Map();

export default function GoogleSearchCard() {
  const selectedCoin = useMemeStore((state) => state.selectedCoin);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cacheKey = useMemo(() => {
    if (!selectedCoin) return '';
    return selectedCoin.id || selectedCoin.symbol || selectedCoin.name || '';
  }, [selectedCoin]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!selectedCoin) {
        setResults(null);
        setLoading(false);
        return;
      }

      setError('');

      if (CACHE.has(cacheKey)) {
        setResults(CACHE.get(cacheKey));
        setLoading(false);
        return;
      }

      setLoading(true);
      setResults(null);

      try {
        const data = await fetchGoogleSearchResults(selectedCoin.symbol || selectedCoin.name || selectedCoin.id);
        if (!active) return;
        CACHE.set(cacheKey, data);
        setResults(data);
      } catch {
        if (!active) return;
        setError('Search results unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [cacheKey, selectedCoin]);

  if (!selectedCoin) return null;

  const topResults = Array.isArray(results?.top_results) ? results.top_results : [];

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
      <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Search className="w-40 h-40 text-cyan" />
      </div>

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border bg-cyan/10 border-cyan/20">
            <Search className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Google Search</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">SerpAPI search pulse</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-muted tracking-tighter uppercase">
            {loading ? 'Loading' : `${topResults.length} Results`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="loader mb-6 scale-75"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted animate-pulse">Fetching Search Results...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red/20 bg-red/10 p-4">
          <p className="text-sm font-semibold text-red">{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted font-black">Query</p>
            </div>
            <p className="text-sm text-white font-semibold leading-relaxed">
              {results?.query || `${selectedCoin.symbol || selectedCoin.name} crypto meme coin news`}
            </p>
          </div>

          <div className="space-y-3">
            {topResults.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-muted">No search results available.</p>
              </div>
            ) : (
              topResults.slice(0, 3).map((item) => (
                <motion.a
                  key={`${item.position}-${item.title}`}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2 }}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-cyan font-black mb-1">
                        {item.source || 'Google'}
                      </p>
                      <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {item.snippet || 'No snippet available.'}
                      </p>
                    </div>
                    <ExternalLink className={cn('w-4 h-4 shrink-0 text-muted', item.link === '#' && 'opacity-40')} />
                  </div>
                </motion.a>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
