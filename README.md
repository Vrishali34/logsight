# LogSight

**Production-grade real-time log monitoring platform with AI-powered analysis.**

<div align="center">

[Live Demo](https://logsight.onrender.com) · [Architecture](#architecture) · [API Docs](#api-reference)

[![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

</div>

---

## Problem

Modern applications generate hundreds of logs per second. Without proper monitoring:
- **Detection lag**: Errors go unnoticed for hours
- **Manual correlation**: Engineers spend time connecting log dots
- **No context**: Raw logs without actionable insights
- **Alert overload**: Metrics without thresholds

LogSight solves this with **real-time aggregation**, **threshold-based alerting**, and **AI-powered analysis**.

---

## Overview

LogSight is a full-stack monitoring platform that:

1. **Ingests logs** via HTTP API (no SDKs, simple JSON POST)
2. **Computes metrics** in real-time (error rate, trends, service breakdown)
3. **Triggers alerts** when metrics exceed configured thresholds
4. **Analyzes patterns** with natural language using Groq AI

All data is **user-isolated** and queryable by time window (1–168 hours).

---

## Architecture

### Components Overview

```
┌──────────────────────┐
│  Your Application    │
│  (Any Language)      │
└──────────┬───────────┘
           │ POST /api/logs
           │ { level, message, service, metadata }
           ↓
┌──────────────────────────────────────┐
│  Node.js + Express 5                 │
├──────────────────────────────────────┤
│ ✓ Input validation (Zod)             │
│ ✓ Authorization checks (Fix 1)       │
│ ✓ Rate limiting (Fix 2)              │
│ ✓ API key validation                 │
│ ✓ Error handling middleware          │
└──────────┬─────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  PostgreSQL 18 (Supabase)            │
├──────────────────────────────────────┤
│ ✓ Normalized schema                  │
│ ✓ Indexed queries (app_id, created)  │
│ ✓ Window functions for percentiles   │
│ ✓ FILTER aggregates for multi-level  │
│ ✓ DATE_TRUNC for time bucketing      │
└──────────┬─────────────────────────┘
           │
    ┌──────┴──────┬──────────┬────────────┐
    │             │          │            │
    ↓             ↓          ↓            ↓
  Raw SQL  Single Query   Window Funcs  Indexes
  (no ORM) (minimize RTT)  (percentiles) (hot paths)
    │             │          │            │
    └──────┬──────┴──────────┴────────────┘
           │
           ↓ Metrics: summary, trends, services
┌──────────────────────────────────────┐
│  React 18 + Vite                     │
├──────────────────────────────────────┤
│ ✓ Interactive dashboards             │
│ ✓ Real-time data refresh             │
│ ✓ Recharts (line/bar charts)         │
│ ✓ Error/warning/info breakdown       │
│ ✓ Service-level analytics            │
└──────────┬─────────────────────────┘
           │
           ↓ AI requests
┌──────────────────────────────────────┐
│  Groq API (Llama 3.3 70B)            │
├──────────────────────────────────────┤
│ ✓ Natural language analysis          │
│ ✓ Trend detection                    │
│ ✓ Root cause suggestions             │
│ ✓ Isolated service layer             │
└──────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Raw SQL** | Complex aggregations (FILTER, DATE_TRUNC, window functions) | Manual query optimization needed |
| **Single query** | Minimize database round-trips | Larger result set to parse |
| **Express** | Lightweight, async error handling, extensive middleware | Minimal framework abstraction |
| **JWT** | Stateless, scales without session storage | Can't revoke tokens mid-flight |
| **Groq** | Provider-agnostic, excellent price/performance | Newer ecosystem than OpenAI |
| **Supabase pooler** | Works on Render free tier (IPv4) | Extra network hop (minimal impact) |

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | v24.1.0 | Server runtime (CommonJS throughout) |
| **Framework** | Express | 5.0.0 | REST API, routing, middleware |
| **Database** | PostgreSQL | 18.3 | Time-series logs, metadata |
| **Validation** | Zod | Latest | Schema validation on endpoints |
| **Auth** | JWT | jsonwebtoken 9.x | Stateless authentication |
| **Security** | express-rate-limit | Latest | Rate limiting (10 attempts/15min) |
| **Frontend** | React 18 + Vite | Latest | Interactive dashboard |
| **Charts** | Recharts | Latest | Data visualization |
| **Testing** | Jest + Supertest | Latest | 26 tests (all critical paths) |
| **AI** | Groq SDK | Latest | Llama 3.3 70B (~1–3s latency) |
| **Deployment** | Render + Supabase | — | Cloud hosting + database |

---

## Quick Start

### Prerequisites
- Node.js v24+
- PostgreSQL 18 (local) or Supabase (cloud)
- Groq API key ([free](https://console.groq.com))

### Setup

```bash
git clone https://github.com/Vrishali34/logsight.git
cd logsight

# Install dependencies
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit: DATABASE_URL, JWT_SECRET, GROQ_API_KEY

# Start development
npm run dev          # Backend @ localhost:3000
npm run client       # Frontend @ localhost:5173

# Run tests
npm test             # 26 tests passing
```

---

## API Reference

### Authentication

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"YourPassword"}'

# Response: { success: true, user: {...}, token: "..." }

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"YourPassword"}'
```

### Create App & Get API Key

```bash
TOKEN="<your jwt token>"

curl -X POST http://localhost:3000/api/apps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Service"}'

# Response: { success: true, app: { id, api_key, ... } }
```

### Log Ingestion

```bash
API_KEY="<your api key>"

curl -X POST http://localhost:3000/api/logs \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Database connection timeout",
    "service": "user-service",
    "metadata": {"user_id": 123, "retry_count": 3}
  }'
```

### Analytics

```bash
TOKEN="<your jwt token>"

# Summary metrics (24 hours)
curl "http://localhost:3000/api/analysis/summary?app_id=1&hours=24" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "error_rate": 5.23,
#   "error_count": 52,
#   "warning_count": 123,
#   "total_logs": 1000,
#   "period_hours": 24
# }

# Hourly trends
curl "http://localhost:3000/api/analysis/trends?app_id=1&hours=24" \
  -H "Authorization: Bearer $TOKEN"

# Per-service breakdown
curl "http://localhost:3000/api/analysis/services?app_id=1&hours=24" \
  -H "Authorization: Bearer $TOKEN"
```

### Alert Rules

```bash
# Create alert (trigger when error_count > 10)
curl -X POST http://localhost:3000/api/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": 1,
    "metric": "error_count",
    "threshold": 10,
    "cooldown_minutes": 15
  }'

# Get alerts
curl "http://localhost:3000/api/alerts?app_id=1" \
  -H "Authorization: Bearer $TOKEN"

# Delete alert
curl -X DELETE "http://localhost:3000/api/alerts/1?app_id=1" \
  -H "Authorization: Bearer $TOKEN"
```

### AI Insights

```bash
# Get natural language analysis
curl "http://localhost:3000/api/ai/insights?app_id=1&hours=24" \
  -H "Authorization: Bearer $TOKEN"

# Response: { success: true, insights: "Trending error: Database..." }
```

---

## Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | None | Create user |
| POST | `/api/auth/login` | None | Get JWT token |
| GET | `/api/auth/verify` | JWT | Verify token |
| POST | `/api/apps` | JWT | Create monitored app |
| GET | `/api/apps` | JWT | List apps |
| POST | `/api/logs` | API Key | Ingest log |
| GET | `/api/logs` | JWT | Query logs |
| GET | `/api/analysis/summary` | JWT | Error rate, counts |
| GET | `/api/analysis/trends` | JWT | Hourly distribution |
| GET | `/api/analysis/services` | JWT | Per-service breakdown |
| POST | `/api/alerts` | JWT | Create alert rule |
| GET | `/api/alerts` | JWT | List alert rules |
| DELETE | `/api/alerts/:id` | JWT | Delete alert rule |
| GET | `/api/ai/insights` | JWT | AI analysis |

---

## Database Schema

### Core Tables

```sql
-- Users (authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apps (monitored applications)
CREATE TABLE apps (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR NOT NULL,
  api_key VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Logs (immutable event stream)
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  app_id INT REFERENCES apps(id),
  level VARCHAR NOT NULL,
  message TEXT NOT NULL,
  service VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
-- Key index: (app_id, created_at) for time-series queries

-- Alert Rules (thresholds)
CREATE TABLE alert_rules (
  id SERIAL PRIMARY KEY,
  app_id INT REFERENCES apps(id),
  metric VARCHAR NOT NULL,
  threshold INT NOT NULL,
  cooldown_minutes INT,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Query Strategy

All analytics computed in **single round-trip**:

```sql
SELECT 
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level = 'error') as error_count,
  COUNT(*) FILTER (WHERE level = 'warning') as warning_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE level = 'error') / COUNT(*),
    2
  ) as error_rate
