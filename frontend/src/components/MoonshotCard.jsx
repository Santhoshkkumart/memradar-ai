import React from 'react';
import { motion } from 'framer-motion';
import useMemeStore from '../store/useMemeStore';
import { getMoonshotProbability, getPatternMatch } from '../utils/hypeScore';
import { Rocket, Zap, Info } from 'lucide-react';
import { FlickeringGrid } from './ui/FlickeringGrid';
import { cn } from '@/lib/utils';

export default function MoonshotCard() {
  const { sentiment, velocity, hypeStage, selectedCoin } = useMemeStore();

  const moonshotProb = getMoonshotProbability(sentiment, velocity, hypeStage);
  const pattern = getPatternMatch(hypeStage?.hype_stage, selectedCoin?.name);
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (moonshotProb / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple/30 p-6 h-full group"
      style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(88, 28, 135, 0.2), rgba(15, 26, 48, 0.95))'
      }}
    >
      {/* Subtle Flickering Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
        <FlickeringGrid 
          color="#a855f7" 
          squareSize={2} 
          gridGap={8} 
          flickerChance={0.1}
          maxOpacity={0.3}
        />
      </div>

      {/* MOONSHOT badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-purple/20 backdrop-blur-md border border-purple/40 rounded-full px-3 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Rocket className="w-4 h-4 text-purple animate-bounce" />
          <span className="text-purple text-[11px] font-black tracking-widest uppercase">Moonshot Active</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* SVG Arc Progress */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="10" />
            {/* Progress arc with gradient */}
            <motion.circle
              cx="80" cy="80" r="65"
              fill="none"
              stroke="url(#moonGradFull)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: 'circOut' }}
            />
            <defs>
              <linearGradient id="moonGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <span className="text-4xl font-black font-mono text-white tracking-tighter block leading-none">
                {moonshotProb}%
              </span>
              <span className="text-[10px] font-bold text-purple/80 uppercase tracking-widest mt-1 block">Alpha</span>
            </motion.div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <Zap className="w-5 h-5 text-yellow fill-yellow/20" />
            <h3 className="text-2xl font-black text-white tracking-tight">
              Moonshot Probability
            </h3>
          </div>
          
          <p className="text-sm text-slate-300 mb-4 leading-relaxed max-w-md">
            Our AI detected a <span className="text-purple font-bold">{moonshotProb}% correlation</span> with historical viral pumps. 
            High probability of significant upward movement within 48 hours.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
              <Info className="w-4 h-4 text-purple shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 font-medium">Pattern matched: </span>
                <span className="text-white font-bold tracking-tight">
                  {pattern.coin} Case ({pattern.match}% match)
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-1">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-surface2 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + (selectedCoin?.id || '')}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted font-medium italic">
                +1.2k traders watching this signal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
