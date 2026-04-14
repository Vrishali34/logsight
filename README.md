# LogSight 🔍

A production-style **System Monitoring & Alerting Platform**.

> Built phase by phase as a real-world engineering project.

---

## Current Status

| Phase | Feature                                        | Status         |
|-------|------------------------------------------------|----------------|
| 1     | Backend folder structure + Express boilerplate | ✅ Complete    |
| 2     | PostgreSQL schema + migrations + DB connection | ✅ Complete    |
| 3     | Auth system (register/login + JWT middleware)  | ✅ Complete    |
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
git clone https://github.com/Vrishali34/logsight.git
cd logsight
npm install
cp .env.example .env
# Fill in your values in .env
npm run migrate:up
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
├── migrations/            # Versioned database schema files
├── src/
│   ├── config/            # DB connection, env validation
│   ├── middleware/         # Error handler
│   ├── utils/              # Logger
│   └── features/
│       ├── auth/           # register, login, JWT middleware
│       ├── apps/           # Phase 4
│       ├── logs/           # Phase 5
│       ├── alerts/         # Phase 7
│       ├── analysis/       # Phase 6
│       └── ai/             # Phase 9
├── tests/
├── app.js
├── server.js
└── package.json
```

---

## Database

4 tables managed via `node-pg-migrate`:

| Table        | Purpose                           |
|--------------|-----------------------------------|
| users        | Registered accounts               |
| apps         | Monitored applications + API keys |
| logs         | Ingested log entries              |
| alert_rules  | Threshold rules with cooldown     |

```bash
npm run migrate:up    # run migrations
npm run migrate:down  # roll back last migration
```

---

## Available Endpoints

| Method | Endpoint              | Description          | Auth    |
|--------|-----------------------|----------------------|---------|
| GET    | /health               | Server health check  | None    |
| POST   | /api/auth/register    | Register new user    | None    |
| POST   | /api/auth/login       | Login + get JWT      | None    |

> More endpoints added as phases complete.

---

## Scripts

```bash
npm run dev           # Start with nodemon (hot reload)
npm start             # Production start
npm test              # Run Jest test suite
npm run migrate:up    # Run all pending migrations
```

---

