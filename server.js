require('dotenv').config();

const app = require('./app');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  // Verify DB connection before accepting any HTTP traffic
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info('LogSight API running', {
      port: PORT,
      environment: process.env.NODE_ENV,
      url: `http://localhost:${PORT}`,
    });
  });

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
}

startServer();