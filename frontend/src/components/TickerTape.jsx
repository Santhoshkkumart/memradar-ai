import React from 'react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TickerTape() {
  const { coins } = useMemeStore();

  if (coins.length === 0) return null;

  // Multiple duplicates for extra long seamless scroll
  const tickerItems = [...coins, ...coins, ...coins, ...coins]; 

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-xl border-t border-white/10 h-10 overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex animate-ticker whitespace-nowrap items-center h-full hover:[animation-play-state:paused] cursor-default">
        {tickerItems.map((coin, i) => {
          const isUp = (coin.change_24h || 0) >= 0;
          return (
            <div key={`ticker-${i}-${coin.id}`} className="flex items-center gap-3 px-6 border-r border-white/5 group transition-colors hover:bg-white/5">
              <div className="relative">
                <img 
                  src={coin.thumb} 
                  alt="" 
                  className="w-5 h-5 rounded-lg bg-bg2 p-0.5 border border-white/10 group-hover:scale-110 transition-transform" 
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                {isUp && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green rounded-full blur-[2px]" />}
              </div>
              
              <div className="flex flex-col -space-y-1">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">{coin.symbol}</span>
                <span className="text-[9px] text-muted font-bold uppercase tracking-widest">Rank #{coin.market_cap_rank || '?'}</span>
              </div>

              <div className="flex flex-col items-end -space-y-1">
                <span className="text-xs font-black font-mono text-white tracking-tighter">
                  ${coin.price_usd ? (coin.price_usd < 0.01 ? coin.price_usd.toExponential(2) : coin.price_usd.toFixed(coin.price_usd < 1 ? 4 : 2)) : '—'}
                </span>
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-black font-mono",
                  isUp ? "text-green" : "text-red"
                )}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {coin.change_24h ? `${isUp ? '+' : ''}${coin.change_24h.toFixed(1)}%` : '0.0%'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