FROM logs
WHERE app_id = $1
  AND created_at > NOW() - INTERVAL '1 hour' * $2;
```

**Why single query?**
- Minimize database round-trips
- Atomic snapshot of metrics
- Lower latency for dashboard

---

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| **API request** | <100ms | After warm-up (excludes AI) |
| **Summary query** | 5–20ms | Indexed on (app_id, created_at) |
| **Authorization check** | 2–5ms | Single index lookup |
| **Trends query** | 10–30ms | GROUP BY with window functions |
| **AI analysis** | 1–3s | Groq network latency |

### Optimization Details

- **Indexes**: `(app_id, created_at)` on logs table (time-series pattern)
- **Strategy**: GROUP BY with FILTER aggregates (no temporary tables)
- **Window functions**: For percentiles without joining back
- **Partitioning**: Ready for future scaling (by month)

---

## Security

### Authorization (Fix 1)
✅ Every endpoint verifies user owns resource:
```javascript
const ownershipCheck = await pool.query(
  'SELECT id FROM apps WHERE id = $1 AND user_id = $2',
  [appId, req.user.userId]
);
if (!ownershipCheck.rows.length) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Rate Limiting (Fix 2)
✅ Login/register limited to 10 attempts per 15 minutes:
- Per-IP tracking
- Returns HTTP 429 when exceeded
- Prevents brute force attacks

