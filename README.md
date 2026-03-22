# MemeRadar AI 🎯

Real-time meme coin trend prediction powered by social intelligence and AI.

> **Detect coins in "Early Whisper" stage before mainstream attention.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Navigate to project
cd memeradar

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### Running

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Open: http://localhost:5173
```

### Demo Mode (No API keys needed)
The app runs with **realistic mock data** by default when no API keys are configured. Set `DEMO_MODE=true` in `.env.example` for guaranteed mock data.

### Production Setup
For live Reddit, CoinGecko, and AI data, copy `.env.example` to `backend/.env` and set:
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_SECRET`
- `CORS_ORIGIN` to your frontend URL

If the frontend is hosted separately, set `VITE_API_BASE_URL` to the backend URL. If both are served from the same backend, leave it blank.

Keep `DEMO_MODE=false` for production so the backend uses live APIs and only falls back to mock data when a service fails.

### Getting API Keys (Optional — for live data)

| Service | URL | Notes |
|---------|-----|-------|
| **Groq** | [console.groq.com](https://console.groq.com) | Free — Create account → API Keys |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) | Free — Get API Key |
| **Reddit** | [reddit.com/prefs/apps](https://reddit.com/prefs/apps) | Create App → Script type; use the client ID and secret in `backend/.env` |

Copy `.env.example` to `backend/.env` and fill in your keys:
```
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
REDDIT_CLIENT_ID=your_client_id
REDDIT_SECRET=your_secret
```

## 🧠 Features

- **4 Hype Stages**: Early Whisper → Building Momentum → Peak Frenzy → Cooling Down
- **AI Sentiment Analysis**: Groq Llama3 with Gemini fallback
- **Moonshot Probability**: 0-100% chance of 2x in 48hrs
- **Hype Replay**: Historical case studies (PEPE, DOGE, FLOKI, BONK)
- **Coin Compare**: Side-by-side signal comparison
- **Real-time Alerts**: Toast notifications with sound

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | Node.js, Express, node-cache |
| AI | Groq (Llama3) → Gemini (fallback) |
| Data | Reddit API, CoinGecko, Fear & Greed Index |
