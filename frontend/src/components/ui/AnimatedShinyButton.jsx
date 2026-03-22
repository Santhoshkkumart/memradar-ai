import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedShinyButton({ children, className, url, onClick }) {
  const sharedClassName = cn(
    "group relative overflow-hidden rounded-lg bg-slate-950 px-6 py-2 text-sm font-medium text-white transition-all duration-300",
    "border border-slate-800 hover:border-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]",
    className
  );

  const shimmer = (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  );

  const content = (
    <>
      {shimmer}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </>
  );

  if (url) {
    return (
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={url}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={sharedClassName}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={sharedClassName}
    >
      {content}
    </motion.button>
  );
}
