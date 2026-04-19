# LogSight

A production-style **System Monitoring & Alerting Platform**. Ingest logs from your services via HTTP, monitor error rates in real time, trigger threshold alerts, and get AI-powered plain-English analysis of what's happening and what to fix.

Built with **Node.js + Express 5**, **PostgreSQL**, **Groq + Llama 3**, and a **React + Vite + Recharts** frontend.

---

## Phase Progress

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Express boilerplate, folder structure, env config | ✅ Complete |
| 2 | PostgreSQL schema, migrations, DB connection pool | ✅ Complete |
| 3 | Auth system — register, login, JWT middleware | ✅ Complete |
| 4 | App management — create app, API key generation | ✅ Complete |
| 5 | Log ingestion API — POST logs, GET logs with filters | ✅ Complete |
| 6 | Analysis engine — summary, trends, service breakdown | ✅ Complete |
| 7 | Alert system — threshold detection, cooldown | ✅ Complete |
| 8 | React frontend — Vite + Recharts dashboard | ✅ Complete |
| 9 | AI insights — Groq + Llama 3, provider-agnostic | ✅ Complete |
| 10 | Docker + deployment — Render + Supabase | ⬜ Next |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express 5 |
| Database | PostgreSQL (dev) → Supabase (prod) |
| Validation | Zod |
| Auth | JWT + bcrypt + API Keys |
| Security | Helmet.js + express-rate-limit |
| Frontend | React + Vite + Recharts |
| Queue | BullMQ + Redis |
| Testing | Jest + Supertest |
| Deployment | Docker + Render |
| AI Layer | Groq SDK + Llama 3.3 70B (free) |

---

## Getting Started

```bash
git clone https://github.com/Vrishali34/logsight
cd logsight
npm install
cd client && npm install && cd ..
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY
npm run migrate:up
```

**Run the full stack:**
```bash
# Terminal 1
npm run dev       # backend → http://localhost:3000

# Terminal 2
npm run client    # frontend → http://localhost:5173
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32-character random string |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `REDIS_URL` | Redis connection |
| `GROQ_API_KEY` | From console.groq.com — free account |
| `FRONTEND_URL` | React app URL for CORS in prod |

---

## Dashboard

| Tab | What you see |
|-----|-------------|
| **Overview** | Error rate %, counts by level, hourly trend chart, services table |
| **Logs** | Last 50 logs, filterable by level |
| **Alerts** | Create/delete threshold rules, view last triggered |
| **AI Insights** | Click Analyse → Llama 3 explains your app's health in plain English |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Health check |
| POST | `/api/auth/register` | None | Register |
| POST | `/api/auth/login` | None | Login → JWT |
| POST | `/api/apps` | JWT | Create app |
| GET | `/api/apps` | JWT | List apps |
| POST | `/api/logs` | API Key | Ingest log |
| GET | `/api/logs` | JWT | Query logs |
| GET | `/api/analysis/summary` | JWT | Error rate + counts |
| GET | `/api/analysis/trends` | JWT | Hourly chart data |
| GET | `/api/analysis/services` | JWT | Per-service rates |
| POST | `/api/alerts` | JWT | Create alert rule |
| GET | `/api/alerts` | JWT | List rules |
| DELETE | `/api/alerts/:id` | JWT | Delete rule |
| GET | `/api/ai/insights` | JWT | AI plain-English analysis |

---

## How AI Insights Works

1. You click **Analyse** in the AI Insights tab
2. Backend fetches summary + trends + services from PostgreSQL in parallel
3. Builds a structured SRE-style prompt with the real numbers
4. Sends to Groq API (Llama 3.3 70B, free)
5. Returns plain-English analysis: health assessment, critical issue, which service to fix, what to do

**Why Groq:** Free tier, LPU hardware (custom silicon for AI inference = very fast), Llama 3.3 70B is a high-quality open-source model. Provider-agnostic design means switching to Anthropic Claude or OpenAI GPT-4o is a 3-line change in `ai.service.js`.

---

## Scripts

```bash
npm run dev           # Backend (nodemon)
npm run client        # Frontend (Vite)
npm start             # Backend production
npm test              # All tests
npm run migrate:up    # Run DB migrations
```

---

## Key Architecture Decisions

- **Provider-agnostic AI layer** — Groq SDK isolated in `ai.service.js`; controller/routes/frontend have no AI knowledge
- **Promise.all for data fetching** — summary, trends, services queried in parallel, not sequentially
- **Structured prompt** — role (SRE), labelled data, numbered output format, 200-word limit
- **30s test timeout** — AI calls take 1–5s; Jest's default 5s timeout would always fail
- **Two auth systems** — JWT for users, API keys for log ingestion services
- **Raw SQL** — FILTER aggregates, DATE_TRUNC, NULLIF require raw SQL; ORMs can't handle Phase 6 queries cleanly
