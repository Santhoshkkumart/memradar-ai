const axios = require('axios');
const { extractJsonPayload, withRetry } = require('./safety');

async function analyzeWithGemini(systemPrompt, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    throw new Error('Gemini API key not configured');
  }

  const response = await withRetry(
    () => axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [{
          parts: [{ text: systemPrompt + '\n\n' + userMessage }]
        }]
      },
      {
        timeout: 10000,
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    ),
    { retries: 1, delayMs: 300, label: 'Gemini request' }
  );

  const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return extractJsonPayload(content);
}

module.exports = { analyzeWithGemini };
