const alertsService = require('./alerts.service');

const createRule = async (req, res) => {
  const { app_id, metric, threshold, cooldown_minutes } = req.body;

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