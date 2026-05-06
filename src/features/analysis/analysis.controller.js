const { pool } = require('../../config/db');
const analysisService = require('./analysis.service');

// Helper: Validate and parse integer parameter
const validateIntParam = (value, min, max, defaultVal) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultVal;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
};

exports.getSummary = async (req, res, next) => {
  try {
    const appId = validateIntParam(req.query.app_id, 1, Number.MAX_SAFE_INTEGER, null);
    const hours = validateIntParam(req.query.hours, 1, 168, 24);

    if (!appId) {
      return res.status(400).json({
        success: false,
        error: { message: 'app_id query parameter is required' }
      });
    }

    // Authorization check: Does user own this app?
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

    // Get summary
    const summary = await analysisService.getSummary(appId, hours);

    res.json({
      success: true,
      period_hours: hours,
      summary
    });
  } catch (err) {
    next(err);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const appId = validateIntParam(req.query.app_id, 1, Number.MAX_SAFE_INTEGER, null);
    const hours = validateIntParam(req.query.hours, 1, 168, 24);

    if (!appId) {
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

    // Get trends
    const trends = await analysisService.getTrends(appId, hours);

    res.json({
      success: true,
      period_hours: hours,
      trends
    });
  } catch (err) {
    next(err);
  }
};

exports.getServiceBreakdown = async (req, res, next) => {
  try {
    const appId = validateIntParam(req.query.app_id, 1, Number.MAX_SAFE_INTEGER, null);
    const hours = validateIntParam(req.query.hours, 1, 168, 24);

    if (!appId) {
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

    // Get service breakdown
    const services = await analysisService.getServiceBreakdown(appId, hours);

    res.json({
      success: true,
      period_hours: hours,
      services
    });
  } catch (err) {
    next(err);
  }
};
