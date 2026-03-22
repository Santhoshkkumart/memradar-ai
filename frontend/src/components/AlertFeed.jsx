import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ShieldAlert, Zap, Info, AlertTriangle, Radio } from 'lucide-react';
import useMemeStore from '../store/useMemeStore';
import { cn } from '@/lib/utils';

const levelStyles = {
  critical: { 
    border: 'border-red/50', 
    bg: 'bg-red/10', 
    text: 'text-red',
    icon: AlertTriangle,
    glow: 'shadow-[0_0_20px_rgba(255,51,85,0.2)]',
    pulse: true 
  },
  alert: { 
    border: 'border-orange/50', 
    bg: 'bg-orange/10', 
    text: 'text-orange',
    icon: Zap,
    glow: 'shadow-[0_0_20px_rgba(255,140,0,0.2)]',
    pulse: false 
  },
  caution: { 
    border: 'border-yellow/50', 
    bg: 'bg-yellow/10', 
    text: 'text-yellow',
    icon: ShieldAlert,
    glow: 'shadow-[0_0_20px_rgba(255,215,0,0.1)]',
    pulse: false 
  },
  watch: { 
    border: 'border-cyan/50', 
    bg: 'bg-cyan/10', 
    text: 'text-cyan',
    icon: Info,
    glow: 'shadow-[0_0_20px_rgba(0,229,255,0.1)]',
    pulse: false 
  },
};

// Toast component
function Toast({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const style = levelStyles[alert.alert_level] || levelStyles.watch;
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.9 }}
      className={cn(
        "relative overflow-hidden flex flex-col rounded-2xl border p-4 shadow-2xl min-w-[320px] max-w-sm backdrop-blur-2xl",
        style.bg,
        style.border,
        style.glow
      )}
    >
      <div className="absolute top-0 right-0 p-2">
        <button onClick={onDismiss} className="text-white/40 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-xl bg-white/10 border border-white/10", style.text)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10", style.text)}>
              {alert.alert_level}
            </span>
            <span className="text-[10px] text-white/40 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-sm font-black text-white leading-tight mb-1">{alert.headline}</p>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{alert.body}</p>
        </div>
      </div>
      
      {/* Progress bar for toast lifetime */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={cn("absolute bottom-0 left-0 h-1", style.text.replace('text-', 'bg-'))}
      />
    </motion.div>
  );
}

export default function AlertFeed() {
  const { alerts } = useMemeStore();
  const [toasts, setToasts] = useState([]);
  const [prevLength, setPrevLength] = useState(0);

  useEffect(() => {
    if (alerts.length > prevLength) {
      const newAlerts = alerts.slice(0, alerts.length - prevLength);
      setToasts(prev => [...newAlerts, ...prev].slice(0, 3));
    }
    setPrevLength(alerts.length);
  }, [alerts]);

  const dismissToast = (timestamp) => {
    setToasts(prev => prev.filter(t => t.timestamp !== timestamp));
  };

  return (
    <>
      {/* Toast container */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <Toast key={`toast-${toast.timestamp}`} alert={toast} onDismiss={() => dismissToast(toast.timestamp)} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feed */}
      <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-6 shadow-2xl border border-border/30 overflow-hidden h-full">
        {/* Background Decor */}
        <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Radio className="w-32 h-32 text-yellow" />
        </div>

        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow/10 border border-yellow/20">
              <Bell className="w-5 h-5 text-yellow animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">Intelligence Feed</h3>
              <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Real-time Signals</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-black text-muted tracking-tighter">{alerts.length} ALERTS</span>
          </div>
        </div>

        <div className="relative space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <Radio className="w-12 h-12 mb-3 text-muted" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">Listening for signals...</p>
            </div>
          ) : (
            alerts.map((alert, i) => {
              const style = levelStyles[alert.alert_level] || levelStyles.watch;
              const Icon = style.icon;
              return (
                <motion.div
                  key={`alert-item-${alert.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-3 transition-all duration-300",
                    style.bg,
                    style.border,
                    "hover:scale-[1.02] hover:bg-white/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-1.5 rounded-lg bg-white/5", style.text)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter", style.text)}>
                          {alert.alert_level}
                        </span>
                        <span className="text-[8px] text-muted font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{alert.headline}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{alert.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
