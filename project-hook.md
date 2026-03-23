# MemeRadar AI Handoff

You are working in MemeRadar AI, a React + Express crypto social-intelligence dashboard.

## Core Structure
- Frontend: `frontend/src`
- Backend: `backend/`
- Main shell: `frontend/src/App.jsx`
- Main navigation: `frontend/src/components/Header.jsx`

## Important Frontend State
- `frontend/src/store/useMemeStore.js`
  - coins, selectedCoin, posts, sentiment, hypeStage, prediction, alerts, fearGreed, velocity, social, trends
- `frontend/src/store/useSignalStore.js`
  - dedicated Signal Feed timeline state

## Important Frontend Views
- Dashboard: `frontend/src/components/Dashboard.jsx`
- Signal Feed: `frontend/src/components/SignalFeed.jsx`
- Coin comparison: `frontend/src/components/CoinCompare.jsx`
- Replay: `frontend/src/components/HypeReplay.jsx`

## Important Data Hooks
- `frontend/src/hooks/useCoins.js`
- `frontend/src/hooks/useSentiment.js`
  - pulls social posts and trends
- `frontend/src/hooks/useAlerts.js`
- `frontend/src/hooks/useLivePrices.js`

## Backend Routes
- `/api/coins`
- `/api/social`
- `/api/youtube`
- `/api/sentiment`
- `/api/predict`
- `/api/alerts`
- `/api/fear-greed`
- `/api/dexscreener`

## New Trends Flow
- Aggregated social route: `backend/routes/social.js`
- Trends service: `backend/services/googleTrendsService.js`
- Frontend card: `frontend/src/components/GoogleTrendsCard.jsx`

## Stability Rules
- Never remove fallback behavior from external providers.
- Keep console noise low when services fail.
- Preserve existing dashboard layout unless explicitly asked to redesign it.
- Keep signal feed changes isolated to the new tab/page.

## Environment
- Backend env lives in `backend/.env`
- Template is `backend/.env.example`
- Current Google Trends implementation uses `google-trends-api`
- `SERPAPI_KEY` is present as an optional placeholder for future SerpAPI migration, but is not used by the current code

## Build Sanity
- Frontend build currently passes with `npm run build`
- Backend service modules currently load without syntax errors
