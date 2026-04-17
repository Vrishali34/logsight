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
| 6 | Analysis engine — error rates, trends (SQL CTEs) | ⬜ Next |
| 7 | Alert system — threshold detection + cooldown | ⬜ Upcoming |
| 8 | React frontend — Vite + Recharts dashboard | ⬜ Upcoming |
| 9 | AI insights — Anthropic Claude API | ⬜ Upcoming |
| 10 | Docker + deployment — Render + Supabase | ⬜ Upcoming |

**Tests: 12 passing** (4 app management + 8 log ingestion)

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

### Prerequisites
- Node.js v18+
- PostgreSQL running locally
- Redis running locally

### Setup

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
| `REDIS_URL` | Redis connection (Phase 5+) |
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
| GET | `/api/analysis` | JWT | Error rates + trends *(Phase 6)* |
| GET | `/api/alerts` | JWT | Alert rules *(Phase 7)* |
| GET | `/api/ai/insights` | JWT | AI-powered analysis *(Phase 9)* |

### Authentication Headers
```
Authorization: Bearer <jwt_token>       ← for JWT-protected routes
x-api-key: <app_api_key>               ← for log ingestion (POST /api/logs)
```

### Query Params for GET /api/logs
```
?app_id=1           required — which app's logs to fetch
?level=error        optional — filter by level (info/warn/error/debug)
?service=payment    optional — filter by service name
?limit=50           optional — results per page (default 50)
?offset=0           optional — pagination offset (default 0)
```

---

## Example: Ingest a Log

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: ls_YOUR_API_KEY" \
  -d '{
    "level": "error",
    "message": "Payment timeout after 5000ms",
    "service": "payment-service",
    "metadata": { "orderId": "ord_123", "retryCount": 3 }
  }'
```

---

## Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Start for production
npm test              # Run all tests (12 passing)
npm run test:watch    # Run tests in watch mode
npm run migrate:up    # Run all pending migrations
npm run migrate:down  # Roll back last migration
npm run migrate:create # Create a new migration file
```

---

## Project Structure

```
logsight/
├── migrations/          # Versioned SQL schema files
├── src/
│   ├── config/
│   │   ├── db.js        # pg connection pool (exports: pool, connectDB)
│   │   └── env.js       # fail-fast env validation
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── logger.js    # structured JSON logger
│   └── features/
│       ├── auth/        # register, login, JWT middleware ✅
│       ├── apps/        # app management, API key generation ✅
│       ├── logs/        # log ingestion, API key auth, query ✅
│       ├── analysis/    # Phase 6
│       ├── alerts/      # Phase 7
│       └── ai/          # Phase 9
├── tests/
│   ├── apps.test.js     # 4 tests
│   └── logs.test.js     # 8 tests
├── app.js               # Express config (exported for tests)
└── server.js            # HTTP server + graceful shutdown
```

---

## Key Architecture Decisions

- **Two auth systems** — JWT for user-facing routes (dashboard), API keys for machine-to-machine log ingestion
- **req.app_record not req.app** — Express reserves req.app; overwriting it breaks the framework
- **API keys stored in plaintext** — hashing would add ~250ms bcrypt latency to the log ingestion hot path
- **Dynamic SQL query building** — WHERE conditions built only for provided filters; avoids NULL comparison bugs
- **Parameterised queries** — all values use $1 $2 placeholders; SQL injection is structurally impossible
- **ZodError → 400** — validation failures caught in middleware; never bubble up as 500
- **Raw SQL over ORM** — Phase 6 needs CTEs and window functions that ORMs handle poorly
