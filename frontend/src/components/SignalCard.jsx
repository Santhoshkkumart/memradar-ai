import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Share2, Users, Send } from 'lucide-react';
import useSignalStore from '../store/useSignalStore';
import { cn } from '@/lib/utils';

const TYPE_LABELS = {
  early_whisper: 'Early Whisper',
  sentiment_spike: 'Sentiment Spike',
  bot_warning: 'Bot Warning',
  new_token: 'New Token',
  breakout: 'Breakout',
  whale_move: 'Whale Move',
  prediction_correct: 'Prediction Verified',
  cooling_warning: 'Cooling Warning',
  narrative_shift: 'Narrative Shift',
  convergence: 'Signal Convergence',
  community_surge: 'Community Surge',
  exchange_watch: 'Exchange Watch',
};

function getAlertTone(level) {
  if (level === 'critical') return 'border-red/30 bg-red/10 text-red';
  if (level === 'alert') return 'border-orange/30 bg-orange/10 text-orange';
  if (level === 'caution') return 'border-yellow/30 bg-yellow/10 text-yellow';
  return 'border-cyan/30 bg-cyan/10 text-cyan';
}

function getEmoji(type) {
  if (type === 'breakout') return 'BOOM';
  if (type === 'bot_warning') return 'WARN';
  if (type === 'whale_move') return 'WHALE';
  if (type === 'convergence') return 'SYNC';
  if (type === 'community_surge') return 'FLOW';
  return 'SIGNAL';
}

export default function SignalCard({ signal }) {
  const [commentText, setCommentText] = useState('');
  const { likes, liked, comments, toggleLike, addComment, following, toggleFollow, activeComment, setActiveComment } = useSignalStore();

  const signalComments = comments[signal.id] || [];
  const isFollowing = following.includes(signal.coin);
  const isLiked = Boolean(liked[signal.id]);
  const likeCount = likes[signal.id] || 0;
  const isCommentOpen = activeComment === signal.id;

  const stats = useMemo(() => Object.entries(signal.stats || {}), [signal.stats]);
  const badgeTone = getAlertTone(signal.alert_level);

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    addComment(signal.id, text, 'You');
    setCommentText('');
    setActiveComment(signal.id);
  };

  const handleShare = async () => {
    const shareText = `${signal.coin}: ${signal.headline}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: signal.headline,
          text: shareText,
        });
      } catch {
        // Ignore share cancellation.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center border text-sm font-black tracking-widest"
            style={{
              color: `#${signal.color}`,
              borderColor: `#${signal.color}40`,
              backgroundColor: `#${signal.color}12`,
            }}
          >
            {getEmoji(signal.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted font-black">
                {TYPE_LABELS[signal.type] || signal.type}
              </span>
              <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest', badgeTone)}>
                {signal.alert_level}
              </span>
              <span className="text-[11px] text-muted font-mono">{signal.time}</span>
            </div>

            <h3 className="mt-3 text-lg font-black text-white leading-tight">
              {signal.headline}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {signal.body}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {stats.map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-muted"
                >
                  {label}: {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-5 py-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleLike(signal.id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            isLiked ? 'border-red/30 bg-red/10 text-red' : 'border-white/10 bg-white/5 text-muted hover:text-white'
          )}
        >
          <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
          {likeCount}
        </button>

        <button
          type="button"
          onClick={() => setActiveComment(isCommentOpen ? null : signal.id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            isCommentOpen ? 'border-cyan/30 bg-cyan/10 text-cyan' : 'border-white/10 bg-white/5 text-muted hover:text-white'
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {signalComments.length}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-white"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <button
          type="button"
          onClick={() => toggleFollow(signal.coin)}
          className={cn(
            'ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            isFollowing ? 'border-green/30 bg-green/10 text-green' : 'border-white/10 bg-white/5 text-muted hover:text-white'
          )}
        >
          <Users className="h-4 w-4" />
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <AnimatePresence>
        {isCommentOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border bg-bg2/60 px-5 py-4 overflow-hidden"
          >
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <div className="flex-1 rounded-xl border border-white/10 bg-surface px-3 py-2">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-cyan"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {signalComments.length === 0 ? (
                <p className="text-sm text-muted">No comments yet.</p>
              ) : (
                signalComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-widest text-white">{comment.author}</span>
                      <span className="text-[10px] text-muted">{comment.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
