const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { message: err.message });
  process.exit(1);
});

async function connectDB() {
  const client = await pool.connect();
  logger.info('✅ Database connected successfully');
  client.release();
}

module.exports = { pool, connectDB };