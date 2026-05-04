const { pool } = require('../../config/db');
const alertsService = require('./alerts.service');

/**
 * Authorization Check Pattern:
 * Verify the logged-in user owns the app before creating, reading, or deleting alert rules.
 * 
 * Pattern: For every operation on user data, ask:
 * "Does req.user.userId own the app_id they're requesting?"
 */

const createRule = async (req, res) => {
  const { app_id, metric, threshold, cooldown_minutes } = req.body;

  if (!app_id) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id is required in request body' }
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
  // Verify user owns the app before creating alert rule for it
  try {
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
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { message: 'Authorization check failed' }
    });
  }
  // ✅ END FIX 1

  const rule = await alertsService.createRule({
    appId:           app_id,
    metric,
    threshold,
    cooldownMinutes: cooldown_minutes,
  });

  res.status(201).json({ success: true, rule });
};

const getRules = async (req, res) => {
  const appId = parseInt(req.query.app_id);

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
  // Verify user owns the app before returning their alert rules
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
  // ✅ END FIX 1

  const rules = await alertsService.getRules(appId);
  res.json({ success: true, rules });
};

const deleteRule = async (req, res) => {
  const ruleId = parseInt(req.params.id);
  const appId  = parseInt(req.query.app_id);

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
  // Verify user owns the app before deleting alert rule
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
  // ✅ END FIX 1

  const deleted = await alertsService.deleteRule(ruleId, appId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { message: 'Alert rule not found' },
    });
  }

  res.json({ success: true, message: 'Alert rule deleted' });
};

module.exports = { createRule, getRules, deleteRule };