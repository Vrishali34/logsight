/**
 * app.js — Express application configuration.
 * 
 * Deliberately separated from server.js so this module
 * can be imported cleanly in tests (Supertest pattern).
 * If server.js was the entry point for tests, it would
 * try to bind a port — that breaks parallel test runs.
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { validateEnv } = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');

// Validate env variables before anything else runs
validateEnv();

const app = express();

// ── Security middleware ──────────────────────────────────────────
// helmet sets 14 HTTP security headers in one call
// e.g. X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────
// In prod, replace '*' with your actual frontend domain
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// ── Request parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));         // JSON body parser
app.use(express.urlencoded({ extended: true }));  // Form data parser

// ── HTTP request logging ──────────────────────────────────────────
// 'dev' format in dev, 'combined' (Apache-style) in prod
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check ──────────────────────────────────────────────────
// Always expose this — used by Docker, Render, load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LogSight API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API routes (added phase by phase) ────────────────────────────
app.use('/api/auth',     require('./src/features/auth/auth.routes'));
app.use('/api/apps',     require('./src/features/apps/apps.routes'));       // Phase 4 ✅
app.use('/api/logs',     require('./src/features/logs/logs.routes'));       // Phase 5 ✅
app.use('/api/analysis', require('./src/features/analysis/analysis.routes')); // Phase 6 ✅
app.use('/api/alerts',  require('./src/features/alerts/alerts.routes')); // Phase 7

app.use('/api/ai',     require('./src/features/ai/ai.routes'));       // Phase 9 ✅


// ── Serve React frontend in production ────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client/dist')));

  // Any route not matched by the API returns index.html
  // This allows React Router to handle client-side navigation
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found` },
  });
});

// ── Global error handler (must be last) ───────────────────────────
app.use(errorHandler);

module.exports = app;