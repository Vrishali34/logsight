const crypto = require('crypto');
const { pool } = require('../../config/db');

const generateApiKey = () => `ls_${crypto.randomBytes(32).toString('hex')}`;

const createApp = async (userId, name) => {
  const { rows } = await pool.query(
    `INSERT INTO apps (user_id, name, api_key)
     VALUES ($1, $2, $3)
     RETURNING id, name, api_key, created_at`,
    [userId, name, generateApiKey()]
  );
  return rows[0];
};

const getAppsByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, name, api_key, created_at
     FROM apps
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

module.exports = { createApp, getAppsByUser };