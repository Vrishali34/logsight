const { pool } = require('../../config/db');
const analysisService = require('./analysis.service');

/**
 * Authorization Check Pattern:
 * Before returning user data, verify that the logged-in user owns the app.
 * 
 * Pattern used at: Google, Netflix, Stripe, Meta, every FANG company
 */

const getSummary = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = Math.min(parseInt(req.query.hours) || 24, 168); // Cap at 7 days

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
  // Verify the logged-in user owns this app before returning data
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

  const summary = await analysisService.getSummary(appId, hours);
  res.json({ success: true, period_hours: hours, summary });
};

const getTrends = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = Math.min(parseInt(req.query.hours) || 24, 168); // Cap at 7 days

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
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

  const trends = await analysisService.getTrends(appId, hours);
  res.json({ success: true, period_hours: hours, buckets: trends.length, trends });
};

const getServiceBreakdown = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = Math.min(parseInt(req.query.hours) || 24, 168); // Cap at 7 days

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  // ✅ FIX 1: AUTHORIZATION CHECK
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

  const services = await analysisService.getServiceBreakdown(appId, hours);
  res.json({ success: true, period_hours: hours, services });
};

module.exports = { getSummary, getTrends, getServiceBreakdown };