import React from 'react';
import useMemeStore from '../store/useMemeStore';
import CoinCard from './CoinCard';
import { Flame, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CoinList() {
  const { coins, selectedCoin, selectCoin, loading } = useMemeStore();

  const sortedCoins = [...coins].sort((a, b) => (b.hypeScore || 0) - (a.hypeScore || 0));

  return (
    <div className="flex flex-col h-full bg-slate-950/20">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange/10 border border-orange/20 shadow-[0_0_15px_rgba(255,140,0,0.15)]">
            <Flame className="w-5 h-5 text-orange animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tighter">Hype Leaders</h2>
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest">Real-time Ranking</p>
          </div>
        </div>
        
        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-cyan font-mono">{coins.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {loading.coins ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="loader mb-6 scale-75"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted animate-pulse">Syncing Liquidity Pools...</p>
          </div>
        ) : sortedCoins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Info className="w-10 h-10 mb-3 text-muted" />
            <p className="text-xs font-bold text-muted uppercase tracking-widest leading-relaxed">
              No active signals detected<br/>Check network connection
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedCoins.map((coin, i) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                rank={i}
                isSelected={selectedCoin?.id === coin.id}
                onClick={() => selectCoin(coin)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-2 bg-cyan/5 border border-cyan/20 rounded-xl p-3">
          <TrendingUp className="w-4 h-4 text-cyan" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
            Sorting by <span className="text-cyan">MemeRadar Alpha Score</span> (Social Velocity + Sentiment)
          </p>
        </div>
      </div>
    </div>
  );
}
