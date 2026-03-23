import React from 'react';
import { motion } from 'framer-motion';
import { getStageColor, getStageLabel } from '../utils/hypeScore';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import TinySparkline from './ui/TinySparkline';

export default function CoinCard({ coin, rank, isSelected, onClick }) {
  const hypeScore = coin.hypeScore || 50;
  const stage = coin.hype_stage || 'building_momentum';
  const isUp = (coin.change_24h || 0) >= 0;
  const stageColor = getStageColor(stage);
  const sparklineColor = (coin.live_price_change_5m || 0) >= 0 ? '#22c55e' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer rounded-xl border transition-all duration-300 p-3 mb-2 overflow-hidden',
        isSelected
          ? 'border-cyan/50 bg-cyan/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
          : 'border-border/40 bg-surface/30 hover:border-border hover:bg-surface/60 hover:translate-x-1'
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent pointer-events-none" />
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <img
            src={coin.thumb}
            alt={coin.name}
            className="w-10 h-10 rounded-xl bg-bg2 p-1 border border-border/50 group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full border-2 border-bg animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-text truncate group-hover:text-cyan transition-colors">
              {coin.name}
              <span className="text-[10px] text-muted ml-1.5 font-mono uppercase tracking-tighter">{coin.symbol}</span>
            </h3>
            <div className="flex items-center gap-2">
              <TinySparkline values={coin.live_history || []} stroke={sparklineColor} className="opacity-80" />
              <span className="text-xs font-black text-text font-mono">
                ${coin.price_usd ? (coin.price_usd < 0.01 ? coin.price_usd.toExponential(1) : coin.price_usd.toFixed(coin.price_usd < 1 ? 4 : 2)) : '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest bg-bg2/80 border border-border/50"
                style={{ color: stageColor }}
              >
                {getStageLabel(stage)}
              </span>
              {stage === 'early_whisper' && (
                <Zap className="w-3 h-3 text-yellow animate-pulse" />
              )}
            </div>

            <div
              className={cn(
                'flex items-center gap-0.5 text-[10px] font-black font-mono',
                isUp ? 'text-green' : 'text-red'
              )}
            >
              {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {coin.change_24h ? `${isUp ? '+' : ''}${coin.change_24h.toFixed(1)}%` : '0.0%'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 relative h-1.5 bg-bg2 rounded-full overflow-hidden border border-border/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${hypeScore}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{
            backgroundColor: stageColor,
            boxShadow: `0 0 10px ${stageColor}44`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 p-1">
        <span className="text-[8px] font-mono text-muted/30">#{rank + 1}</span>
      </div>
    </motion.div>
  );
}
