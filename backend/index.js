const path = require('path');
const fs = require('fs');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const { isDemoMode, getConfiguredProviders, getMissingProductionSecrets } = require('./services/runtime');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/coins', require('./routes/coins'));
app.use('/api/social', require('./routes/social'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/predict', require('./routes/predict'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/fear-greed', require('./routes/fearGreed'));
app.use('/api/dexscreener', require('./routes/dexscreener'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    demo_mode: isDemoMode(),
    providers: getConfiguredProviders(),
  });
});

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const frontendIndex = path.join(frontendDist, 'index.html');

if (fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));

  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) {
      return next();
    }

    return res.sendFile(frontendIndex);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MemeRadar backend running on port ${PORT}`);

  if (!isDemoMode()) {
    const missing = getMissingProductionSecrets();
    if (missing.length > 0) {
      console.warn('[Startup] Missing production env vars:', missing.join(', '));
      console.warn('[Startup] The app will still run, but missing services will fall back to mock data.');
    }
  }
});
