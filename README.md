# LogSight

A production-style **System Monitoring & Alerting Platform**. Ingest logs from your services via HTTP, monitor error rates in real time, trigger threshold alerts automatically, and analyse trends with an AI-powered insights engine.

Built with **Node.js + Express 5**, **PostgreSQL**, **BullMQ + Redis**, and the **Anthropic Claude API**. Frontend in **React + Vite + Recharts**.

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
| 8 | React frontend — Vite + Recharts dashboard | ⬜ Next |
| 9 | AI insights — Anthropic Claude API | ⬜ Upcoming |
| 10 | Docker + deployment — Render + Supabase | ⬜ Upcoming |

**Tests: 26 passing** across 4 suites (apps, logs, analysis, alerts)

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
| AI Layer | Anthropic Claude API |

---

## Getting Started

```bash
git clone https://github.com/Vrishali34/logsight
cd logsight
npm install
cp .env.example .env
# Fill in your values in .env
npm run migrate:up
npm run dev
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
| `REDIS_URL` | Redis connection (Phase 7+) |
| `ANTHROPIC_API_KEY` | Claude API key (Phase 9) |
| `FRONTEND_URL` | React app URL for CORS in prod (Phase 8) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Health check |
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| POST | `/api/apps` | JWT | Create a monitored app |
| GET | `/api/apps` | JWT | List your apps |
| POST | `/api/logs` | API Key | Ingest a log entry |
| GET | `/api/logs` | JWT | Query logs with filters |
| GET | `/api/analysis/summary` | JWT | Error rate + level breakdown |
| GET | `/api/analysis/trends` | JWT | Hourly log volume chart data |
| GET | `/api/analysis/services` | JWT | Per-service error rates |
| POST | `/api/alerts` | JWT | Create an alert rule |
| GET | `/api/alerts` | JWT | List alert rules |
| DELETE | `/api/alerts/:id` | JWT | Delete an alert rule |
| GET | `/api/ai/insights` | JWT | AI-powered analysis *(Phase 9)* |

---

## How Alerting Works

1. Create a rule: `POST /api/alerts` with `{ app_id, metric: "error_rate", threshold: 30, cooldown_minutes: 5 }`
2. Every time a log is ingested via `POST /api/logs`, the system automatically checks all rules
3. If `error_rate > threshold` AND cooldown has expired → alert fires
4. Triggered alerts appear in the ingestion response under `alerts[]`
5. `last_triggered` is updated immediately to start the cooldown clock

```bash
# Create a rule — alert if error rate exceeds 30%
curl -X POST http://localhost:3000/api/alerts \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"app_id": 1, "metric": "error_rate", "threshold": 30, "cooldown_minutes": 5}'

# Ingest an error log — response includes alerts[] if threshold is breached
curl -X POST http://localhost:3000/api/logs \
  -H "x-api-key: ls_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"level": "error", "message": "Payment failed", "service": "payment-service"}'
```

---

## Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Start for production
npm test              # Run all tests (26 passing)
npm run migrate:up    # Run all pending migrations
npm run migrate:down  # Roll back last migration
```

---

## Project Structure

```
logsight/
├── migrations/
├── src/
│   ├── config/         # db.js, env.js
│   ├── middleware/      # errorHandler.js
│   ├── utils/           # logger.js
│   └── features/
│       ├── auth/        # register, login, JWT ✅
│       ├── apps/        # create app, API key ✅
│       ├── logs/        # ingest, query, apiKey middleware ✅
│       ├── analysis/    # summary, trends, services ✅
│       ├── alerts/      # CRUD rules + checkAlerts ✅
│       └── ai/          # Phase 9
├── tests/               # 26 tests, 4 suites
├── app.js
└── server.js
```

---

## Key Architecture Decisions

- **Synchronous alert checking** — runs inside the log ingestion request; production upgrade is a BullMQ async job
- **Cooldown via last_triggered timestamp** — updated immediately on fire to prevent double-alerts under concurrent load
- **parseFloat(rule.threshold)** — pg driver returns NUMERIC as string; explicit cast prevents silent comparison bugs
- **Early exit in checkAlerts** — if app has no rules, returns immediately with zero extra DB queries
- **metric as Zod enum** — only `error_rate` supported; adding new metrics is a safe, explicit one-line change
- **Two auth systems** — JWT for user-facing routes, API keys for machine-to-machine log ingestion
- **Raw SQL** — FILTER aggregates, DATE_TRUNC, INTERVAL require raw SQL; ORMs get in the way
