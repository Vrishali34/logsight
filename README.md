# LogSight — System Monitoring & Alerting Platform

> Production-grade log monitoring platform with real-time analytics, threshold alerts, and AI-powered insights.

**Live Demo:** https://logsight.onrender.com

## Overview

LogSight is a full-stack monitoring platform that enables developers to:
- 📊 **Ingest logs** via simple HTTP API
- 📈 **Monitor error rates** in real time with interactive dashboards
- 🚨 **Trigger alerts** when metrics exceed thresholds
- 🤖 **Get AI insights** with plain-English analysis using Groq + Llama 3

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + Express 5 | REST API, routing, middleware |
| **Database** | PostgreSQL (Supabase) | Log storage, app metadata, alert rules |
| **Frontend** | React + Vite + Recharts | Interactive dashboard, real-time charts |
| **Auth** | JWT + bcrypt | Secure user authentication |
| **Security** | Helmet.js + express-rate-limit | Headers, rate limiting |
| **Validation** | Zod | Input validation, schema enforcement |
| **AI** | Groq SDK + Llama 3.3 70B | Natural language log analysis |
| **Testing** | Jest + Supertest | Unit and integration tests (26 passing) |
| **Deployment** | Render + Supabase | Cloud hosting and database |

## Quick Start

### Prerequisites
- Node.js v24+
- PostgreSQL 18+
- Groq API key (free at console.groq.com)

### Local Development

```bash
# Clone the repository
git clone https://github.com/Vrishali34/logsight.git
cd logsight

# Install dependencies
npm install
cd client && npm install && cd ..

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and Groq API key

# Start backend (Terminal 1)
npm run dev
# Backend runs on http://localhost:3000

# Start frontend (Terminal 2)
npm run client
# Frontend runs on http://localhost:5173

# Run tests
npm test
# 26 tests passing
```

## Features

### 🔐 Authentication & Security

**What's Protected:**
- ✅ User registration with email & password
- ✅ JWT-based authentication (7-day expiry)
- ✅ bcrypt password hashing
- ✅ Authorization checks on all user endpoints
- ✅ Rate limiting: 10 attempts per 15 minutes on login
- ✅ Input validation with Zod schema enforcement
- ✅ API keys for machine-to-machine ingestion
- ✅ Helmet.js security headers

**Authorization Pattern (Implemented):**
Every endpoint that accesses user data verifies ownership before returning:
```javascript
// Example: Before returning analytics, check ownership
const ownershipCheck = await pool.query(
  'SELECT id FROM apps WHERE id = $1 AND user_id = $2',
  [appId, req.user.userId]
);

if (ownershipCheck.rows.length === 0) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### 📊 Log Ingestion & Storage

**HTTP API:**
```bash
curl -X POST https://logsight.onrender.com/api/logs \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Database connection timeout",
    "service": "user-service",
    "metadata": {"user_id": 123, "retry_count": 3}
  }'
```

**Supported Log Levels:**
- error
- warning
- info
- debug

**Storage:**
- PostgreSQL with optimized indexes
- Automatic timestamp recording
- Metadata stored as JSONB (queryable)
- Partition strategy for large datasets

### 📈 Real-Time Analytics

**Summary Metrics:**
- Total logs ingested
- Error count & error rate percentage
- Warning and info counts
- Time period selection (1-168 hours, defaults to 24)

**Trends:**
- Hourly distribution of log levels
- Line chart visualization
- Detects spikes in error rates

**Service Breakdown:**
- Per-service error rates
- Service comparison table
- Identifies problematic services

### 🚨 Alert System

**Features:**
- Threshold-based alerts (e.g., "Alert if error count > 10")
- Cooldown period (prevent alert spam)
- Real-time trigger on log ingestion
- Dashboard rule management

**Supported Metrics:**
- error_count
- warning_count
- total_logs

```bash
# Create an alert rule
curl -X POST https://logsight.onrender.com/api/alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": 1,
    "metric": "error_count",
    "threshold": 10,
    "cooldown_minutes": 15
  }'
