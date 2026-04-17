const { Router } = require('express');
const { authenticate } = require('../auth/auth.middleware');
const analysisController = require('./analysis.controller');

const router = Router();

router.use(authenticate);

router.get('/summary',  analysisController.getSummary);
router.get('/trends',   analysisController.getTrends);
router.get('/services', analysisController.getServiceBreakdown);

module.exports = router;