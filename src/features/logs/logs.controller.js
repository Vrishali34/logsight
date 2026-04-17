const logsService    = require('./logs.service');
const { checkAlerts } = require('../alerts/alerts.service');

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