```

### 🤖 AI Insights

**Powered by:** Groq's Llama 3.3 70B model

**Features:**
- Natural language analysis of log patterns
- Identifies trending errors
- Suggests root causes
- Contextual recommendations
- Time-windowed analysis (24h default, max 168h)

```bash
curl https://logsight.onrender.com/api/ai/insights?app_id=1&hours=24 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
logsight/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx                  # Main router
│   │   ├── api.js                   # Centralized fetch helper
│   │   ├── Login.jsx                # Auth page
│   │   ├── Register.jsx             # Registration form
│   │   ├── Dashboard.jsx            # Main dashboard layout
│   │   ├── Summary.jsx              # Summary metrics component
│   │   ├── TrendsChart.jsx          # Hourly trends visualization
│   │   ├── ServicesTable.jsx        # Service breakdown table
│   │   ├── LogViewer.jsx            # Raw logs view
│   │   ├── AlertsPanel.jsx          # Alert rules management
│   │   └── AIInsights.jsx           # AI analysis display
│   ├── vite.config.js               # Vite config (proxy to backend)
│   └── package.json
│
├── src/                             # Node.js backend (Express)
│   ├── config/
│   │   ├── db.js                    # PostgreSQL connection pool
│   │   └── env.js                   # Environment variable validation
│   ├── middleware/
│   │   └── errorHandler.js          # Global error handling
│   ├── utils/
│   │   └── logger.js                # Structured logging
│   └── features/
│       ├── auth/
│       │   ├── auth.controller.js   # Login/register logic
│       │   ├── auth.service.js      # JWT generation
│       │   ├── auth.routes.js       # /api/auth/* endpoints
│       │   └── auth.middleware.js   # JWT verification
│       ├── apps/
│       │   ├── apps.controller.js   # App CRUD
│       │   ├── apps.service.js      # App logic
│       │   └── apps.routes.js       # /api/apps endpoints
│       ├── logs/
│       │   ├── logs.controller.js   # Log ingestion & query
│       │   ├── logs.service.js      # Log storage logic
│       │   ├── logs.routes.js       # /api/logs endpoints
│       │   └── apiKey.middleware.js # API key validation
│       ├── analysis/
│       │   ├── analysis.controller.js # Analytics endpoints
│       │   ├── analysis.service.js  # SQL queries
│       │   └── analysis.routes.js   # /api/analysis/* endpoints
│       ├── alerts/
│       │   ├── alerts.controller.js # Alert rules
│       │   ├── alerts.service.js    # Rule logic + check function
│       │   └── alerts.routes.js     # /api/alerts endpoints
│       └── ai/
│           ├── ai.controller.js     # AI analysis endpoint
│           ├── ai.service.js        # Groq SDK integration
│           └── ai.routes.js         # /api/ai/insights endpoint
│
├── tests/                           # Jest test suite (26 passing)
│   ├── apps.test.js
│   ├── logs.test.js
│   ├── analysis.test.js
│   ├── alerts.test.js
│   └── auth.test.js
│
├── migrations/                      # Database schema
├── app.js                           # Express app setup
├── server.js                        # Server entrypoint
├── Dockerfile                       # Multi-stage Docker build
├── docker-compose.yml               # Local development setup
├── .env.example                     # Environment template
├── package.json                     # Dependencies
└── README.md                        # This file
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | None |
| POST | `/api/auth/login` | Login & get JWT | None |

### Apps

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/apps` | Create app (auto-generates API key) | JWT |
| GET | `/api/apps` | List user's apps | JWT |

### Logs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/logs` | Ingest a log | API Key |
| GET | `/api/logs` | Query logs with filters | JWT |

### Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analysis/summary` | Error rate, counts, totals | JWT |
| GET | `/api/analysis/trends` | Hourly distribution | JWT |
| GET | `/api/analysis/services` | Per-service breakdown | JWT |

### Alerts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/alerts` | Create alert rule | JWT |
| GET | `/api/alerts` | List alert rules | JWT |
| DELETE | `/api/alerts/:id` | Delete alert rule | JWT |

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ai/insights` | Get AI analysis | JWT |

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000

# Database (Supabase in production, local PostgreSQL in dev)
DATABASE_URL=postgresql://user:password@localhost:5432/logsight

# JWT
JWT_SECRET=your-32-character-hex-secret-key-here
JWT_EXPIRES_IN=7d

# AI
GROQ_API_KEY=gsk_your_key_here

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Security Features Implemented

### ✅ Fix 1: Authorization Checks (COMPLETE)

**Problem Solved:** Prevent cross-user data access

**Implementation:**
- Every endpoint that returns user data queries: "Does this user own this app?"
- Before returning analytics, logs, or alerts, verify ownership
- Returns HTTP 403 if user doesn't own the app
- Tested: User A cannot see User B's data ✅

**Files Modified:**
- `src/features/analysis/analysis.controller.js` (getSummary, getTrends, getServiceBreakdown)
- `src/features/logs/logs.controller.js` (queryLogs)
- `src/features/alerts/alerts.controller.js` (createRule, getRules, deleteRule)

**Testing:**
```bash
# User 1 accesses own app → 200 OK ✅
curl 'http://localhost:3000/api/analysis/summary?app_id=1' \
  -H "Authorization: Bearer $TOKEN_USER1"

