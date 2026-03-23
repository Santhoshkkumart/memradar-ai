import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Trophy, Check, Zap, Cpu, BarChart3, TrendingUp, TrendingDown, Info } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { getMoonshotProbability, getStageLabel, getStageColor, getDirectionColor } from '../utils/hypeScore';
import { cn } from '@/lib/utils';
import { AnimatedShinyButton } from './ui/AnimatedShinyButton';
import { TextShimmer } from './ui/TextShimmer';
import { searchDexScreenerPairs } from '../api/client';

// Enhanced comparison data for demo
const COMPARE_DATA = {
  'pepe': { id: 'pepe', name: 'Pepe', symbol: 'PEPE', price: 0.0000089, change: 12.5, sentiment: 78, spike: 420, velocity: 4.2, moonshot: 72, stage: 'building_momentum', botRisk: 'Low', prediction: 'Strong FOMO wave driven by Elon engagement and volume explosion.', thumb: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg' },
  'dogecoin': { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.152, change: 5.3, sentiment: 72, spike: 280, velocity: 3.1, moonshot: 58, stage: 'building_momentum', botRisk: 'Low', prediction: 'X payment integration rumors sustaining bullish momentum across communities.', thumb: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png' },
  'floki-inu': { id: 'floki-inu', name: 'FLOKI', symbol: 'FLOKI', price: 0.000187, change: 28.7, sentiment: 91, spike: 601, velocity: 6.2, moonshot: 89, stage: 'early_whisper', botRisk: 'Low', prediction: 'Strongest social signal in 72 hours. Partnership catalyst driving organic growth.', thumb: 'https://assets.coingecko.com/coins/images/16746/standard/floki.png' },
  'shiba-inu': { id: 'shiba-inu', name: 'SHIB', symbol: 'SHIB', price: 0.0000198, change: -2.1, sentiment: 45, spike: 120, velocity: 1.5, moonshot: 25, stage: 'cooling_down', botRisk: 'Medium', prediction: 'Consolidation phase. Ecosystem development positive but insufficient for momentum.', thumb: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png' },
  'bonk': { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.0000234, change: 15.8, sentiment: 85, spike: 380, velocity: 4.5, moonshot: 78, stage: 'building_momentum', botRisk: 'Low', prediction: 'Solana memecoin leader with BONKbot volume exceeding $100M.', thumb: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.png' },
};

const METRICS = [
  { key: 'sentiment', label: 'Sentiment', format: (v) => v > 0 ? `+${v}` : v, color: 'text-green' },
  { key: 'spike', label: 'Spike', format: (v) => `${v}%`, color: 'text-cyan' },
  { key: 'velocity', label: 'Velocity', format: (v) => `${v}x`, color: 'text-orange' },
  { key: 'moonshot', label: 'Moonshot', format: (v) => `${v}%`, color: 'text-purple' },
];

export default function CoinCompare() {
  const coinOptions = Object.entries(COMPARE_DATA);
  const [leftId, setLeftId] = useState(coinOptions[0]?.[0] || '');
  const [rightId, setRightId] = useState(coinOptions[2]?.[0] || '');
  const [leftMarket, setLeftMarket] = useState(null);
  const [rightMarket, setRightMarket] = useState(null);

  const left = COMPARE_DATA[leftId];
  const right = COMPARE_DATA[rightId];

  useEffect(() => {
    let active = true;

    function pickBestPair(results, coin) {
      const list = Array.isArray(results) ? results : [];
      if (list.length === 0) return null;

      const symbol = String(coin?.symbol || '').toUpperCase();
      const name = String(coin?.name || '').toLowerCase();

      const scored = list.map((pair) => {
        const baseSymbol = String(pair?.baseToken?.symbol || '').toUpperCase();
        const baseName = String(pair?.baseToken?.name || '').toLowerCase();
        const exactMatch = baseSymbol === symbol || baseSymbol === name.toUpperCase() || baseName === name;
        const liquidity = Number(pair?.liquidity?.usd || 0);

        return { pair, exactMatch, liquidity };
      });

      const exact = scored
        .filter((entry) => entry.exactMatch)
        .sort((a, b) => b.liquidity - a.liquidity)[0]?.pair;

      if (exact) {
        return exact;
      }

      return scored.sort((a, b) => b.liquidity - a.liquidity)[0]?.pair || list[0] || null;
    }

    async function loadMarketData() {
      if (!left || !right) return;

      try {
        const [leftResult, rightResult] = await Promise.all([
          searchDexScreenerPairs(left.symbol || left.name),
          searchDexScreenerPairs(right.symbol || right.name),
        ]);

        if (!active) return;

        setLeftMarket(pickBestPair(leftResult.results, left));
        setRightMarket(pickBestPair(rightResult.results, right));
      } catch {
        if (!active) return;
        setLeftMarket(null);
        setRightMarket(null);
      }
    }

    loadMarketData();

    return () => {
      active = false;
    };
  }, [leftId, rightId]);

  if (!left || !right) return null;

  const getWinner = (key) => {
    const lv = left[key];
    const rv = right[key];
    if (lv > rv) return 'left';
    if (rv > lv) return 'right';
    return 'tie';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col items-center justify-center mb-8">
        <TextShimmer className="text-3xl font-black italic tracking-tighter uppercase mb-2">
          Intelligence Battle
        </TextShimmer>
        <div className="h-1 w-20 bg-gradient-to-r from-cyan to-purple rounded-full" />
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-6 justify-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <img src={left.thumb} className="w-8 h-8 rounded-lg" alt="" />
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan/50 appearance-none cursor-pointer hover:bg-white/5 transition-all"
          >
            {coinOptions.map(([id, data]) => (
              <option key={id} value={id}>{data.name}</option>
            ))}
          </select>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-cyan/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 p-3 rounded-full bg-cyan/10 border border-cyan/30 text-cyan">
            <ArrowLeftRight className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple/50 appearance-none cursor-pointer hover:bg-white/5 transition-all"
          >
            {coinOptions.map(([id, data]) => (
              <option key={id} value={id}>{data.name}</option>
            ))}
          </select>
          <img src={right.thumb} className="w-8 h-8 rounded-lg" alt="" />
        </div>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { data: left, market: leftMarket, side: 'left', color: 'cyan', gradient: 'from-cyan/20' },
          { data: right, market: rightMarket, side: 'right', color: 'purple', gradient: 'from-purple/20' }
        ].map(({ data, market, side, color, gradient }) => (
          <motion.div
            key={side}
            initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "group relative flex flex-col rounded-3xl bg-slate-950 p-8 shadow-2xl border border-border/30 overflow-hidden",
              side === 'left' ? "hover:shadow-cyan/5" : "hover:shadow-purple/5"
            )}
          >
            {/* Background Glow */}
            <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-10 pointer-events-none bg-gradient-to-br", gradient)} />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={data.thumb} className="w-12 h-12 rounded-2xl bg-white/5 p-1 border border-white/10" alt="" />
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{data.name}</h3>
                  <span className="text-xs font-mono text-muted uppercase tracking-widest">{data.symbol}</span>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                side === 'left' ? "bg-cyan/10 border-cyan/30 text-cyan" : "bg-purple/10 border-purple/30 text-purple"
              )}>
                {side === 'left' ? 'Challenger' : 'Defender'}
              </div>
            </div>

            <div className="relative z-10 mb-8">
              <div className="text-4xl font-black font-mono text-white tracking-tighter mb-1">
                ${data.price < 0.01 ? data.price.toExponential(2) : data.price.toFixed(data.price < 1 ? 4 : 2)}
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-black font-mono",
                data.change >= 0 ? "text-green" : "text-red"
              )}>
                {data.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {data.change >= 0 ? '+' : ''}{data.change}% (24h)
              </div>
            </div>

            <div className="relative z-10 space-y-4 mb-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">AI Pulse</p>
                <p className="text-sm font-bold text-white leading-relaxed line-clamp-2">
                  {data.prediction}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted font-bold uppercase mb-1">Hype Stage</p>
                  <span className="text-xs font-black uppercase tracking-tighter" style={{ color: getStageColor(data.stage) }}>
                    {getStageLabel(data.stage)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted font-bold uppercase mb-1">Bot Risk</p>
                  <span className={cn("text-xs font-black uppercase tracking-tighter", data.botRisk === 'Low' ? 'text-green' : 'text-red')}>
                    {data.botRisk} Detection
                  </span>
                </div>
              </div>

              {market && (
                <div className="p-4 rounded-2xl bg-cyan/5 border border-cyan/10">
                  <p className="text-[10px] text-cyan font-black uppercase tracking-widest mb-2">DEXScreener Snapshot</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted uppercase font-bold mb-1">Chain</div>
                      <div className="text-white font-black">{market.chainId || 'unknown'}</div>
                    </div>
                    <div>
                      <div className="text-muted uppercase font-bold mb-1">DEX</div>
                      <div className="text-white font-black">{market.dexId || 'unknown'}</div>
                    </div>
                    <div>
                      <div className="text-muted uppercase font-bold mb-1">Liquidity</div>
                      <div className="text-white font-black">${Math.round(market.liquidity?.usd || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted uppercase font-bold mb-1">FDV</div>
                      <div className="text-white font-black">${Math.round(market.fdv || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <AnimatedShinyButton className="w-full h-12 rounded-2xl">
              EXPLORE {data.symbol} ALPHA
            </AnimatedShinyButton>
          </motion.div>
        ))}
      </div>

      {/* Comparison Grid */}
      <div className="group relative flex flex-col rounded-3xl bg-slate-950 p-8 shadow-2xl border border-border/30 overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2.5 rounded-2xl bg-yellow/10 border border-yellow/20">
            <Trophy className="w-6 h-6 text-yellow animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">Comparative Analytics</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest text-yellow/80">Metric Superiority Protocol</span>
          </div>
        </div>

        <div className="space-y-6">
          {METRICS.map((metric, i) => {
            const winner = getWinner(metric.key);
            const lv = left[metric.key];
            const rv = right[metric.key];
            const total = lv + rv || 1;

            return (
              <motion.div 
                key={metric.key} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", winner === 'left' ? "text-cyan" : "text-muted")}>
                    {left.symbol}: {metric.format(lv)}
                  </span>
                  <span className="text-xs font-black text-white/50 tracking-tighter uppercase">{metric.label}</span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", winner === 'right' ? "text-purple" : "text-muted")}>
                    {right.symbol}: {metric.format(rv)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-white/5 p-0.5 border border-white/5 flex overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(lv / total) * 100}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-l-full relative",
                        winner === 'left' ? "bg-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "bg-white/10"
                      )}
                    >
                      {winner === 'left' && <div className="absolute inset-0 bg-white/30 animate-pulse" />}
                    </motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(rv / total) * 100}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={cn(
                        "h-full rounded-r-full relative",
                        winner === 'right' ? "bg-purple shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-white/10"
                      )}
                    >
                      {winner === 'right' && <div className="absolute inset-0 bg-white/30 animate-pulse" />}
                    </motion.div>
                  </div>
                  
                  <div className="w-8 flex justify-center">
                    {winner === 'left' ? (
                      <div className="w-6 h-6 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-cyan" />
                      </div>
                    ) : winner === 'right' ? (
                      <div className="w-6 h-6 rounded-lg bg-purple/10 border border-purple/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-purple" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
