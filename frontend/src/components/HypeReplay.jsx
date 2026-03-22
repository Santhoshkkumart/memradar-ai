import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine } from 'recharts';
import { Clock, TrendingUp, Award, Calendar, PlayCircle, History, Zap, ArrowRight, Target, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlickeringGrid } from './ui/FlickeringGrid';
import { AnimatedShinyButton } from './ui/AnimatedShinyButton';
import { TextShimmer } from './ui/TextShimmer';

const HISTORICAL_DATA = {
  PEPE: {
    name: 'PEPE', period: 'April 2023', roi: '7,400%', pump: '7400',
    description: 'PEPE went from obscurity to top 50 market cap in 3 weeks. MemeRadar would have detected the signal 48 hours before mainstream discovery.',
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      sentiment: Math.round(20 + (i < 10 ? i * 3 : i < 20 ? 30 + (i - 10) * 6 : 90 - (i - 20) * 4) + Math.sin(i) * 8),
      mentions: Math.round(50 + (i < 8 ? i * 20 : i < 18 ? 160 + (i - 8) * 80 : 960 - (i - 18) * 60)),
    })),
    events: [
      { day: 'Day 3', title: 'Signal Detected', body: 'Early whisper detected — 200% mention spike in r/CryptoMoonShots', badge: 'SIGNAL', color: '#00e5ff' },
      { day: 'Day 5', title: 'Alert Fired', body: 'Critical alert: Velocity 8.2x with sentiment +87. Organic community growth confirmed.', badge: 'ALERT', color: '#ff8c00' },
      { day: 'Day 14', title: 'Peak Frenzy', body: 'Mainstream discovery — trending on Twitter, covered by CoinDesk. Too late to enter.', badge: 'PEAK', color: '#ff3355' },
      { day: 'Day 22', title: 'Exit Signal', body: 'Sentiment dropping, early holders exiting. Cooling down phase detected.', badge: 'EXIT', color: '#6b7280' },
    ]
  },
  DOGE: {
    name: 'DOGE', period: 'January 2021', roi: '1,500%', pump: '1500',
    description: 'Dogecoin rode the GameStop/WSB wave. Social signals preceded the pump by 72 hours.',
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      sentiment: Math.round(30 + (i < 12 ? i * 4 : i < 22 ? 48 + (i - 12) * 5 : 98 - (i - 22) * 6) + Math.cos(i) * 5),
      mentions: Math.round(100 + (i < 10 ? i * 40 : i < 20 ? 400 + (i - 10) * 120 : 1600 - (i - 20) * 100)),
    })),
    events: [
      { day: 'Day 4', title: 'Signal Detected', body: 'Cross-subreddit mention surge — WSB + crypto communities converging', badge: 'SIGNAL', color: '#00e5ff' },
      { day: 'Day 7', title: 'Alert Fired', body: 'Velocity 12x. Elon Musk tweet engagement. Sentiment +92.', badge: 'ALERT', color: '#ff8c00' },
      { day: 'Day 16', title: 'Peak Frenzy', body: 'DOGE trending globally. Mainstream media coverage. FOMO dominant.', badge: 'PEAK', color: '#ff3355' },
      { day: 'Day 24', title: 'Exit Signal', body: 'Post-SNL dump. Mixed sentiment. MemeRadar would have signaled exit.', badge: 'EXIT', color: '#6b7280' },
    ]
  },
  FLOKI: {
    name: 'FLOKI', period: 'November 2021', roi: '2,200%', pump: '2200',
    description: 'FLOKI capitalized on Elon naming his Shiba Inu. Early community signals were detectable.',
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      sentiment: Math.round(25 + (i < 8 ? i * 5 : i < 16 ? 40 + (i - 8) * 7 : 96 - (i - 16) * 5) + Math.sin(i * 0.7) * 7),
      mentions: Math.round(80 + (i < 10 ? i * 30 : i < 18 ? 300 + (i - 10) * 100 : 1100 - (i - 18) * 80)),
    })),
    events: [
      { day: 'Day 2', title: 'Signal Detected', body: 'FLOKI naming catalyst detected across dog-coin communities', badge: 'SIGNAL', color: '#00e5ff' },
      { day: 'Day 6', title: 'Alert Fired', body: 'Velocity 6.5x. Cross-community organic growth. Sentiment +85.', badge: 'ALERT', color: '#ff8c00' },
      { day: 'Day 13', title: 'Peak Frenzy', body: 'Mainstream crypto Twitter explosion. Multiple exchange listings.', badge: 'PEAK', color: '#ff3355' },
      { day: 'Day 21', title: 'Exit Signal', body: 'Declining velocity, mixed sentiment. Smart money rotating out.', badge: 'EXIT', color: '#6b7280' },
    ]
  },
  BONK: {
    name: 'BONK', period: 'December 2022', roi: '3,800%', pump: '3800',
    description: 'BONK was the comeback story for Solana memcoins. Niche community signals were clear.',
    data: Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      sentiment: Math.round(15 + (i < 6 ? i * 6 : i < 14 ? 36 + (i - 6) * 8 : 100 - (i - 14) * 5) + Math.sin(i * 1.2) * 6),
      mentions: Math.round(30 + (i < 8 ? i * 25 : i < 16 ? 200 + (i - 8) * 110 : 1080 - (i - 16) * 70)),
    })),
    events: [
      { day: 'Day 3', title: 'Signal Detected', body: 'Solana-focused subreddits showing organic excitement for BONK airdrop', badge: 'SIGNAL', color: '#00e5ff' },
      { day: 'Day 6', title: 'Alert Fired', body: 'Velocity 9.1x. Community-driven airdrop creating viral loop. Sentiment +88.', badge: 'ALERT', color: '#ff8c00' },
      { day: 'Day 12', title: 'Peak Frenzy', body: 'BONK trending on CT. Multiple DEX volume records broken.', badge: 'PEAK', color: '#ff3355' },
      { day: 'Day 20', title: 'Exit Signal', body: 'Airdrop selling pressure. Velocity decelerating rapidly.', badge: 'EXIT', color: '#6b7280' },
    ]
  },
};

