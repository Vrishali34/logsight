# LogSight

A production-style **System Monitoring & Alerting Platform**. Ingest logs from your services via HTTP, monitor error rates in real time, trigger threshold alerts, and analyse trends with an AI-powered insights engine.

Built with **Node.js + Express 5**, **PostgreSQL**, **BullMQ + Redis**, **Anthropic Claude API**, and a **React + Vite + Recharts** frontend dashboard.

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
| 9 | AI insights — Anthropic Claude API | ⬜ Next |
| 10 | Docker + deployment — Render + Supabase | ⬜ Upcoming |

**Tests: 26 passing** across 4 suites

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

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

cp .env.example .env
# Fill in your values in .env

npm run migrate:up
```

**Run the full stack (two terminals):**

```bash
# Terminal 1 — backend API
npm run dev        # http://localhost:3000

# Terminal 2 — React frontend
npm run client     # http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Dashboard Features

| Tab | What you see |
|-----|-------------|
| **Overview** | Error rate %, total/error/warn/info/debug counts, hourly trend chart, per-service breakdown |
| **Logs** | Last 50 logs, filterable by level (error/warn/info/debug) |
| **Alerts** | Create threshold rules, see last triggered time, delete rules |

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
| `ANTHROPIC_API_KEY` | Claude API key (Phase 9) |
| `FRONTEND_URL` | React app URL for CORS in prod (Phase 10) |

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
| GET | `/api/ai/insights` | JWT | AI analysis *(Phase 9)* |

---

## Scripts

```bash
npm run dev           # Backend (nodemon)
npm run client        # Frontend (Vite dev server)
npm start             # Backend production
npm test              # Run all tests (26 passing)
npm run migrate:up    # Run pending DB migrations
npm run migrate:down  # Roll back last migration
```

---

## Project Structure

```
logsight/
├── client/               # React frontend
│   ├── index.html
│   ├── vite.config.js    # /api proxy → localhost:3000
│   └── src/
│       ├── App.jsx        # auth gate
│       ├── api.js         # fetch helper
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Summary.jsx
│       ├── TrendsChart.jsx
│       ├── ServicesTable.jsx
│       ├── LogViewer.jsx
│       └── AlertsPanel.jsx
├── src/
│   └── features/
│       ├── auth/  ✅
│       ├── apps/  ✅
│       ├── logs/  ✅
│       ├── analysis/ ✅
│       ├── alerts/   ✅
│       └── ai/       (Phase 9)
├── tests/               # 26 tests, 4 suites
├── app.js
└── server.js
```
