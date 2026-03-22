import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Gauge, ShieldAlert } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';

export default function StatStrip() {
  const { sentiment, velocity, hypeStage } = useMemeStore();

  const spikePercent = velocity ? Math.round(velocity.velocity_ratio * 100) : 0;
  const sentScore = sentiment?.sentiment_score || 0;
  const velRatio = velocity?.velocity_ratio || 0;
  const botRisk = sentiment?.coordinated_flag ? 'HIGH' : 'LOW';

  const stats = [
    {
      label: 'Mention Spike',
      value: `${spikePercent}%`,
      subtitle: `${velocity?.recent_count || 0} posts / 6hrs`,
      color: 'from-cyan/50 to-blue-500/50',
      icon: TrendingUp,
      status: 'Live',
      statusColor: 'text-cyan bg-cyan/10'
    },
    {
      label: 'Sentiment Score',
      value: sentScore > 0 ? `+${sentScore}` : `${sentScore}`,
      subtitle: sentiment?.primary_emotion || '—',
      color: sentScore > 0 ? 'from-green/50 to-emerald-500/50' : 'from-red/50 to-rose-500/50',
      icon: Brain,
      status: 'AI Analyzed',
      statusColor: 'text-purple bg-purple/10'
    },
    {
      label: 'Hype Velocity',
      value: `${velRatio.toFixed(1)}x`,
      subtitle: hypeStage?.velocity_trend || 'stable',
      color: 'from-orange/50 to-amber-500/50',
      icon: Gauge,
      status: 'Trending',
      statusColor: 'text-orange bg-orange/10'
    },
    {
      label: 'Bot Risk',
      value: botRisk,
      subtitle: sentiment?.confidence ? `${sentiment.confidence}% conf.` : '—',
      color: botRisk === 'LOW' ? 'from-purple/50 to-indigo-500/50' : 'from-red/50 to-rose-500/50',
      icon: ShieldAlert,
      status: 'Security',
      statusColor: 'text-yellow bg-yellow/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative flex flex-col rounded-xl bg-slate-950 p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan/10 overflow-hidden"
          >
            {/* Animated Gradient Border */}
            <div
              className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-r opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40",
                stat.color
              )}
            />
            <div className="absolute inset-px rounded-[11px] bg-slate-950/90 backdrop-blur-sm" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br",
                      stat.color
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">{stat.label}</h3>
                </div>

                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                    stat.statusColor
                  )}
                >
                  <span className={cn("h-1 w-1 rounded-full animate-pulse", stat.statusColor.replace('bg-', 'bg-').split(' ')[0])}></span>
                  {stat.status}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-2xl font-black text-white font-mono tracking-tighter">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400 capitalize">
                    {stat.subtitle}
                  </span>
                </div>
              </div>

              {/* Sparkline visualization for extra visual pop */}
              <div className="h-6 w-full flex items-end gap-0.5 opacity-30 group-hover:opacity-60 transition-opacity">
                {[40, 70, 45, 90, 65, 85, 50, 75, 40, 60].map((h, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                    className={cn("flex-1 rounded-t-sm", stat.color.split(' ')[0].replace('from-', 'bg-'))}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
