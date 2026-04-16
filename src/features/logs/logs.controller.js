const logsService = require('./logs.service');

const ingestLog = async (req, res) => {
  const { level, message, service, metadata } = req.body;

  const log = await logsService.createLog({
    appId: req.app_record.id,
    level,
    message,
    service,
    metadata,
  });

  res.status(201).json({ success: true, log });
};

const queryLogs = async (req, res) => {
  const { level, service, limit, offset } = req.query;
  const appId = req.app_record?.id || parseInt(req.query.app_id);

  const logs = await logsService.getLogs({
    appId,
    level,
    service,
    limit: parseInt(limit) || 50,
    offset: parseInt(offset) || 0,
  });

  res.json({ success: true, count: logs.length, logs });
};

module.exports = { ingestLog, queryLogs };