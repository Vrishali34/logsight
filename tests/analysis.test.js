const request = require('supertest');
const app = require('../app');
const { pool } = require('../src/config/db');

let jwt;
let apiKey;
let appId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'analysistest@example.com'");

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'analysistest@example.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'analysistest@example.com', password: 'Password123!' });

  jwt = loginRes.body.data.token;

  const appRes = await request(app)
    .post('/api/apps')
    .set('Authorization', `Bearer ${jwt}`)
    .send({ name: 'analysis-test-app' });

  apiKey = appRes.body.app.api_key;
  appId  = appRes.body.app.id;

  // Seed logs
  const logs = [
    { level: 'error', message: 'err 1', service: 'payment-service' },
    { level: 'error', message: 'err 2', service: 'payment-service' },
    { level: 'warn',  message: 'wrn 1', service: 'payment-service' },
    { level: 'info',  message: 'inf 1', service: 'auth-service' },
    { level: 'error', message: 'err 3', service: 'auth-service' },
  ];

  for (const log of logs) {
    await request(app)
      .post('/api/logs')
      .set('x-api-key', apiKey)
      .send(log);
  }
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'analysistest@example.com'");
  await pool.end();
});

describe('GET /api/analysis/summary', () => {
  it('returns total and error count', async () => {
    const res = await request(app)
      .get(`/api/analysis/summary?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(parseInt(res.body.summary.total)).toBe(5);
    expect(parseInt(res.body.summary.errors)).toBe(3);
  });

  it('returns 400 when app_id missing', async () => {
    const res = await request(app)
      .get('/api/analysis/summary')
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 without JWT', async () => {
    const res = await request(app)
      .get(`/api/analysis/summary?app_id=${appId}`);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/analysis/trends', () => {
  it('returns trend buckets array', async () => {
    const res = await request(app)
      .get(`/api/analysis/trends?app_id=${appId}&hours=24`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trends)).toBe(true);
    expect(res.body.trends.length).toBeGreaterThan(0);
  });
});

describe('GET /api/analysis/services', () => {
  it('returns per-service breakdown', async () => {
    const res = await request(app)
      .get(`/api/analysis/services?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);

    const payment = res.body.services.find(s => s.service === 'payment-service');
    expect(payment).toBeDefined();
    expect(parseInt(payment.errors)).toBe(2);
  });
});