import React from 'react';
import { cn } from '@/lib/utils';

function normalizePoints(values, width, height) {
  if (!values || values.length < 2) return '';

  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length < 2) return '';

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;
  const step = width / (filtered.length - 1);

  return filtered
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export default function TinySparkline({ values = [], className, stroke = '#22d3ee' }) {
  const width = 80;
  const height = 22;
  const points = normalizePoints(values.slice(-10), width, height);

  if (!points) {
    return <div className={cn("h-[22px] w-[80px]", className)} />;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-[22px] w-[80px]", className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.95"
      />
    </svg>
  );
}
