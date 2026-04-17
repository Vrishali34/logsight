const { Router } = require('express');
const { z, ZodError } = require('zod');
const { authenticate } = require('../auth/auth.middleware');
const alertsController = require('./alerts.controller');

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

const createRuleSchema = z.object({
  app_id:           z.number({ required_error: 'app_id is required' }).int().positive(),
  metric:           z.enum(['error_rate'], {
    errorMap: () => ({ message: 'metric must be error_rate' }),
  }),
  threshold:        z.number().min(0).max(100),
  cooldown_minutes: z.number().int().min(1).max(1440).optional(),
});

router.use(authenticate);

router.post('/',     validate(createRuleSchema), alertsController.createRule);
router.get('/',      alertsController.getRules);
router.delete('/:id', alertsController.deleteRule);

module.exports = router;