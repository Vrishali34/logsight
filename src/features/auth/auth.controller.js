/**
 * auth.controller.js
 *
 * Handles HTTP request/response for auth endpoints.
 * Keeps controllers thin — all logic lives in auth.service.js.
 *
 * In Express 5, async errors auto-flow to errorHandler.js —
 * no try/catch needed here.
 */

const { registerUser, loginUser } = require('./auth.service');

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  const { email, password } = req.body;

  const user = await registerUser(email, password);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  const { token, user } = await loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { token, user },
  });
}

module.exports = { register, login };