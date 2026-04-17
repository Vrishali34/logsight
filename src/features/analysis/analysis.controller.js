const analysisService = require('./analysis.service');

const getSummary = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = parseInt(req.query.hours) || 24;

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  const summary = await analysisService.getSummary(appId, hours);
  res.json({ success: true, period_hours: hours, summary });
};

const getTrends = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = parseInt(req.query.hours) || 24;

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  const trends = await analysisService.getTrends(appId, hours);
  res.json({ success: true, period_hours: hours, buckets: trends.length, trends });
};

const getServiceBreakdown = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = parseInt(req.query.hours) || 24;

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  const services = await analysisService.getServiceBreakdown(appId, hours);
  res.json({ success: true, period_hours: hours, services });
};

module.exports = { getSummary, getTrends, getServiceBreakdown };