import React from 'react';
import { Radar, Volume2, VolumeX } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { TextShimmer } from './ui/TextShimmer';
import { AnimatedBadge } from './ui/AnimatedBadge';
import { cn } from '@/lib/utils';

export default function Header({ activeTab: activeTabProp, onTabChange }) {
  const { activeTab: storeActiveTab, setActiveTab, soundEnabled, toggleSound } = useMemeStore();
  const activeTab = activeTabProp || storeActiveTab;
  const tabs = ['dashboard', 'replay', 'compare'];
  const tabLabels = { dashboard: 'Dashboard', replay: 'Hype Replay', compare: 'Compare' };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-bg/90 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-5 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radar className="w-6 h-6 text-cyan animate-pulse" />
            <div className="absolute inset-0 bg-cyan/20 blur-lg rounded-full animate-pulse-slow" />
          </div>
          
          <div className="flex flex-col -space-y-1">
            <h1 className="text-lg font-bold tracking-tight flex items-center">
              <span className="text-white">Meme</span>
              <TextShimmer 
                className="[--base-color:#22d3ee] [--base-gradient-color:#ecfeff] font-black italic"
                duration={1.5}
              >
                Radar
              </TextShimmer>
            </h1>
            <span className="text-[10px] text-muted font-mono tracking-widest uppercase">Social Intelligence</span>
          </div>

          <AnimatedBadge 
            text="LIVE" 
            color="#ff3355" 
            className="ml-2 py-0 h-5"
          />
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1.5 bg-surface/40 p-1 rounded-xl border border-border/30">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300",
                activeTab === tab
                  ? "bg-cyan/10 text-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)] border border-cyan/20"
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-muted font-mono uppercase">Global Mood</span>
            <span className="text-xs font-bold text-green">EXTREME GREED</span>
          </div>
          
          <button
            onClick={toggleSound}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              soundEnabled 
                ? "bg-cyan/10 border-cyan/30 text-cyan" 
                : "bg-surface border-border text-muted hover:text-cyan hover:border-cyan/30"
            )}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
