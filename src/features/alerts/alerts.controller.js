const { pool } = require('../../config/db');
const alertsService = require('./alerts.service');

// Valid metrics
const VALID_METRICS = ['error_count', 'warning_count', 'total_logs'];

// Helper: Validate integer
const validateIntParam = (value, min, max) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
};

exports.createRule = async (req, res, next) => {
  try {
    const { app_id, metric, threshold, cooldown_minutes } = req.body;

    // Validate app_id
    if (!app_id || !Number.isInteger(app_id) || app_id < 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'app_id must be a positive integer' }
      });
    }

    // Validate metric
    if (!metric || !VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        error: { message: `metric must be one of: ${VALID_METRICS.join(', ')}` }
      });
    }

    // Validate threshold (1 to 10000)
    const validThreshold = validateIntParam(threshold, 1, 10000);
    if (validThreshold === null) {
      return res.status(400).json({
        success: false,
        error: { message: 'threshold must be between 1 and 10000' }
      });
    }

    // Validate cooldown (1 to 1440 minutes = 24 hours)
    const validCooldown = validateIntParam(cooldown_minutes, 1, 1440);
    if (validCooldown === null) {
      return res.status(400).json({
        success: false,
        error: { message: 'cooldown_minutes must be between 1 and 1440' }
      });
    }

    // Authorization check
    const ownershipCheck = await pool.query(
      'SELECT id FROM apps WHERE id = $1 AND user_id = $2',
      [app_id, req.user.userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Create rule
    const rule = await alertsService.createRule(
      app_id,
      metric,
      validThreshold,
      validCooldown
    );

    res.status(201).json({
      success: true,
      rule
    });
  } catch (err) {
    next(err);
  }
};

exports.getRules = async (req, res, next) => {
  try {
    const appId = parseInt(req.query.app_id, 10);

    if (!appId || appId < 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'app_id query parameter is required' }
      });
    }

    // Authorization check
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

    // Get rules
    const rules = await alertsService.getRules(appId);

    res.json({
      success: true,
      rules
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRule = async (req, res, next) => {
  try {
    const ruleId = parseInt(req.params.id, 10);
    const appId = parseInt(req.query.app_id, 10);

    if (!ruleId || !appId) {
      return res.status(400).json({
        success: false,
        error: { message: 'rule id and app_id are required' }
      });
    }

    // Authorization check
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

    // Delete rule
    await alertsService.deleteRule(ruleId, appId);

    res.json({
      success: true,
      message: 'Alert rule deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
