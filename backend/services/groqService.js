const axios = require('axios');

async function analyzeWithGroq(systemPrompt, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here') {
    throw new Error('Groq API key not configured');
  }

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-8b-8192',
      max_tokens: 1000,
      temperature: 0.3,
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
  );

  let content = response.data.choices[0].message.content;
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(content);
}

module.exports = { analyzeWithGroq };
