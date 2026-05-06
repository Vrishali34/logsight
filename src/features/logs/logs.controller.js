const { pool } = require('../../config/db');
const logsService = require('./logs.service');
const alertsService = require('../alerts/alerts.service');

exports.ingestLog = async (req, res, next) => {
  try {
    const { level, message, service, metadata } = req.body;

    // Validate level
    const validLevels = ['error', 'warning', 'info', 'debug'];
    if (!level || !validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        error: { message: `level must be one of: ${validLevels.join(', ')}` }
      });
    }

    // Validate message (required, string, max 1000 chars)
    if (!message || typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: { message: 'message is required and must be < 1000 characters' }
      });
    }

    // Validate service (optional, string, max 100 chars)
    if (service && (typeof service !== 'string' || service.length > 100)) {
      return res.status(400).json({
        success: false,
        error: { message: 'service must be < 100 characters' }
      });
    }

    // Create log
    const log = await logsService.createLog(
      req.app_record.id,
      level,
      message,
      service || 'unknown',
      metadata
    );

    // Check alerts
    const alerts = await alertsService.checkAlerts(req.app_record.id);

    res.status(201).json({
      success: true,
      log,
      alerts
    });
  } catch (err) {
    next(err);
  }
};

exports.queryLogs = async (req, res, next) => {
  try {
    const appId = parseInt(req.query.app_id, 10);
    const level = req.query.level;
    const service = req.query.service;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 1000); // Cap at 1000
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    // Validate app_id
    if (!appId || appId < 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'app_id query parameter is required' }
      });
    }

    // Validate level if provided
    const validLevels = ['error', 'warning', 'info', 'debug'];
    if (level && !validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        error: { message: `level must be one of: ${validLevels.join(', ')}` }
      });
    }

    // Authorization check (only for JWT auth, not API key)
    if (!req.app_record) {
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
    }

    // Query logs
    const logs = await logsService.getLogs(appId, { level, service, limit, offset });

    res.json({
      success: true,
      count: logs.length,
      offset,
      limit,
      logs
    });
  } catch (err) {
    next(err);
  }
};
