const { Router } = require('express');
const { z, ZodError } = require('zod');
const { authenticate } = require('../auth/auth.middleware');
const appsController = require('./apps.controller');

const router = Router();

// ── Validation middleware ─────────────────────────────────────────
// Wraps schema.parse in try/catch so ZodErrors become 400 responses
// instead of bubbling up to the global error handler as 500s
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: err.errors,
        },
      });
    }
    next(err); // non-Zod errors go to global error handler
  }
};

// ── Schemas ───────────────────────────────────────────────────────
const createAppSchema = z.object({
  name: z
    .string()
    .min(1, 'App name is required')
    .max(255, 'App name too long')
    .trim(),
});

// ── All /api/apps routes require a valid JWT ──────────────────────
router.use(authenticate);

router.post('/', validate(createAppSchema), appsController.createApp);
router.get('/', appsController.getApps);

module.exports = router;