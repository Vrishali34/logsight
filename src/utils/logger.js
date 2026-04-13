/**
 * Centralized logger utility.
 * 
 * We use a thin wrapper over console so we can later swap in
 * Winston or Pino (structured JSON logging for prod) without
 * touching every file that imports this.
 * 
 * Real-world note: In production you'd ship logs to a service
 * like Datadog, CloudWatch, or — fittingly — LogSight itself.
 */

const logger = {
  info: (message, meta = {}) => {
    const entry = { level: 'info', message, ...meta, timestamp: new Date().toISOString() };
    console.log(JSON.stringify(entry));
  },

  warn: (message, meta = {}) => {
    const entry = { level: 'warn', message, ...meta, timestamp: new Date().toISOString() };
    console.warn(JSON.stringify(entry));
  },

  error: (message, meta = {}) => {
    const entry = { level: 'error', message, ...meta, timestamp: new Date().toISOString() };
    console.error(JSON.stringify(entry));
  },
};

module.exports = logger;