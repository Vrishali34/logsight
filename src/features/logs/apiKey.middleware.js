const { pool } = require('../../config/db');

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: { message: 'Missing x-api-key header' },
    });
  }

  const { rows } = await pool.query(
    'SELECT id, user_id, name FROM apps WHERE api_key = $1',
    [apiKey]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid API key' },
    });
  }

  req.app_record = rows[0]; // { id, user_id, name }
  next();
};

module.exports = { authenticateApiKey };