const { pool } = require('../../config/db');

/**
 * Overall summary: total logs, breakdown by level, error rate
 */
const getSummary = async (appId, hours = 24) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*)                                          AS total,
       COUNT(*) FILTER (WHERE level = 'error')          AS errors,
       COUNT(*) FILTER (WHERE level = 'warn')           AS warnings,
       COUNT(*) FILTER (WHERE level = 'info')           AS info,
       COUNT(*) FILTER (WHERE level = 'debug')          AS debug,
       ROUND(
         COUNT(*) FILTER (WHERE level = 'error')::NUMERIC
         / NULLIF(COUNT(*), 0) * 100, 2
       )                                                AS error_rate_percent
     FROM logs
     WHERE app_id = $1
       AND timestamp >= NOW() - ($2 || ' hours')::INTERVAL`,
    [appId, hours]
  );
  return rows[0];
};

/**
 * Hourly log volume — one row per hour bucket
 */
const getTrends = async (appId, hours = 24) => {
  const { rows } = await pool.query(
    `SELECT
       DATE_TRUNC('hour', timestamp)         AS hour,
       COUNT(*)                              AS total,
       COUNT(*) FILTER (WHERE level = 'error') AS errors
     FROM logs
     WHERE app_id = $1
       AND timestamp >= NOW() - ($2 || ' hours')::INTERVAL
     GROUP BY hour
     ORDER BY hour ASC`,
    [appId, hours]
  );
  return rows;
};

/**
 * Per-service breakdown — error count and rate per service
 */
const getServiceBreakdown = async (appId, hours = 24) => {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(service, 'unknown')                       AS service,
       COUNT(*)                                           AS total,
       COUNT(*) FILTER (WHERE level = 'error')           AS errors,
       ROUND(
         COUNT(*) FILTER (WHERE level = 'error')::NUMERIC
         / NULLIF(COUNT(*), 0) * 100, 2
       )                                                  AS error_rate_percent
     FROM logs
     WHERE app_id = $1
       AND timestamp >= NOW() - ($2 || ' hours')::INTERVAL
     GROUP BY service
     ORDER BY errors DESC`,
    [appId, hours]
  );
  return rows;
};

module.exports = { getSummary, getTrends, getServiceBreakdown };