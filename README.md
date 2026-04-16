# LogSight

A production-style **System Monitoring & Alerting Platform**. Ingest logs via HTTP, monitor error rates in real time, trigger threshold alerts, and analyse trends with an AI-powered insights engine.

Built with **Node.js + Express 5**, **PostgreSQL**, **BullMQ + Redis**, and the **Anthropic Claude API**. Frontend in **React + Vite + Recharts**.

---

## Phase Progress

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Express boilerplate, folder structure, env config | ✅ Complete |
| 2 | PostgreSQL schema, migrations, DB connection pool | ✅ Complete |
| 3 | Auth system — register, login, JWT middleware | ✅ Complete |
| 4 | App management — create app, API key generation | ✅ Complete |
| 5 | Log ingestion API + Zod + rate limiting | ⬜ Next |
| 6 | Analysis engine (CTEs, window functions) | ⬜ Upcoming |
| 7 | Alert system (threshold + cooldown) | ⬜ Upcoming |
| 8 | React frontend (Vite + Recharts dashboard) | ⬜ Upcoming |
| 9 | AI insights (Anthropic Claude API) | ⬜ Upcoming |
| 10 | Docker + deployment (Render + Supabase) | ⬜ Upcoming |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express 5 |
| Database | PostgreSQL (dev) → Supabase (prod) |
| Validation | Zod |
| Auth | JWT + bcrypt |
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

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32-character random string |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `REDIS_URL` | Redis connection (Phase 5) |
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
| POST | `/api/logs` | API Key | Ingest a log entry *(Phase 5)* |
| GET | `/api/logs` | JWT | Query logs *(Phase 5)* |
| GET | `/api/analysis` | JWT | Error rates + trends *(Phase 6)* |
| GET | `/api/alerts` | JWT | Alert rules *(Phase 7)* |
| GET | `/api/ai/insights` | JWT | AI-powered analysis *(Phase 9)* |

### Auth Header Format
```
Authorization: Bearer <jwt_token>
x-api-key: <app_api_key>   (for log ingestion — Phase 5)
```

### Login Response Shape
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "email": "user@example.com", "created_at": "..." }
  }
}
```

---

## Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Start for production
npm test              # Run all tests
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
│   │   ├── db.js        # pg connection pool
│   │   └── env.js       # fail-fast env validation
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── logger.js    # structured JSON logger
│   └── features/
│       ├── auth/        # register, login, JWT middleware
│       ├── apps/        # app management, API key generation ✅
│       ├── logs/        # Phase 5
│       ├── analysis/    # Phase 6
│       ├── alerts/      # Phase 7
│       └── ai/          # Phase 9
├── tests/
├── app.js               # Express config (exported for tests)
├── server.js            # HTTP server + graceful shutdown
└── .env.example
```

---

## Architecture Decisions

- **Express 5** — async errors auto-propagate to error handler, no try/catch needed in routes
- **app.js / server.js split** — app.js is importable in tests without binding a port
- **Raw SQL over ORM** — Phase 6 analysis engine needs CTEs and window functions
- **JWT for user auth, API keys for log ingestion** — service credentials are long-lived and safe to embed in env vars
- **`ls_` prefix on API keys** — namespaced, detectable by secret scanners like gitleaks
- **Plaintext API key storage** — hashing would add ~250ms bcrypt latency to every log ingestion request
- **Zod validation with try/catch** — ZodErrors caught in middleware return 400, never bubble to 500
- **bcrypt cost 12** — ~250ms per hash, standard for production password hashing
