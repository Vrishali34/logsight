const appsService = require('./apps.service');

const createApp = async (req, res) => {
  const app = await appsService.createApp(req.user.userId, req.body.name);
  res.status(201).json({ app });
};

const getApps = async (req, res) => {
  const apps = await appsService.getAppsByUser(req.user.userId);
  res.json({ apps });
};

module.exports = { createApp, getApps };