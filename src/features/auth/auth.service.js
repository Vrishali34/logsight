/**
 * auth.service.js
 *
 * Pure business logic for authentication.
 * No req/res here — this layer only talks to the DB and returns data.
 * This makes it independently testable without HTTP.
 *
 * Functions exported:
 * - registerUser(email, password) → new user object
 * - loginUser(email, password) → JWT token string
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');

// bcrypt cost factor — 12 is the production standard
// Too low (< 10) = fast to crack, Too high (> 14) = too slow to login
const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * Throws an error if the email is already taken.
 */
async function registerUser(email, password) {
  // Check if email already exists
  // We do this before hashing to avoid wasting bcrypt computation
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    const error = new Error('Email already in use');
    error.statusCode = 409; // 409 Conflict — resource already exists
    throw error;
  }

  // Hash the password — bcrypt auto-generates and embeds a salt
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user and return the new record (minus password)
  const result = await pool.query(
    `INSERT INTO users (email, password)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, hashedPassword]
  );

  return result.rows[0];
}

/**
 * Login an existing user.
 * Returns a signed JWT on success.
 * Throws a generic error for both bad email and bad password —
 * never reveal which one is wrong (prevents user enumeration).
 */
async function loginUser(email, password) {
  // Find user by email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  // Same error whether email is wrong or password is wrong
  // This is intentional — don't reveal which one failed
  const genericError = new Error('Invalid email or password');
  genericError.statusCode = 401;

  if (!user) throw genericError;

  // Compare plain password against stored bcrypt hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw genericError;

  // Generate JWT — payload contains userId only
  // Never put sensitive data (password, full user object) in JWT payload
  // JWT payload is base64 encoded, not encrypted — anyone can read it
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
  };
}

module.exports = { registerUser, loginUser };