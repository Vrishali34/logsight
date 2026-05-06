const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./auth.controller');

const router = express.Router();

// Rate limiter: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please try again in 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);

module.exports = router;