### Input Validation (Fix 3)
✅ Zod schemas validate all inputs:
- Hours parameter: capped at 1–168 (prevents DoS)
- Log level: whitelist (error, warning, info, debug)
- Alert threshold: 1–10000 range
- Message length: max 1000 characters
- Service name: max 100 characters

---

## Testing

```bash
npm test

# Coverage:
# ✓ Auth (register, login, JWT)
# ✓ Apps (create, list)
# ✓ Logs (ingest, query, filter)
# ✓ Analysis (summary, trends, services)
# ✓ Alerts (create, check, delete)
# ✓ Security (authorization, rate limiting)
#
# Total: 26 tests, 0 failures
```

---

## Deployment

### Production (Render + Supabase)

```bash
# Push to main branch
git push origin main

# Render automatically:
# 1. npm install
# 2. cd client && npm run build && cd ..
# 3. node server.js
# 4. Live at https://logsight.onrender.com
```

**Database**: PostgreSQL 18 on Supabase (ap-southeast-1)  
**Build time**: ~2 minutes  
**Cold start**: 30–60 seconds (Render free tier)

### Docker (Local Development)

```bash
docker-compose up --build
```

---

## Project Structure

```
logsight/
├── client/                      # React frontend
│   └── src/
│       ├── Dashboard.jsx        # Main layout
│       ├── Summary.jsx          # Metrics cards
│       ├── TrendsChart.jsx      # Hourly line chart
│       ├── ServicesTable.jsx    # Service breakdown
│       ├── LogViewer.jsx        # Raw logs view
│       ├── AlertsPanel.jsx      # Rule management
│       └── AIInsights.jsx       # AI analysis display
│
├── src/                         # Node.js backend
│   ├── features/
│   │   ├── auth/                # register, login, JWT
│   │   ├── apps/                # CRUD, API key generation
│   │   ├── logs/                # ingest, query, filter
│   │   ├── analysis/            # summary, trends, services
│   │   ├── alerts/              # create, check, delete
│   │   └── ai/                  # Groq integration
│   ├── config/                  # db, env
│   ├── middleware/              # error handling, auth
│   └── utils/                   # logger, validators
│
├── tests/                       # Jest suite
│   ├── auth.test.js
│   ├── apps.test.js
│   ├── logs.test.js
│   ├── analysis.test.js
│   └── alerts.test.js
│
├── migrations/                  # Database schema
├── app.js                       # Express setup
├── server.js                    # Entry point
├── Dockerfile                   # Multi-stage build
├── docker-compose.yml           # Local development
├── LICENSE                      # MIT License
└── README.md                    # This file
```

---

## Screenshots

### Authentication
![Sign Up](docs/screenshots/sign-up%20page.png)

### Dashboard & Real-time Analytics
![Dashboard Overview](docs/screenshots/dashboard-overview.png)

### Log Ingestion & Monitoring
![Recent Logs](docs/screenshots/Recent%20logs.png)

### Alert Management
![Alert Rule Fired](docs/screenshots/Alert%20rule%20fired.png)

### AI-Powered Insights
![AI Insights](docs/screenshots/AI%20insights.png)

## Environment Variables

```bash
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:pass@localhost:5432/logsight
JWT_SECRET=<32+ character random string>
JWT_EXPIRES_IN=7d

GROQ_API_KEY=<your Groq API key>

FRONTEND_URL=http://localhost:5173
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Development

```bash
npm run dev       # Backend with nodemon
npm run client    # Frontend with Vite
npm test          # Run all tests
```

---

## Known Limitations

| Limitation | Impact |
|-----------|--------|
| No pagination on logs | Works for <100k logs (suitable for demo) |
| Render free tier cold starts | ~30–60s first request daily |
| Single region deployment | ~200ms latency from other regions |
| No caching layer | Repeat queries hit DB (acceptable for current scale) |

---

## License

MIT - See [LICENSE](LICENSE) file for details

Copyright (c) 2025 Vrishali J

---
