const axios = require('axios');
const { extractJsonPayload, withRetry } = require('./safety');

async function analyzeWithGroq(systemPrompt, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here') {
    throw new Error('Groq API key not configured');
  }

  const response = await withRetry(
    () => axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_completion_tokens: 384,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    ),
    { retries: 1, delayMs: 300, label: 'Groq request' }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  return extractJsonPayload(content);
}

module.exports = { analyzeWithGroq };
