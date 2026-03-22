const { analyzeWithGroq } = require('./groqService');
const { analyzeWithGemini } = require('./geminiService');

async function analyzeWithAI(systemPrompt, userMessage) {
  // Try Groq first
  try {
    console.log('[AI] Trying Groq...');
    const result = await analyzeWithGroq(systemPrompt, userMessage);
    console.log('[AI] Using: groq');
    return result;
  } catch (groqError) {
    console.log('[AI] Groq failed:', groqError.message);
  }

  // Fallback to Gemini
  try {
    console.log('[AI] Trying Gemini...');
    const result = await analyzeWithGemini(systemPrompt, userMessage);
    console.log('[AI] Using: gemini');
    return result;
  } catch (geminiError) {
    console.log('[AI] Gemini failed:', geminiError.message);
  }

  throw new Error('All AI services unavailable');
}

module.exports = { analyzeWithAI };
