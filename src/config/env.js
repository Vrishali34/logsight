/**
 * Environment variable validator.
 * Fails fast at startup if required variables are missing.
 * This prevents runtime errors deep in request handlers.
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1); // Hard exit — don't start a broken server
  }

  console.log('✅ Environment variables validated');
}

module.exports = { validateEnv };