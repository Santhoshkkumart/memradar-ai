import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedBadge({ text, color, href, className }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border shadow-sm",
        className
      )}
      style={{
        borderColor: color ? `${color}44` : undefined,
        backgroundColor: color ? `${color}11` : undefined,
        color: color || undefined,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color || 'currentColor' }}
        ></span>
        <span 
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: color || 'currentColor' }}
        ></span>
      </span>
      {text}
    </motion.div>
  );

  if (href) {
    return <a href={href} className="no-underline">{content}</a>;
  }

  return content;
}
