/**
 * auth.middleware.js
 *
 * Verifies the JWT on every protected route.
 * If valid → attaches decoded user to req.user and calls next()
 * If invalid → throws 401 error to errorHandler
 *
 * Usage in routes:
 * router.get('/protected', authenticate, controller)
 *
 * Expected header format:
 * Authorization: Bearer <token>
 */

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    const error = new Error('Access denied. No token provided.');
    error.statusCode = 401;
    return next(error);
  }

  // Verify signature and expiry
  // jwt.verify throws if token is invalid or expired
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: 42, iat: ..., exp: ... }
    next();
  } catch (err) {
    const error = new Error('Invalid or expired token.');
    error.statusCode = 401;
    next(error);
  }
}

module.exports = { authenticate };