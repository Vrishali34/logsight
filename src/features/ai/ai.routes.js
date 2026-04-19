const { Router } = require('express');
const { authenticate } = require('../auth/auth.middleware');
const aiController = require('./ai.controller');

const router = Router();

router.use(authenticate);
router.get('/insights', aiController.getInsights);

module.exports = router;