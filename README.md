# MemeRadar

Real-time meme coin trend prediction powered by social signals and AI.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install

```bash
cd memeradar
cd backend && npm install
cd ../frontend && npm install
```

### Run

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:5173`.

## Demo Mode

Set `DEMO_MODE=true` for mock data only. Set `DEMO_MODE=false` to use live providers where keys are available.

## Production Setup

Edit `backend/.env` and set:
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_SECRET`
- `YOUTUBE_API_KEY`
- `CORS_ORIGIN`

If the frontend is hosted separately, set `VITE_API_BASE_URL` in your build or deployment environment to the backend URL.

## Deployment

The repo now includes a root `Dockerfile` that:
- builds the React frontend
- installs backend dependencies
- serves the built UI from the Express backend

Build and run it with:

```bash
docker build -t memeradar .
docker run -p 5000:5000 --env-file backend/.env memeradar
```

For Docker-based deploys, keep your secrets in `backend/.env` or the platform's secret manager and set `DEMO_MODE=false` for live providers.

## CI / Backup Path

- GitHub Actions runs a build check on every push and pull request through `.github/workflows/ci.yml`.
- Use the Dockerfile as the backup deployment path if the platform-specific deploy fails.
- Primary deploy setup should provide `backend/.env` secrets and expose port `5000`.

## API Keys

| Service | Setup |
| --- | --- |
| Groq | Create an API key in the Groq console |
| Gemini | Create a key in Google AI Studio |
| Reddit | Create a script app in Reddit developer settings |
| YouTube | Enable the YouTube Data API in Google Cloud and create an API key |

## Features

- Reddit or YouTube as the selectable social source
- Live DEXScreener snapshots in the compare view
- CoinGecko market data
- Groq with Gemini fallback for analysis
- Demo mode fallback when a provider is unavailable

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express
- Data: Reddit API, YouTube Data API, CoinGecko, DEXScreener, Fear and Greed Index
- AI: Groq, Gemini
