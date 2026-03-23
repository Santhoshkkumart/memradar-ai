import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, MessageCircle, ArrowBigUp, ExternalLink, Globe, Youtube, Star, Users, BarChart3, TrendingUp } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';

export default function PostsFeed() {
  const { posts, loading, selectedCoin, socialSource, social } = useMemeStore();
  const isYouTube = socialSource === 'youtube';
  const isLunarCrush = socialSource === 'lunarcrush';
  const isCryptoPanic = socialSource === 'cryptopanic';

  const sourceLabel = isYouTube ? 'YouTube Pulse' : isLunarCrush ? 'LunarCrush Metrics' : 'News Pulse';
  const sourceSubtitle = isYouTube ? 'Video conversation stream' : isLunarCrush ? 'Social intelligence data' : 'Crypto news stream';
  const sourceCountLabel = isYouTube ? 'Clips Captured' : isLunarCrush ? 'Metrics Tracked' : 'Articles Found';

  const formatTime = (utc) => {
    if (!utc) return '';
    const timestamp = typeof utc === 'string' ? new Date(utc).getTime() / 1000 : utc;
    const diff = Math.floor((Date.now() / 1000) - timestamp);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getSentimentPill = (post) => {
    if (post.sentiment === 'bullish') return { label: 'Bullish', color: 'text-green bg-green/10 border-green/30' };
    if (post.sentiment === 'bearish') return { label: 'Bearish', color: 'text-red bg-red/10 border-red/30' };
    const lower = (post.title || '').toLowerCase();
    const bullishKeywords = ['🚀', 'bullish', 'huge', 'moon', 'pump', '100x', 'partnership', 'buy', 'gem', 'lfg', 'surges'];
    const bearishKeywords = ['warning', 'sell', 'dead', 'scam', 'bearish', 'rug', 'dump', 'avoid'];
    if (bullishKeywords.some(kw => lower.includes(kw)))
      return { label: 'Bullish', color: 'text-green bg-green/10 border-green/30' };
    if (bearishKeywords.some(kw => lower.includes(kw)))
      return { label: 'Bearish', color: 'text-red bg-red/10 border-red/30' };
    return { label: 'Neutral', color: 'text-muted bg-white/5 border-white/10' };
  };

  if (isLunarCrush) {
    const metrics = social || {};
    const metricCards = [
      { label: 'Galaxy Score', value: metrics.galaxy_score ?? '—', icon: Star, color: 'from-purple/50 to-indigo-500/50' },
      { label: 'Alt Rank', value: metrics.alt_rank ? `#${metrics.alt_rank}` : '—', icon: TrendingUp, color: 'from-cyan/50 to-blue-500/50' },
      { label: 'Social Volume (24h)', value: metrics.social_volume_24h?.toLocaleString() ?? '—', icon: BarChart3, color: 'from-green/50 to-emerald-500/50' },
      { label: 'Social Engagement', value: metrics.social_engagement_24h?.toLocaleString() ?? '—', icon: MessageSquare, color: 'from-orange/50 to-amber-500/50' },
      { label: 'Sentiment Score', value: metrics.sentiment_score ?? '—', icon: Star, color: 'from-pink-500/50 to-rose-500/50' },
      { label: 'Influencers Active', value: metrics.influencers_active ?? '—', icon: Users, color: 'from-violet-500/50 to-purple/50' },
      { label: 'Social Dominance', value: metrics.social_dominance ? `${metrics.social_dominance}%` : '—', icon: Globe, color: 'from-blue-500/50 to-cyan/50' },
    ];

    return (
      <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
        <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Star className="w-40 h-40 text-purple" />
        </div>

        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border bg-purple/10 border-purple/20">
              <Star className="w-5 h-5 text-purple" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">{sourceLabel}</h3>
              <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{sourceSubtitle}</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-black text-muted tracking-tighter uppercase">{metricCards.length} {sourceCountLabel}</span>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading.posts ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center">
              <div className="loader mb-6 scale-75"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted animate-pulse">Loading Social Data...</p>
            </div>
          ) : (
            metricCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="group/card relative flex flex-col rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br", card.color)}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{card.label}</span>
                  </div>
                  <p className="text-xl font-black text-white font-mono tracking-tighter">{card.value}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
      <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {isYouTube ? (
          <Youtube className="w-40 h-40 text-red-400" />
        ) : (
          <Globe className="w-40 h-40 text-[#1a6bff]" />
        )}
      </div>

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl border",
            isYouTube ? "bg-red-500/10 border-red-500/20" : "bg-[#1a6bff]/10 border-[#1a6bff]/20"
          )}>
            {isYouTube ? (
              <Youtube className="w-5 h-5 text-red-400" />
            ) : (
              <Globe className="w-5 h-5 text-[#1a6bff]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">{sourceLabel}</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">{sourceSubtitle}</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-muted tracking-tighter uppercase">{posts.length} {sourceCountLabel}</span>
        </div>
      </div>

      <div className="relative space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {loading.posts ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="loader mb-6 scale-75"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted animate-pulse">Scanning Social Clusters...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
            <MessageCircle className="w-12 h-12 mb-3 text-muted" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">No signals found for {selectedCoin?.name}</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const pill = getSentimentPill(post);
            const postSource = post.source || (isYouTube ? `@${post.channel || 'channel'}` : 'Unknown');
            const postTime = post.published_at || post.created_utc;
            return (
              <motion.div
                key={`post-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group/card bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 transition-transform",
                    isYouTube ? "bg-red-500/10 border-red-500/20" : "bg-[#1a6bff]/10 border-[#1a6bff]/20"
                  )}>
                    {isYouTube ? (
                      <Youtube className="w-6 h-6 text-red-400" />
                    ) : (
                      <Globe className="w-6 h-6 text-[#1a6bff]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tighter",
                        isYouTube ? "text-red-400" : "text-[#1a6bff]"
                      )}>
                        {postSource}
                      </span>
                      <span className="text-[10px] text-muted">·</span>
                      <span className="text-[10px] text-muted font-medium">{formatTime(postTime)}</span>

                      <div className={cn(
                        "ml-auto px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                        pill.color
                      )}>
                        {pill.label}
                      </div>
                    </div>

                    <p className="text-sm font-bold text-white leading-snug mb-3 group-hover/card:text-cyan transition-colors">
                      {post.title}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
                        <ArrowBigUp className="w-4 h-4" />
                        <span className="text-[10px] font-black font-mono">{post.score}</span>
                      </div>
                      {post.num_comments !== undefined && (
                        <div className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black font-mono">{post.num_comments}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black font-mono">Share</span>
                      </div>

                      {post.url && post.url !== '#' && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-cyan/10 hover:text-cyan transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
