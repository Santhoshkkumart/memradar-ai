# MemeRadar AI - Full Project Map

## What The App Is
MemeRadar AI is a crypto social-intelligence dashboard. It combines market data, social news, LunarCrush-style metrics, AI sentiment analysis, hype-stage classification, predictions, and live price updates into a single React + Express application.

## Top-Level Architecture
- `backend/` is an Express API server.
- `frontend/` is a Vite React app.
- The backend serves the built frontend in production from `backend/index.js`.
- The frontend keeps most UI state in Zustand stores.
- AI/provider calls are isolated in backend service wrappers so the UI can fall back to demo data when external APIs fail.

## Backend Structure

### Entry Point
- `backend/index.js` bootstraps Express, CORS, JSON parsing, routes, and production static serving.

### Routes
- `backend/routes/coins.js`
  - Trending coins and CoinGecko price enrichment.
- `backend/routes/social.js`
  - CryptoPanic news, LunarCrush metrics, and the aggregated `/api/social/:coin` route that now also includes Google Trends.
- `backend/routes/sentiment.js`
  - AI sentiment analysis.
- `backend/routes/predict.js`
  - Hype-stage and prediction generation.
- `backend/routes/alerts.js`
  - Alert generation.
- `backend/routes/fearGreed.js`
  - Fear and Greed index.
- `backend/routes/dexscreener.js`
  - DEXScreener search and pair lookups.
- `backend/routes/youtube.js`
  - YouTube social feed.

### Services
- `backend/services/coingeckoService.js`
  - Trending coins and price fetch with mock fallback and reduced console spam.
- `backend/services/cryptoPanicService.js`
  - News fetch and velocity calculations.
- `backend/services/lunarCrushService.js`
  - LunarCrush social metrics with graceful fallback.
- `backend/services/googleTrendsService.js`
  - Google Trends aggregation using `google-trends-api`.
- `backend/services/aiService.js`
  - Groq/Gemini AI orchestration.
- `backend/services/groqService.js`
- `backend/services/geminiService.js`
- `backend/services/dexscreenerService.js`
- `backend/services/youtubeService.js`
- `backend/services/runtime.js`
  - Demo mode and provider availability helpers.
- `backend/services/safety.js`
  - Retry and JSON parsing helpers.

### Caching
- `backend/middleware/cache.js`
  - Shared GET cache middleware.
- Social aggregate route uses a 300 second cache.
- Existing source-specific social routes keep their shorter cache windows.

## Frontend Structure

### App Shell
- `frontend/src/App.jsx`
  - Loads all polling hooks.
  - Switches between `dashboard`, `signals`, `replay`, and `compare`.
- `frontend/src/components/Header.jsx`
  - Top navigation, source selector, alert controls, and active tab control.
- `frontend/src/components/TickerTape.jsx`
  - Bottom market ticker strip.
- `frontend/src/index.css`
  - Theme variables and global visuals.

### Core Dashboard
- `frontend/src/components/Dashboard.jsx`
  - Main dashboard view.
- `frontend/src/components/CoinList.jsx`
- `frontend/src/components/StatStrip.jsx`
- `frontend/src/components/MoonshotCard.jsx`
- `frontend/src/components/FearGreedGauge.jsx`
- `frontend/src/components/HypeStageBar.jsx`
- `frontend/src/components/SentimentArc.jsx`
- `frontend/src/components/PredictionCard.jsx`
- `frontend/src/components/AlertFeed.jsx`
- `frontend/src/components/PostsFeed.jsx`
- `frontend/src/components/GoogleTrendsCard.jsx`
  - New trends card rendered in the analysis/overview stack.

### Signal Feed
- `frontend/src/components/SignalFeed.jsx`
  - Dedicated social timeline page.
- `frontend/src/components/SignalCard.jsx`
  - Interactive signal item with likes, comments, follow, and share.
- `frontend/src/store/useSignalStore.js`
  - Store for signals, likes, comments, following, and filters.

### State and Hooks
- `frontend/src/store/useMemeStore.js`
  - Main dashboard state.
  - Now includes `trends` and `setTrends`.
- `frontend/src/hooks/useCoins.js`
  - Loads trending coins and fear/greed data.
- `frontend/src/hooks/useSentiment.js`
  - Main social/AI pipeline.
  - Fetches social data and Google Trends data in parallel, then populates store state.
- `frontend/src/hooks/useAlerts.js`
- `frontend/src/hooks/useLivePrices.js`

### API Client
- `frontend/src/api/client.js`
  - Axios wrapper for all backend routes.
  - Adds `fetchSocialData(coin)` for the aggregated social/trends response.

## Data Flow
1. `useCoins()` loads trending coins and selects the default coin.
2. `useSentiment()` fetches social posts, AI sentiment, hype stage, prediction, and now trends.
3. `PostsFeed` displays the selected social source output.
4. `GoogleTrendsCard` reads `store.trends`.
5. `SignalFeed` is a separate page driven by mock timeline data.

## Mock/Fallback Behavior
- CoinGecko, LunarCrush, CryptoPanic, AI providers, and Google Trends all fall back to mock data when they fail.
- The dashboard stays functional even if upstream services are unavailable.
- The Google Trends card shows a skeleton while `trends` is `null`.

## Environment Variables
### Backend
- `PORT`
- `DEMO_MODE`
- `CORS_ORIGIN`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `CRYPTOPANIC_KEY`
- `LUNARCRUSH_KEY`
- `YOUTUBE_API_KEY`
- `SERPAPI_KEY` optional placeholder for a future SerpAPI-based trends integration

### Frontend
- `VITE_API_BASE_URL`

## Local Commands
- `cd backend && npm run dev`
- `cd frontend && npm run dev`
- `cd frontend && npm run build`
- `cd backend && npm start`

## Notes For Future Work
- The current Google Trends implementation uses the free `google-trends-api` package, not SerpAPI.
- If a SerpAPI migration is desired later, replace `backend/services/googleTrendsService.js` and keep the frontend contract unchanged.
- The signal feed is mock-driven by design for now and can be wired to real event generation later.
