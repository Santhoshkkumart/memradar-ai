import { useEffect, useRef, useCallback } from 'react';
import useMemeStore from '../store/useMemeStore';

export default function useAlerts() {
  const { alerts, soundEnabled, notificationsMuted } = useMemeStore();
  const prevAlertCount = useRef(alerts.length);
  const audioCtxRef = useRef(null);

  const playAlertSound = useCallback(() => {
    if (!soundEnabled || notificationsMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.frequency.value = 880;
      osc2.frequency.value = 1100;
      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.15);
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio not supported or blocked
    }
  }, [notificationsMuted, soundEnabled]);

  useEffect(() => {
    if (alerts.length > prevAlertCount.current) {
      const latestAlert = alerts[0];
      if (latestAlert?.is_critical || latestAlert?.alert_level === 'critical') {
        playAlertSound();
      }
    }
    prevAlertCount.current = alerts.length;
  }, [alerts, playAlertSound]);

  return { playAlertSound };
}