# User 1 accesses User 2's app → 403 Forbidden ✅
curl 'http://localhost:3000/api/analysis/summary?app_id=2' \
  -H "Authorization: Bearer $TOKEN_USER1"
# Response: {"success":false,"error":{"message":"Access denied"}}
```

### 🔐 Authentication & Password Security

- bcrypt hashing with 10 salt rounds
- JWT tokens with 7-day expiry
- Secure password requirements enforced
- No passwords logged or exposed

### 🛡️ Input Validation

- Zod schemas for all request bodies
- Type checking and format validation
- Hours parameter capped at 168 (prevents DoS)
- API key format validation

### ⏱️ Rate Limiting

- express-rate-limit middleware
- 10 attempts per 15 minutes on login/register
- Prevents brute force attacks
- Configurable per endpoint

### 🔒 Security Headers

- Helmet.js for standard headers
- X-Frame-Options: DENY
- Content-Security-Policy enabled
- X-XSS-Protection enabled

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- logs.test.js

# Run with coverage
npm test -- --coverage
```

**Test Results:** 26 passing tests covering:
- ✅ User registration & login
- ✅ App creation & API key generation
- ✅ Log ingestion with filters
- ✅ Analytics calculations
- ✅ Alert rule creation & triggering
- ✅ AI insights generation
- ✅ Authorization checks

## Deployment

### Production (Render + Supabase)

**Hosted at:** https://logsight.onrender.com

**Deployment Process:**
1. Push to GitHub main branch
2. Render automatically builds and deploys
3. Build command: `npm install && cd client && npm install --include=dev && npm run build && cd ..`
4. Start command: `node server.js`

**Database:** Supabase PostgreSQL (ap-southeast-1)
- Uses transaction pooler URL (port 6543) for Render free tier IPv4 compatibility
- Automatic backups every 24 hours
- Row-level security disabled (authorization in app layer)

### Docker (Local Development)

```bash
docker-compose up --build
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# Database: postgresql://localhost:5432/logsight
```

## Common Tasks

### Create a Test App & Ingest Logs

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test@123"}' | jq -r '.data.token')

# 2. Create app
API_KEY=$(curl -s -X POST http://localhost:3000/api/apps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My App"}' | jq -r '.app.api_key')

# 3. Ingest logs
curl -X POST http://localhost:3000/api/logs \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Database connection failed",
    "service": "auth-service",
    "metadata": {"user_id": 123}
  }'

# 4. View analytics
curl "http://localhost:3000/api/analysis/summary" \
  -H "Authorization: Bearer $TOKEN"
```

### Set Up Alerts

```bash
# Create alert rule: Alert if error count > 5
curl -X POST http://localhost:3000/api/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": 1,
    "metric": "error_count",
    "threshold": 5,
    "cooldown_minutes": 15
  }'
```

## Architecture Highlights

### Why This Tech Stack?

**Express 5 over other frameworks:**
- ✅ Lightweight and focused
- ✅ Async error handling (no try-catch in routes)
- ✅ Extensive middleware ecosystem
- ✅ Easy to extend with custom middleware

**Raw SQL over ORM:**
- ✅ FILTER aggregates for multi-level counts
- ✅ DATE_TRUNC for time-based grouping
- ✅ NULLIF for null coalescing
- ✅ Window functions for percentile calculations
- ✅ Better performance on complex queries

**JWT + API Keys:**
- ✅ Stateless authentication (no session storage)
- ✅ API keys for service-to-service calls
- ✅ Separate concerns: user auth vs machine auth

**Groq + Llama 3:**
- ✅ Provider-agnostic (easy to swap to OpenAI, Anthropic)
- ✅ Excellent price-to-performance ratio
- ✅ 70B model understands complex log patterns
- ✅ Isolated in service layer (no vendor lock-in)

## Contributing

Improvements are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License — feel free to use for learning.

## Support

- **Issues:** GitHub Issues
- **Questions:** Check the docs or create a discussion
- **Security:** Report privately to the maintainer

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
