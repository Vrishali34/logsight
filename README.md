# LogSight

A production-deployed **System Monitoring & Alerting Platform**. Ingest logs from your services via HTTP, monitor error rates in real time, trigger threshold alerts automatically, and get AI-powered plain-English analysis of what's happening.

🔗 **Live demo: https://logsight.onrender.com**
```
Email:    demo@logsight.com
Password: Demo1234!
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express 5 |
| Database | PostgreSQL — Supabase (prod) / local (dev) |
| Validation | Zod |
| Auth | JWT + bcrypt + API Keys |
| Security | Helmet.js + express-rate-limit |
| Frontend | React + Vite + Recharts |
| Testing | Jest + Supertest |
| Deployment | Render + Supabase |
| AI Layer | Groq + Llama 3.3 70B (free) |

---

## All 10 Phases Complete

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Express boilerplate, folder structure, env config | ✅ |
| 2 | PostgreSQL schema, migrations, DB connection pool | ✅ |
| 3 | Auth system — register, login, JWT middleware | ✅ |
| 4 | App management — create app, API key generation | ✅ |
| 5 | Log ingestion API — POST logs, GET logs with filters | ✅ |
| 6 | Analysis engine — summary, trends, service breakdown | ✅ |
| 7 | Alert system — threshold detection, cooldown | ✅ |
| 8 | React frontend — Vite + Recharts dashboard | ✅ |
| 9 | AI insights — Groq + Llama 3, provider-agnostic | ✅ |
| 10 | Docker + Supabase + Render deployment | ✅ |

---

## Dashboard

| Tab | What you see |
|-----|-------------|
| **Overview** | Error rate %, counts by level, hourly trend chart, services table |
| **Logs** | Last 50 logs, filterable by level |
| **Alerts** | Create/delete threshold rules |
| **AI Insights** | Click Analyse → Llama 3 explains your app's health in plain English |

---

## Getting Started (Local)

```bash
git clone https://github.com/Vrishali34/logsight
cd logsight
npm install
cd client && npm install && cd ..
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY
npm run migrate:up
```

**Run both servers:**
```bash
npm run dev       # backend → http://localhost:3000
npm run client    # frontend → http://localhost:5173
```

**Or with Docker:**
```bash
docker-compose up --build
```

---

## API Quick Reference

```bash
# Register
curl -X POST https://logsight.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Password123!"}'

# Login → get JWT
curl -X POST https://logsight.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Password123!"}'

# Create app → get API key
curl -X POST https://logsight.onrender.com/api/apps \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-service"}'

# Ingest a log
curl -X POST https://logsight.onrender.com/api/logs \
  -H "x-api-key: ls_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"level":"error","message":"Payment failed","service":"payment-service"}'

# Get AI insights
curl "https://logsight.onrender.com/api/ai/insights?app_id=1&hours=24" \
  -H "Authorization: Bearer YOUR_JWT"
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
| `GROQ_API_KEY` | From console.groq.com — free |
| `FRONTEND_URL` | React app URL for CORS in prod |

---

## Scripts

```bash
npm run dev           # Backend (nodemon)
npm run client        # Frontend (Vite)
npm start             # Backend production
npm test              # All tests (26 passing)
npm run migrate:up    # Run DB migrations
docker-compose up     # Full stack via Docker
```

---

## Architecture Decisions

- **Two auth systems** — JWT for users, API keys for service log ingestion
- **Raw SQL** — Phase 6 analysis uses FILTER aggregates, DATE_TRUNC, NULLIF — ORMs can't handle these cleanly
- **Provider-agnostic AI** — Groq/Llama3 isolated in `ai.service.js`; switching to Claude/GPT-4 is 3 lines
- **Promise.all** — three analysis queries run in parallel, not sequentially
- **Supabase pooler** — Direct connection resolves to IPv6; pooler uses IPv4 (required for Render free tier)
- **Named wildcard `/{*path}`** — Express 5 requires this; bare `*` throws PathError with path-to-regexp v8
- **Multi-stage Dockerfile** — Stage 1 builds React; Stage 2 is lean production image
