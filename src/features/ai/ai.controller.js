const aiService = require('./ai.service');

const getInsights = async (req, res) => {
  const appId = parseInt(req.query.app_id);
  const hours = parseInt(req.query.hours) || 24;

  if (!appId) {
    return res.status(400).json({
      success: false,
      error: { message: 'app_id query parameter is required' },
    });
  }

  const result = await aiService.getInsights(appId, hours);

  res.json({
    success: true,
    period_hours: hours,
    insights: result.insights,
    data: result.data,
  });
};

module.exports = { getInsights };