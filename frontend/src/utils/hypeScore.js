export function computeHypeScore(sentiment_score, velocity_ratio, stage) {
  const sentimentComponent = ((sentiment_score + 100) / 2) * 0.5;
  const velocityComponent = Math.min(velocity_ratio * 10, 100) * 0.3;
  const stageWeights = {
    early_whisper: 20,
    building_momentum: 60,
    peak_frenzy: 80,
    cooling_down: 10,
  };
  const stageComponent = (stageWeights[stage] || 0) * 0.2;
  return Math.min(Math.round(sentimentComponent + velocityComponent + stageComponent), 100);
}

export function getStageIndex(stage) {
  const stages = ['early_whisper', 'building_momentum', 'peak_frenzy', 'cooling_down'];
  return stages.indexOf(stage);
}

export function getStageLabel(stage) {
  const labels = {
    early_whisper: 'Early Whisper',
    building_momentum: 'Building Momentum',
    peak_frenzy: 'Peak Frenzy',
    cooling_down: 'Cooling Down',
  };
  return labels[stage] || 'Unknown';
}

export function getStageColor(stage) {
  const colors = {
    early_whisper: '#00e5ff',
    building_momentum: '#f59e0b',
    peak_frenzy: '#ef4444',
    cooling_down: '#6b7280',
  };
  return colors[stage] || '#4a6088';
}

export function getDirectionColor(direction) {
  const colors = {
    bullish: '#00ff88',
    bearish: '#ff3355',
    sideways: '#ff8c00',
  };
  return colors[direction] || '#ff8c00';
}

export function getMoonshotProbability(sentiment, velocity, stage) {
  if (!sentiment || !velocity) return 0;

  const sentScore = sentiment.sentiment_score || 0;
  const velRatio = velocity.velocity_ratio || 1;
  const stg = stage?.hype_stage || 'building_momentum';

  let base = 0;

  // Sentiment contribution (0-35)
  if (sentScore > 80) base += 35;
  else if (sentScore > 60) base += 25;
  else if (sentScore > 40) base += 15;
  else if (sentScore > 0) base += 5;

  // Velocity contribution (0-35)
  if (velRatio > 8) base += 35;
  else if (velRatio > 5) base += 28;
  else if (velRatio > 3) base += 20;
  else if (velRatio > 1.5) base += 10;

  // Stage contribution (0-30)
  const stageScores = {
    early_whisper: 30,
    building_momentum: 20,
    peak_frenzy: 10,
    cooling_down: 2,
  };
  base += stageScores[stg] || 5;

  // Convergence bonus: all strong = bonus
  if (sentScore > 70 && velRatio > 3 && stg === 'early_whisper') {
    base = Math.min(base + 15, 98);
  }

  return Math.min(Math.max(Math.round(base), 0), 100);
}

// Alias for compatibility
export const computeMoonshotProbability = getMoonshotProbability;

export function getPatternMatch(stage, coin) {
  const matches = {
    early_whisper: { coin: 'PEPE', period: 'April 2023', match: 87 },
    building_momentum: { coin: 'DOGE', period: 'January 2021', match: 72 },
    peak_frenzy: { coin: 'SHIB', period: 'October 2021', match: 65 },
    cooling_down: { coin: 'FLOKI', period: 'March 2022', match: 45 },
  };
  return matches[stage] || matches.building_momentum;
}
