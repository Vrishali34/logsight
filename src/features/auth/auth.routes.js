/**
 * auth.routes.js
 *
 * Defines auth endpoints and wires Zod validation.
 *
 * Zod validates the request body before it reaches the controller.
 * If validation fails, a 400 error is thrown with clear field-level messages.
 * Controllers receive clean, type-safe data — no manual checks needed.
 */

const express = require('express');
const { z } = require('zod');
const { register, login } = require('./auth.controller');

const router = express.Router();

// ── Zod Schemas ───────────────────────────────────────────────────

const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'), // max(128) prevents bcrypt DoS attack
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' }),
    // No min() on login — avoids leaking that a short password exists
});

// ── Validation Middleware Factory ─────────────────────────────────

/**
 * Creates a middleware that validates req.body against a Zod schema.
 * On failure → throws 400 with field-level error messages.
 * On success → replaces req.body with the parsed (clean) data.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      // Format Zod errors into readable field messages
      error.details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(error);
    }

    // Replace req.body with Zod-parsed data (trimmed, coerced, safe)
    req.body = result.data;
    next();
  };
}

// ── Routes ────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

module.exports = router;