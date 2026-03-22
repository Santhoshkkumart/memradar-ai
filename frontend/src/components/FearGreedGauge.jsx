import React from 'react';
import { motion } from 'framer-motion';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';
import { Gauge, TrendingUp, TrendingDown } from 'lucide-react';

export default function FearGreedGauge() {
  const { fearGreed } = useMemeStore();

  const value = parseInt(fearGreed?.value || 50);
  const classification = fearGreed?.value_classification || 'Neutral';

  // Gauge config
  const startAngle = 180;
  const endAngle = 360;
  const radius = 80;
  const cx = 100;
  const cy = 100;

  // Color zones
  const getColor = (val) => {
    if (val <= 25) return '#ff3355';
    if (val <= 50) return '#ff8c00';
    if (val <= 75) return '#ffd700';
    return '#00ff88';
  };

  const color = getColor(value);

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const currentAngle = startAngle + (value / 100) * (endAngle - startAngle);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
            <Gauge className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Market Sentiment</h3>
        </div>
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5",
          value > 50 ? "text-green" : "text-red"
        )}>
          {value > 50 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
          {value > 50 ? 'BULLISH' : 'BEARISH'}
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center pt-4">
        <svg width="200" height="120" viewBox="0 0 200 120" className="filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {/* Background Arc */}
          <path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Value Arc */}
          <motion.path
            d={describeArc(cx, cy, radius, startAngle, currentAngle)}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "circOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />

          {/* Scale Markers */}
          {[0, 25, 50, 75, 100].map((marker) => {
            const angle = startAngle + (marker / 100) * (endAngle - startAngle);
            const p1 = polarToCartesian(cx, cy, radius - 15, angle);
            const p2 = polarToCartesian(cx, cy, radius - 20, angle);
            return (
              <line
                key={marker}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Value Overlay */}
        <div className="absolute top-[65px] flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black font-mono tracking-tighter"
            style={{ color }}
          >
            {value}
          </motion.span>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full mt-1 border border-white/10"
          >
            {classification}
          </motion.span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
          <span className="text-[8px] text-muted font-bold uppercase mb-1">Yesterday</span>
          <span className="text-xs font-bold text-slate-300">{value - 5} (Fear)</span>
        </div>
        <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
          <span className="text-[8px] text-muted font-bold uppercase mb-1">Last Week</span>
          <span className="text-xs font-bold text-slate-300">{value + 12} (Greed)</span>
        </div>
      </div>
    </div>
  );
}
