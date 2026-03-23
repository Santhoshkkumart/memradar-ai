import React from 'react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';

export default function GoogleTrendsCard() {
  const trends = useMemeStore((state) => state.trends);

  if (!trends) {
    return (
      <div className="rounded-[12px] border border-border bg-surface p-[18px] mb-[18px] h-[180px] flex items-center justify-center">
        <div className="h-full w-full rounded-xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center">
          <p className="text-xs font-semibold text-muted">Loading trends data...</p>
        </div>
      </div>
    );
  }

  const countries = Array.isArray(trends.top_countries) ? trends.top_countries.slice(0, 5) : [];
  const queries = Array.isArray(trends.related_queries) ? trends.related_queries : [];
  const isRising = Boolean(trends.rising);
  const scoreTone = isRising ? 'text-green' : 'text-red';
  const barTone = isRising ? 'bg-green' : 'bg-red';

  return (
    <div className="rounded-[12px] border border-border bg-surface p-[18px] mb-[18px] shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted font-black">GOOGLE TRENDS</p>
        </div>
        {trends.breakout ? (
          <span className="inline-flex items-center rounded-full border border-orange/30 bg-orange/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange">
            BREAKOUT
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="min-w-[96px]">
          <div className={cn('text-[36px] leading-none font-black font-mono', scoreTone)}>
            {trends.current_score ?? 0}
          </div>
          <p className="mt-1 text-[11px] text-muted uppercase tracking-widest">search score</p>
        </div>

        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-bg2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-1000 ease-out', barTone)}
              style={{ width: `${Math.max(0, Math.min(100, trends.current_score || 0))}%` }}
            />
          </div>
          <p className={cn('mt-2 text-[12px] font-semibold', scoreTone)}>
            {isRising ? '↑ Rising fast' : '↓ Declining'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted font-black mb-2">Top Countries Searching</p>
        {countries.length === 0 ? (
          <p className="text-sm text-muted">No data available</p>
        ) : (
          <div className="space-y-2">
            {countries.map((item) => {
              const width = Math.max(0, Math.min(100, item.score || 0));
              return (
                <div key={`${item.country}-${item.score}`} className="flex items-center gap-2">
                  <div className="w-[120px] shrink-0 whitespace-nowrap text-[12px] text-white">
                    {item.country}
                  </div>
                  <div className="flex-1 h-[5px] rounded-full bg-bg2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan transition-all duration-1000 ease-out"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="w-[30px] text-right text-[12px] font-mono text-muted">
                    {item.score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted font-black mb-2">People also search</p>
        {queries.length === 0 ? (
          <p className="text-sm text-muted">No data available</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {queries.map((query) => (
              <span
                key={query}
                className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-[11px] text-muted"
              >
                {query}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] italic text-muted">
        Tracking: {trends.keyword_used}
      </p>
    </div>
  );
}
