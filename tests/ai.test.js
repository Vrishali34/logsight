const request = require('supertest');
const app     = require('../app');
const { pool } = require('../src/config/db');

let jwt;
let appId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'aitest@example.com'");

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'aitest@example.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'aitest@example.com', password: 'Password123!' });

  jwt = loginRes.body.data.token;

  const appRes = await request(app)
    .post('/api/apps')
    .set('Authorization', `Bearer ${jwt}`)
    .send({ name: 'ai-test-app' });

  appId = appRes.body.app.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'aitest@example.com'");
  await pool.end();
});

describe('GET /api/ai/insights', () => {
  it('returns insights string from Groq', async () => {
    const res = await request(app)
      .get(`/api/ai/insights?app_id=${appId}&hours=24`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.insights).toBe('string');
    expect(res.body.insights.length).toBeGreaterThan(0);
  }, 30000); // 30s timeout — AI API call

  it('returns 400 when app_id missing', async () => {
    const res = await request(app)
      .get('/api/ai/insights')
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 without JWT', async () => {
    const res = await request(app)
      .get(`/api/ai/insights?app_id=${appId}`);

    expect(res.status).toBe(401);
  });
});