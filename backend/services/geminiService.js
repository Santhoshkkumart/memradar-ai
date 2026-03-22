const axios = require('axios');

async function analyzeWithGemini(systemPrompt, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    throw new Error('Gemini API key not configured');
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [{ text: systemPrompt + '\n\n' + userMessage }]
      }]
    },
    { timeout: 10000 }
  );

  let content = response.data.candidates[0].content.parts[0].text;
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(content);
}

module.exports = { analyzeWithGemini };
