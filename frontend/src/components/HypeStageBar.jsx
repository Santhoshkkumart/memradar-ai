import React from 'react';
import { motion } from 'framer-motion';
import useMemeStore from '../store/useMemeStore';
import { getStageIndex, getStageLabel, getStageColor } from '../utils/hypeScore';
import { cn } from '@/lib/utils';
import { Zap, Info, ArrowRight, Activity } from 'lucide-react';

const STAGES = ['early_whisper', 'building_momentum', 'peak_frenzy', 'cooling_down'];

export default function HypeStageBar() {
  const { hypeStage } = useMemeStore();
  const currentStage = hypeStage?.hype_stage || 'building_momentum';
  const confidence = hypeStage?.stage_confidence || 0;
  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity className="w-24 h-24 text-cyan" />
      </div>

      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan/10 border border-cyan/20">
            <Zap className="w-5 h-5 text-cyan animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Sentiment Lifecycle</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Hype Classification</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-cyan tracking-tighter">{confidence}% CONFIDENCE</span>
        </div>
      </div>

      <div className="relative flex gap-2 mb-6">
        {STAGES.map((stage, i) => {
          const isActive = i === currentIndex;
          const isPassed = i < currentIndex;
          const isUpcoming = i > currentIndex;
          const color = getStageColor(stage);

          return (
            <div key={stage} className="flex-1 flex flex-col gap-3">
              <div 
                className={cn(
                  "relative h-3 rounded-full overflow-hidden transition-all duration-500",
                  isActive ? "bg-white/10 ring-1" : "bg-white/5",
                  isActive && "ring-cyan/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                )}
                style={{ 
                  borderColor: isActive ? color : 'transparent',
                }}
              >
                {(isActive || isPassed) && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1.2, ease: "circOut", delay: i * 0.2 }}
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      backgroundColor: color,
                      opacity: isActive ? 1 : 0.3,
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    )}
                  </motion.div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest text-center transition-colors duration-300",
                  isActive ? "text-white" : "text-muted"
                )}>
                  {getStageLabel(stage).split(' ')[0]}
                </span>
                <span className={cn(
                  "text-[8px] font-bold text-center transition-colors duration-300",
                  isActive ? "text-cyan" : "text-muted/50"
                )}>
                  {getStageLabel(stage).split(' ')[1] || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Footer */}
      <div className="relative mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group/footer hover:bg-white/[0.08] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full animate-ping absolute opacity-50"
              style={{ backgroundColor: getStageColor(currentStage) }}
            />
            <div 
              className="w-3 h-3 rounded-full relative z-10"
              style={{ backgroundColor: getStageColor(currentStage) }}
            />
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Current Intelligence</p>
            <p className="text-xs font-bold text-slate-400 italic">
              {hypeStage?.signal || "Awaiting signal convergence..."}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted group-hover/footer:translate-x-1 group-hover/footer:text-cyan transition-all" />
      </div>
    </div>
  );
}
