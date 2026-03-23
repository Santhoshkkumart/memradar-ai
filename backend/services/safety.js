function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(operation, { retries = 1, delayMs = 250, label = 'request' } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(delayMs * (attempt + 1));
      }
    }
  }

  const error = lastError instanceof Error ? lastError : new Error(String(lastError || `${label} failed`));
  error.message = `${label} failed: ${error.message}`;
  throw error;
}

function stripCodeFences(text) {
  return String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function extractJsonPayload(text) {
  const cleaned = stripCodeFences(text);

  if (!cleaned) {
    throw new Error('Empty AI response');
  }

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');

    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    }

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
    }
  }

  throw new Error('AI response was not valid JSON');
}

module.exports = {
  extractJsonPayload,
  withRetry,
};
