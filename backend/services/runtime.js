function isDemoMode() {
  return String(process.env.DEMO_MODE || '').toLowerCase() === 'true';
}

function isProductionMode() {
  return !isDemoMode();
}

function getConfiguredProviders() {
  return {
    groq: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_key_here'),
    gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key_here'),
    cryptopanic: Boolean(process.env.CRYPTOPANIC_KEY && process.env.CRYPTOPANIC_KEY !== 'your_cryptopanic_key_here'),
    lunarcrush: Boolean(process.env.LUNARCRUSH_KEY && process.env.LUNARCRUSH_KEY !== 'your_lunarcrush_key_here'),
    youtube: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here'),
  };
}

function getMissingProductionSecrets() {
  if (isDemoMode()) {
    return [];
  }

  const missing = [];

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
    missing.push('GROQ_API_KEY');
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_key_here') {
    missing.push('GEMINI_API_KEY');
  }

  if (!process.env.CRYPTOPANIC_KEY || process.env.CRYPTOPANIC_KEY === 'your_cryptopanic_key_here') {
    missing.push('CRYPTOPANIC_KEY');
  }

  if (!process.env.LUNARCRUSH_KEY || process.env.LUNARCRUSH_KEY === 'your_lunarcrush_key_here') {
    missing.push('LUNARCRUSH_KEY');
  }

  if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
    missing.push('YOUTUBE_API_KEY');
  }

  return missing;
}

module.exports = {
  getConfiguredProviders,
  getMissingProductionSecrets,
  isDemoMode,
  isProductionMode,
};
