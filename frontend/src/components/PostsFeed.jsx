import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, MessageCircle, ArrowBigUp, ExternalLink, Globe } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';

export default function PostsFeed() {
  const { posts, loading, selectedCoin } = useMemeStore();

  const formatTime = (utc) => {
    if (!utc) return '';
    const diff = Math.floor((Date.now() / 1000) - utc);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getSentimentPill = (title) => {
    const lower = title.toLowerCase();
    const bullishKeywords = ['🚀', 'bullish', 'huge', 'moon', 'pump', '100x', 'partnership', 'buy', 'gem', 'lfg'];
    const bearishKeywords = ['warning', 'sell', 'dead', 'scam', 'bearish', 'rug', 'dump', 'avoid'];
    
    if (bullishKeywords.some(kw => lower.includes(kw)))
      return { label: 'Bullish', color: 'text-green bg-green/10 border-green/30' };
    if (bearishKeywords.some(kw => lower.includes(kw)))
      return { label: 'Bearish', color: 'text-red bg-red/10 border-red/30' };
    return { label: 'Neutral', color: 'text-muted bg-white/5 border-white/10' };
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Globe className="w-40 h-40 text-orange" />
      </div>

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange/10 border border-orange/20">
            <MessageSquare className="w-5 h-5 text-orange" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Social Pulse</h3>
            <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Global Aggregate</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-[10px] font-black text-muted tracking-tighter uppercase">{posts.length} Signals Captured</span>
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
            const pill = getSentimentPill(post.title);
            return (
              <motion.div
                key={`post-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group/card bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Reddit icon/badge */}
                  <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 transition-transform">
                    <img 
                      src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png" 
                      alt="reddit" 
                      className="w-6 h-6 rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-orange uppercase tracking-tighter">r/{post.subreddit}</span>
                      <span className="text-[10px] text-muted">·</span>
                      <span className="text-[10px] text-muted font-medium">{formatTime(post.created_utc)}</span>
                      
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
                      <div className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black font-mono">{post.num_comments}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted hover:text-white transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black font-mono">Share</span>
                      </div>
                      
                      <a 
                        href={`https://reddit.com${post.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-cyan/10 hover:text-cyan transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
