# LogSight 🔍

A production-style **System Monitoring & Alerting Platform**.

> Built phase by phase as a real-world engineering project.

---

## Current Status

| Phase | Feature                                        | Status         |
|-------|------------------------------------------------|----------------|
| 1     | Backend folder structure + Express boilerplate | ✅ Complete    |
| 2     | PostgreSQL schema + migrations + DB connection | ⬜ Not started |
| 3     | Auth system (register/login + JWT middleware)  | ⬜ Not started |
| 4     | App management (create app + API key)          | ⬜ Not started |
| 5     | Log ingestion API + Zod + rate limiting        | ⬜ Not started |
| 6     | Analysis engine (SQL queries)                  | ⬜ Not started |
| 7     | Alert system (threshold + cooldown)            | ⬜ Not started |
| 8     | React frontend (Vite + dashboard)              | ⬜ Not started |
| 9     | AI insights (Anthropic API)                    | ⬜ Not started |
| 10    | Docker + deployment (Render + Supabase)        | ⬜ Not started |

---

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Backend    | Node.js + Express 5                |
| Database   | PostgreSQL (dev) → Supabase (prod) |
| Validation | Zod                                |
| Auth       | JWT + bcrypt                       |
| Security   | Helmet.js + express-rate-limit     |
| Frontend   | React + Vite + Recharts            |
| Queue      | BullMQ + Redis                     |
| Testing    | Jest + Supertest                   |
| Deployment | Docker + Render                    |
| AI Layer   | Anthropic Claude API               |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
git clone https://github.com/vrishali34/logsight.git
cd logsight
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Health Check
```bash
curl http://localhost:3000/health
```

---

## Project Structure

```
logsight/
├── src/
│   ├── config/           # DB connection, env validation
│   ├── middleware/        # Auth guard, error handler, rate limiter
│   ├── utils/             # Logger, helpers, constants
│   └── features/
│       ├── auth/
│       ├── apps/
│       ├── logs/
│       ├── alerts/
│       ├── analysis/
│       └── ai/
├── tests/
├── app.js
├── server.js
└── package.json
```

---

## Scripts

```bash
npm run dev         # Start with nodemon (hot reload)
npm start           # Production start
npm test            # Run Jest test suite
npm run test:watch  # Watch mode
```

---

## Available Endpoints

| Method | Endpoint | Description         | Auth |
|--------|----------|---------------------|------|
| GET    | /health  | Server health check | None |

> More endpoints added as phases complete.

---

