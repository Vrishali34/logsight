/**
 * server.js — HTTP server entry point.
 * 
 * Only responsibility: import app and bind to a port.
 * Handles graceful shutdown so in-flight requests complete
 * before the process exits (important in Docker/Kubernetes).
 */

const app = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`LogSight API running`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    url: `http://localhost:${PORT}`,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────
// On SIGTERM (Docker stop, Render deploy), finish in-flight requests
// before closing. Without this, you get dropped requests on deploys.
process.on('SIGTERM', () => {
  logger.warn('SIGTERM received — shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warn('SIGINT received — shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});