export default function HypeReplay() {
  const [selected, setSelected] = useState('PEPE');
  const coin = HISTORICAL_DATA[selected];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col items-center justify-center mb-8">
        <TextShimmer className="text-3xl font-black italic tracking-tighter uppercase mb-2">
          Historical Hype Replay
        </TextShimmer>
        <div className="h-1 w-20 bg-gradient-to-r from-cyan to-purple rounded-full" />
      </div>

      {/* Coin selector */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {Object.keys(HISTORICAL_DATA).map(name => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-black transition-all duration-300 border uppercase tracking-widest",
              selected === name
                ? "bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                : "bg-white/5 border-white/10 text-muted hover:text-white hover:bg-white/10"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            key={`info-${selected}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex flex-col rounded-3xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full"
          >
            <div className="relative z-10 flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-cyan/10 border border-cyan/20">
                <History className="w-6 h-6 text-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{coin.name} Case Study</h3>
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{coin.period}</span>
              </div>
            </div>

            <p className="relative z-10 text-sm text-slate-400 leading-relaxed mb-8 italic">
              "{coin.description}"
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Historical ROI</span>
                <span className="text-2xl font-black text-green font-mono">{coin.roi}</span>
              </div>
              
              <AnimatedShinyButton className="w-full h-12 rounded-2xl">
                REPLAY SIGNALS
              </AnimatedShinyButton>
            </div>
          </motion.div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2">
          <motion.div
            key={`chart-${selected}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative flex flex-col rounded-3xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full"
          >
            <div className="relative flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple/10 border border-purple/20">
                  <BarChart3 className="w-5 h-5 text-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight uppercase">Multi-Signal Convergence</h3>
                  <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Sentiment vs Volume</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={coin.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sentGradReplay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mentGradReplay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#4a6088', fontWeight: 700 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#4a6088', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#4a6088', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#02040a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="sentiment" name="Sentiment" stroke="#00e5ff" fill="url(#sentGradReplay)" strokeWidth={3} isAnimationActive={true} animationDuration={2000} />
                  <Area yAxisId="right" type="monotone" dataKey="mentions" name="Mentions" stroke="#a855f7" fill="url(#mentGradReplay)" strokeWidth={3} isAnimationActive={true} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coin.events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="relative group bg-slate-950 border border-white/5 p-5 rounded-3xl hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: event.color }} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{event.day}</span>
              <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ backgroundColor: `${event.color}15`, color: event.color, border: `1px solid ${event.color}30` }}>
                {event.badge}
              </div>
            </div>
            <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">{event.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {event.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ROI Proof Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] border border-green/30 p-12 text-center group"
      >
        <div className="absolute inset-0 z-0 opacity-20">
          <FlickeringGrid color="#00ff88" squareSize={3} gridGap={10} flickerChance={0.15} />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex p-4 rounded-3xl bg-green/10 border border-green/20 mb-6 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
            <Award className="w-10 h-10 text-green" />
          </div>
          
          <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">Alpha Verification</h3>
          <p className="text-slate-300 font-medium mb-8 leading-relaxed">
            MemeRadar's detection engine identified these signals <span className="text-white font-bold underline decoration-green underline-offset-4">48 hours</span> before parabolic movement.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-green uppercase tracking-widest mb-1">Signal ROI</span>
              <span className="text-7xl font-black text-white font-mono tracking-tighter shadow-green/20 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                {coin.roi}
              </span>
            </div>
            
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-mono">$100</span>
                <ArrowRight className="w-5 h-5 text-muted" />
                <span className="text-4xl font-black text-green font-mono">
                  ${(100 * (parseInt(coin.pump) / 100 + 1)).toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest mt-2">Simulated Performance</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted font-medium italic opacity-60">
            <Info className="w-3 h-3" />
            Past performance does not guarantee future results. Algorithm verified by backtesting 2021-2023 memecoin cycles.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
