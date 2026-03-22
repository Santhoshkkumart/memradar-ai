import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMemeStore from '../store/useMemeStore';
import CoinList from './CoinList';
import StatStrip from './StatStrip';
import SentimentArc from './SentimentArc';
import HypeStageBar from './HypeStageBar';
import MoonshotCard from './MoonshotCard';
import PredictionCard from './PredictionCard';
import AlertFeed from './AlertFeed';
import FearGreedGauge from './FearGreedGauge';
import PostsFeed from './PostsFeed';
import { getStageLabel, getStageColor } from '../utils/hypeScore';
import { ChevronRight, BarChart3, Brain, MessageSquare, Radar } from 'lucide-react';
import { Radar as RadarEffect } from './ui/RadarEffect';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { selectedCoin, sentiment, hypeStage, loading } = useMemeStore();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analysis', label: 'AI Analysis', icon: Brain },
    { id: 'social', label: 'Social Feed', icon: MessageSquare },
  ];

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Sidebar — Coin Rankings */}
      <div className="w-[300px] flex-shrink-0 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden hidden lg:flex flex-col shadow-2xl">
        <CoinList />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {selectedCoin ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Coin header — Enhanced */}
            <motion.div
              key={selectedCoin.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={selectedCoin.thumb}
                    alt={selectedCoin.name}
                    className="w-14 h-14 rounded-2xl bg-white/5 p-1 border border-white/10 shadow-2xl"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green w-4 h-4 rounded-full border-4 border-bg animate-pulse" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-white tracking-tighter">
                      {selectedCoin.name}
                    </h2>
                    <span className="text-xs font-mono text-muted bg-white/5 px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest">{selectedCoin.symbol}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black font-mono text-white">
                        ${selectedCoin.price_usd
                          ? (selectedCoin.price_usd < 0.01
                            ? selectedCoin.price_usd.toExponential(2)
                            : selectedCoin.price_usd.toFixed(selectedCoin.price_usd < 1 ? 4 : 2))
                          : '—'}
                      </span>
                      <span className={cn(
                        "text-xs font-black font-mono",
                        (selectedCoin.change_24h || 0) >= 0 ? 'text-green' : 'text-red'
                      )}>
                        {selectedCoin.change_24h ? `${selectedCoin.change_24h > 0 ? '+' : ''}${selectedCoin.change_24h.toFixed(1)}%` : '0.0%'}
                      </span>
                    </div>
                    
                    <div className="h-4 w-px bg-white/10" />
                    
                    {hypeStage && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Hype Status:</span>
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase border tracking-tighter"
                          style={{
                            color: getStageColor(hypeStage.hype_stage),
                            borderColor: `${getStageColor(hypeStage.hype_stage)}40`,
                            backgroundColor: `${getStageColor(hypeStage.hype_stage)}10`,
                            boxShadow: `0 0 15px ${getStageColor(hypeStage.hype_stage)}20`
                          }}>
                          {getStageLabel(hypeStage.hype_stage)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Market Cap Rank</span>
                <span className="text-2xl font-black text-white font-mono tracking-tighter">#{selectedCoin.market_cap_rank || '???'}</span>
              </div>
            </motion.div>

            {/* Section tabs — Floating style */}
            <div className="sticky top-0 z-30 py-2 bg-bg/80 backdrop-blur-md">
              <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-[20px] border border-white/10 w-fit">
                {sections.map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 text-xs font-black rounded-[14px] transition-all duration-300 uppercase tracking-widest",
                        activeSection === s.id
                          ? "bg-cyan text-slate-950 shadow-[0_0_25px_rgba(0,229,255,0.3)]"
                          : "text-muted hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section content */}
            <div className="pb-20">
              <AnimatePresence mode="wait">
                {activeSection === 'overview' && (
                  <motion.div 
                    key="overview" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      <div className="lg:col-span-3">
                        <MoonshotCard />
                      </div>
                      <div className="lg:col-span-2">
                        <FearGreedGauge />
                      </div>
                    </div>
                    <StatStrip />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <HypeStageBar />
                      <SentimentArc />
                    </div>
                  </motion.div>
                )}

                {activeSection === 'analysis' && (
                  <motion.div 
                    key="analysis" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <PredictionCard />
                      <AlertFeed />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <HypeStageBar />
                      <SentimentArc />
                    </div>
                  </motion.div>
                )}

                {activeSection === 'social' && (
                  <motion.div 
                    key="social" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <PostsFeed />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-12">
              <RadarEffect className="w-64 h-64 opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Radar className="w-12 h-12 text-cyan animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em] mb-3">Initializing Radar</h2>
              <p className="text-muted text-sm font-mono animate-pulse">Scanning Social Clusters for High-Alpha Signals...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
