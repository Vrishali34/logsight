const { pool } = require('../../config/db');

const createLog = async ({ appId, level, message, service, metadata }) => {
  const { rows } = await pool.query(
    `INSERT INTO logs (app_id, level, message, service, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, app_id, level, message, service, metadata, timestamp`,
    [appId, level, message, service || null, metadata || {}]
  );
  return rows[0];
};

const getLogs = async ({ appId, level, service, limit, offset }) => {
  const conditions = ['app_id = $1'];
  const values = [appId];
  let idx = 2;

  if (level) {
    conditions.push(`level = $${idx++}`);
    values.push(level);
  }

  if (service) {
    conditions.push(`service = $${idx++}`);
    values.push(service);
  }

  values.push(limit || 50);
  values.push(offset || 0);

  const query = `
    SELECT id, level, message, service, metadata, timestamp
    FROM logs
    WHERE ${conditions.join(' AND ')}
    ORDER BY timestamp DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;

  const { rows } = await pool.query(query, values);
  return rows;
};

module.exports = { createLog, getLogs };