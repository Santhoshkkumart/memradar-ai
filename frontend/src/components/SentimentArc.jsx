import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';
import { Activity, BarChart2 } from 'lucide-react';

export default function SentimentArc() {
  const { sentiment, velocity } = useMemeStore();
  const [timeRange, setTimeRange] = useState('24H');

  const data = useMemo(() => {
    const sentScore = sentiment?.sentiment_score || 50;
    const velRatio = velocity?.velocity_ratio || 2;
    const points = timeRange === '6H' ? 12 : timeRange === '12H' ? 24 : 48;
    const generated = [];

    for (let i = 0; i < points; i++) {
      const progress = i / points;
      // More dynamic generation
      const baseValue = sentScore * (0.4 + progress * 0.6);
      const noise = (Math.sin(i * 0.5) * 20 + Math.cos(i * 1.1) * 15) * (velRatio * 0.4);
      const value = Math.round(Math.max(-100, Math.min(100, baseValue + noise)));

      const minutesAgo = Math.round((points - i) * (timeRange === '6H' ? 30 : timeRange === '12H' ? 30 : 30));
      const label = minutesAgo >= 60 
        ? `${Math.floor(minutesAgo / 60)}h ago` 
        : `${minutesAgo}m ago`;

      generated.push({
        time: label,
        sentiment: value,
        bullish: value > 0 ? value : 0,
        bearish: value < 0 ? value : 0,
      });
    }
    return generated;
  }, [sentiment, velocity, timeRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0]?.payload?.sentiment;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">{payload[0]?.payload?.time}</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", val > 0 ? "bg-green" : "bg-red")} />
            <p className={cn("text-lg font-black font-mono tracking-tighter", val > 0 ? "text-green" : "text-red")}>
              {val > 0 ? '+' : ''}{val}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-medium mt-1">Social Signal Strength</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Activity className="w-24 h-24 text-cyan" />
      </div>

      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green/10 border border-green/20">
            <BarChart2 className="w-5 h-5 text-green" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Sentiment Trajectory</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Real-time Velocity</span>
          </div>
        </div>

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {['6H', '12H', '24H'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 text-[10px] rounded-lg font-black transition-all duration-300 tracking-tighter",
                timeRange === range
                  ? "bg-green/20 text-green shadow-[0_0_15px_rgba(0,255,136,0.1)] border border-green/30"
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="bullishGradFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bearishGradFull" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#ff3355" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ff3355" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: '#4a6088', fontWeight: 700 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
              interval="preserveStartEnd"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              domain={[-100, 100]}
              tick={{ fontSize: 9, fill: '#4a6088', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="bullish"
              stroke="#00ff88"
              fill="url(#bullishGradFull)"
              strokeWidth={3}
              isAnimationActive={true}
              animationDuration={1500}
              dot={false}
              activeDot={{ r: 4, stroke: '#00ff88', strokeWidth: 2, fill: '#02040a' }}
            />
            <Area
              type="monotone"
              dataKey="bearish"
              stroke="#ff3355"
              fill="url(#bearishGradFull)"
              strokeWidth={3}
              isAnimationActive={true}
              animationDuration={1500}
              dot={false}
              activeDot={{ r: 4, stroke: '#ff3355', strokeWidth: 2, fill: '#02040a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Bullish Pressure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_8px_rgba(255,51,85,0.6)]" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Bearish Resistance</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-muted/50 italic">
          Updated: Just Now
        </div>
      </div>
    </div>
  );
}
