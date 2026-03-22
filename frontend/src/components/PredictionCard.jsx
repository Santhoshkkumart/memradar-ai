import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowUpRight, ArrowDownRight, ArrowRight, AlertTriangle, Zap, Cpu } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { getDirectionColor } from '../utils/hypeScore';
import { cn } from '@/lib/utils';
import { AnimatedShinyButton } from './ui/AnimatedShinyButton';

export default function PredictionCard() {
  const { prediction, loading, selectedCoin } = useMemeStore();

  if (loading.prediction || !prediction) {
    return (
      <div className="group relative flex flex-col rounded-xl bg-slate-950 p-6 shadow-2xl border border-border/50 overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-purple/5 opacity-50" />
        <div className="relative flex flex-col items-center justify-center py-12">
          <div className="loader mb-6 scale-75"></div>
          <p className="text-muted text-xs font-mono animate-pulse uppercase tracking-widest">AI Calculating Alpha...</p>
        </div>
      </div>
    );
  }

  const direction = prediction.direction || 'sideways';
  const dirColor = getDirectionColor(direction);
  const confidence = prediction.confidence || 0;
  const DirIcon = direction === 'bullish' ? ArrowUpRight : direction === 'bearish' ? ArrowDownRight : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full"
    >
      {/* Background Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: dirColor }}
      />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan/10 border border-cyan/20">
            <Cpu className="w-5 h-5 text-cyan animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Movement Engine</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Llama-3 Intelligence</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30">
          <span className="text-[10px] font-black text-cyan tracking-tighter">PREDICTION v2.0</span>
        </div>
      </div>

      {/* Direction & Confidence */}
      <div className="relative grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:border-white/20 transition-all duration-300">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Bias</p>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${dirColor}22` }}>
              <DirIcon className="w-5 h-5" style={{ color: dirColor }} />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter" style={{ color: dirColor }}>
              {direction}
            </span>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:border-white/20 transition-all duration-300">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Confidence</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-mono tracking-tighter" style={{ color: dirColor }}>
              {confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="relative h-2 bg-white/5 rounded-full mb-6 overflow-hidden p-0.5 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full rounded-full relative"
          style={{ backgroundColor: dirColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      {/* Analysis */}
      <div className="relative space-y-4 mb-6">
        <div>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan" /> Catalyst Detected
          </p>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {prediction.catalyst}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">AI Summary</p>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            "{prediction.prediction_summary}"
          </p>
        </div>
      </div>

      {/* Risk Alert */}
      <div className="relative mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 bg-red/5 border border-red/20 rounded-2xl p-4">
          <AlertTriangle className="w-8 h-8 text-red/60" />
          <div>
            <p className="text-[10px] text-red font-black uppercase tracking-widest mb-0.5">Risk Exposure</p>
            <p className="text-[11px] text-red/80 font-medium line-clamp-2">
              {prediction.risk_factors?.[0] || 'Market volatility may invalidate current social trajectory.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <AnimatedShinyButton className="w-full h-12 rounded-xl text-base font-bold tracking-tight">
          EXECUTE STRATEGY
        </AnimatedShinyButton>
      </div>
    </motion.div>
  );
}
