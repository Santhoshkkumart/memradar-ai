const { analyzeWithGroq } = require('./groqService');
const { analyzeWithGemini } = require('./geminiService');

const CACHE_TTL_MS = 5 * 60 * 1000;
const aiCache = new Map();
const inflight = new Map();

function getCacheKey(systemPrompt, userMessage) {
  return `${systemPrompt}\n\n${userMessage}`;
}

function getCachedResult(key) {
  const entry = aiCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    aiCache.delete(key);
    return null;
  }

  return entry.value;
}

function setCachedResult(key, value) {
  aiCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function analyzeWithAI(systemPrompt, userMessage) {
  const cacheKey = getCacheKey(systemPrompt, userMessage);
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const request = (async () => {
    // Try Groq first
    try {
      console.log('[AI] Trying Groq...');
      const result = await analyzeWithGroq(systemPrompt, userMessage);
      console.log('[AI] Using: groq');
      setCachedResult(cacheKey, result);
      return result;
    } catch (groqError) {
      console.log('[AI] Groq failed:', groqError.message);
    }

    // Fallback to Gemini
    try {
      console.log('[AI] Trying Gemini...');
      const result = await analyzeWithGemini(systemPrompt, userMessage);
      console.log('[AI] Using: gemini');
      setCachedResult(cacheKey, result);
      return result;
    } catch (geminiError) {
      console.log('[AI] Gemini failed:', geminiError.message);
    }

    throw new Error('All AI services unavailable');
  })();

  inflight.set(cacheKey, request);

  return request.finally(() => {
    inflight.delete(cacheKey);
  });
}

module.exports = { analyzeWithAI };
