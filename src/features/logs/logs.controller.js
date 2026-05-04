const { pool } = require('../../config/db');
const logsService    = require('./logs.service');
const { checkAlerts } = require('../alerts/alerts.service');

/**
 * Authorization Check Pattern:
 * For ingestLog: API key already tied to app (req.app_record), so no additional check needed
 * For queryLogs: User is making the request, so verify they own the app
 */

const ingestLog = async (req, res) => {
  const { level, message, service, metadata } = req.body;

  const log = await logsService.createLog({
    appId: req.app_record.id,
    level,
    message,
    service,
    metadata,
  });

  // Check alert rules after every log ingestion
  const triggeredAlerts = await checkAlerts(req.app_record.id);

  res.status(201).json({
    success: true,
    log,
    alerts: triggeredAlerts, // empty array [] if nothing triggered
  });
};

const queryLogs = async (req, res) => {
  const { level, service, limit, offset } = req.query;
  const appId = req.app_record?.id || parseInt(req.query.app_id);

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' }
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
  // If not using API key (req.app_record), verify user owns the app
  if (!req.app_record) {
    try {
      const ownershipCheck = await pool.query(
        'SELECT id FROM apps WHERE id = $1 AND user_id = $2',
        [appId, req.user.userId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' }
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { message: 'Authorization check failed' }
      });
    }
  }
  // ✅ END FIX 1

  const logs = await logsService.getLogs({
    appId,
    level,
    service,
    limit:  parseInt(limit) || 50,
    offset: parseInt(offset) || 0,
  });

  res.json({ success: true, count: logs.length, logs });
};

module.exports = { ingestLog, queryLogs };