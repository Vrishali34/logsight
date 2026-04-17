const { pool } = require('../../config/db');

const createRule = async ({ appId, metric, threshold, cooldownMinutes }) => {
  const { rows } = await pool.query(
    `INSERT INTO alert_rules (app_id, metric, threshold, cooldown_minutes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, app_id, metric, threshold, cooldown_minutes, created_at`,
    [appId, metric, threshold, cooldownMinutes || 10]
  );
  return rows[0];
};

const getRules = async (appId) => {
  const { rows } = await pool.query(
    `SELECT id, app_id, metric, threshold, cooldown_minutes, last_triggered, created_at
     FROM alert_rules
     WHERE app_id = $1
     ORDER BY created_at DESC`,
    [appId]
  );
  return rows;
};

const deleteRule = async (ruleId, appId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM alert_rules
     WHERE id = $1 AND app_id = $2`,
    [ruleId, appId]
  );
  return rowCount > 0;
};

/**
 * Called after every log ingestion.
 * Checks all rules for this app — fires those whose threshold is breached
 * and whose cooldown has expired.
 */
const checkAlerts = async (appId) => {
  const rules = await getRules(appId);
  if (rules.length === 0) return [];

  // Calculate current error rate over the last 60 minutes
  const { rows: rateRows } = await pool.query(
    `SELECT
       ROUND(
         COUNT(*) FILTER (WHERE level = 'error')::NUMERIC
         / NULLIF(COUNT(*), 0) * 100, 2
       ) AS error_rate
     FROM logs
     WHERE app_id = $1
       AND timestamp >= NOW() - INTERVAL '60 minutes'`,
    [appId]
  );

  const errorRate = parseFloat(rateRows[0].error_rate) || 0;
  const triggered = [];

  for (const rule of rules) {
    if (rule.metric !== 'error_rate') continue;

    const thresholdBreached = errorRate > parseFloat(rule.threshold);

    // Check cooldown — is enough time has passed since last trigger?
    const cooldownExpired = !rule.last_triggered ||
      new Date() - new Date(rule.last_triggered) >
      rule.cooldown_minutes * 60 * 1000;

    if (thresholdBreached && cooldownExpired) {
      await pool.query(
        `UPDATE alert_rules SET last_triggered = NOW() WHERE id = $1`,
        [rule.id]
      );
      triggered.push({
        rule_id:    rule.id,
        metric:     rule.metric,
        threshold:  rule.threshold,
        actual:     errorRate,
        message:    `Error rate ${errorRate}% exceeded threshold ${rule.threshold}%`,
      });
    }
  }

  return triggered;
};

module.exports = { createRule, getRules, deleteRule, checkAlerts };