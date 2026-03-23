import React from 'react';
import { Radar, Volume2, VolumeX, Bell, BellOff, SlidersHorizontal } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { TextShimmer } from './ui/TextShimmer';
import { AnimatedBadge } from './ui/AnimatedBadge';
import { cn } from '@/lib/utils';

export default function Header({ activeTab: activeTabProp, onTabChange }) {
  const {
    activeTab: storeActiveTab,
    setActiveTab,
    socialSource,
    setSocialSource,
    lastScanAt,
    lastScanCount,
    soundEnabled,
    toggleSound,
    notificationsMuted,
    toggleNotificationsMuted,
    alertSeverity,
    cycleAlertSeverity,
    liveFeedStatus,
    liveFeedProvider,
  } = useMemeStore();

  const activeTab = activeTabProp || storeActiveTab;
  const tabs = ['dashboard', 'replay', 'compare'];
  const tabLabels = { dashboard: 'Dashboard', replay: 'Hype Replay', compare: 'Compare' };
  const sources = [
    { id: 'cryptopanic', label: 'CryptoPanic' },
    { id: 'lunarcrush', label: 'LunarCrush' },
    { id: 'youtube', label: 'YouTube' },
  ];
  const sourceLabels = { cryptopanic: 'CryptoPanic', lunarcrush: 'LunarCrush', youtube: 'YouTube' };
  const sourceLabel = sourceLabels[socialSource] || 'CryptoPanic';
  const sourceUnit = socialSource === 'youtube' ? 'clips' : socialSource === 'lunarcrush' ? 'metrics' : 'articles';
  const statusLabel = liveFeedStatus === 'connected'
    ? 'Live connected'
    : liveFeedStatus === 'reconnecting'
      ? 'Reconnecting'
      : 'Fallback polling';
  const statusTone = liveFeedStatus === 'connected'
    ? 'text-green border-green/20 bg-green/10'
    : liveFeedStatus === 'reconnecting'
      ? 'text-orange border-orange/20 bg-orange/10'
      : 'text-muted border-white/10 bg-white/5';

  const formatAge = (timestamp) => {
    if (!timestamp) return 'just now';
    const diffMs = Date.now() - timestamp;
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-bg/90 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-5 h-14">
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

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl border border-border/30 bg-surface/40">
            {sources.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => setSocialSource(source.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  socialSource === source.id
                    ? "bg-cyan/10 text-cyan border border-cyan/20"
                    : "text-muted hover:text-white hover:bg-white/5"
                )}
              >
                {source.label}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex flex-col items-end mr-2">
            <span className="text-[10px] text-muted font-mono uppercase">Live Feed</span>
            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", statusTone)}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", liveFeedStatus === 'connected' ? 'bg-green' : liveFeedStatus === 'reconnecting' ? 'bg-orange' : 'bg-muted')} />
              {statusLabel}
              {liveFeedProvider ? <span className="opacity-70">| {liveFeedProvider}</span> : null}
            </span>
            <span className="text-[10px] text-muted font-mono uppercase mt-1">
              {sourceLabel} | {lastScanCount} {sourceUnit} | {formatAge(lastScanAt)}
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-muted font-mono uppercase">Global Mood</span>
            <span className="text-xs font-bold text-green">EXTREME GREED</span>
          </div>

          <button
            onClick={toggleNotificationsMuted}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              notificationsMuted
                ? "bg-orange/10 border-orange/30 text-orange"
                : "bg-surface border-border text-muted hover:text-orange hover:border-orange/30"
            )}
            title="Mute notifications"
          >
            {notificationsMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>

          <button
            onClick={cycleAlertSeverity}
            className={cn(
              "px-3 py-2 rounded-xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest",
              alertSeverity === 'critical'
                ? "bg-red/10 border-red/30 text-red"
                : alertSeverity === 'alert'
                  ? "bg-orange/10 border-orange/30 text-orange"
                  : alertSeverity === 'caution'
                    ? "bg-yellow/10 border-yellow/30 text-yellow"
                    : alertSeverity === 'watch'
                      ? "bg-cyan/10 border-cyan/30 text-cyan"
                      : "bg-surface border-border text-muted hover:text-white hover:border-white/20"
            )}
            title="Cycle alert severity"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {alertSeverity === 'all' ? 'All Alerts' : `${alertSeverity}+`}
            </span>
          </button>

          <button
            onClick={toggleSound}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              soundEnabled
                ? "bg-cyan/10 border-cyan/30 text-cyan"
                : "bg-surface border-border text-muted hover:text-cyan hover:border-cyan/30"
            )}
            title="Toggle alert sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
