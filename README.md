# LogSight

A production-style **System Monitoring & Alerting Platform**. Ingest logs from your services via HTTP, monitor error rates in real time, trigger threshold alerts, and analyse trends with an AI-powered insights engine.

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
| 7 | Alert system — threshold detection + cooldown | ⬜ Next |
| 8 | React frontend — Vite + Recharts dashboard | ⬜ Upcoming |
| 9 | AI insights — Anthropic Claude API | ⬜ Upcoming |
| 10 | Docker + deployment — Render + Supabase | ⬜ Upcoming |

**Tests: 17 passing** across 3 suites (apps, logs, analysis)

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
| GET | `/api/alerts` | JWT | Alert rules *(Phase 7)* |
| GET | `/api/ai/insights` | JWT | AI-powered analysis *(Phase 9)* |

### Query Parameters

**GET /api/logs**
```
?app_id=1       required
?level=error    optional — info/warn/error/debug
?service=name   optional
?limit=50       optional (default 50)
?offset=0       optional (default 0)
```

**GET /api/analysis/summary|trends|services**
```
?app_id=1       required
?hours=24       optional — lookback window in hours (default 24)
```

---

## Example Requests

### Ingest a log
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: ls_YOUR_API_KEY" \
  -d '{
    "level": "error",
    "message": "Payment timeout",
    "service": "payment-service",
    "metadata": { "orderId": "ord_123" }
  }'
```

### Get error rate for last 24 hours
```bash
curl "http://localhost:3000/api/analysis/summary?app_id=1&hours=24" \
  -H "Authorization: Bearer YOUR_JWT"
```

### Get hourly trend data
```bash
curl "http://localhost:3000/api/analysis/trends?app_id=1&hours=24" \
  -H "Authorization: Bearer YOUR_JWT"
```

### See which service is failing most
```bash
curl "http://localhost:3000/api/analysis/services?app_id=1" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Start for production
npm test              # Run all tests (17 passing)
npm run migrate:up    # Run all pending migrations
npm run migrate:down  # Roll back last migration
npm run migrate:create # Create new migration file
```

---

## Project Structure

```
logsight/
├── migrations/
├── src/
│   ├── config/         # db.js (pool), env.js
│   ├── middleware/      # errorHandler.js
│   ├── utils/           # logger.js
│   └── features/
│       ├── auth/        # register, login, JWT ✅
│       ├── apps/        # create app, API key ✅
│       ├── logs/        # ingest, query, apiKey middleware ✅
│       ├── analysis/    # summary, trends, services ✅
│       ├── alerts/      # Phase 7
│       └── ai/          # Phase 9
├── tests/               # 17 tests, 3 suites
├── app.js
└── server.js
```

---

## Key Architecture Decisions

- **Two auth systems** — JWT for user-facing routes, API keys for machine-to-machine log ingestion
- **Single DB round trip per analysis endpoint** — FILTER aggregates compute everything in one SQL query
- **Composite index (app_id, timestamp)** — designed in Phase 2 specifically for Phase 6 analysis queries
- **Raw SQL over ORM** — DATE_TRUNC, FILTER, INTERVAL, NULLIF require raw SQL
- **NULLIF(COUNT(*), 0)** — prevents division-by-zero crash when app has no logs
- **Dynamic WHERE building** — only adds filter conditions that were actually provided
- **req.app_record** — Express reserves req.app; overwriting it silently breaks the framework
