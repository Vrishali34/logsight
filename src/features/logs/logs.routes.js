const { Router } = require('express');
const { z, ZodError } = require('zod');
const { authenticateApiKey } = require('./apiKey.middleware');
const { authenticate } = require('../auth/auth.middleware');
const logsController = require('./logs.controller');

const router = Router();

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: err.errors },
      });
    }
    next(err);
  }
};

const ingestLogSchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug'], {
    errorMap: () => ({ message: 'level must be info, warn, error, or debug' }),
  }),
  message: z.string().min(1, 'message is required').max(10000),
  service: z.string().max(100).optional(),
  
  metadata: z.any().optional(), 
});

// POST /api/logs — authenticated via API key
router.post('/', authenticateApiKey, validate(ingestLogSchema), logsController.ingestLog);

// GET /api/logs — authenticated via JWT, requires app_id query param
router.get('/', authenticate, logsController.queryLogs);

module.exports = router;