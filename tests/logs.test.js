const request = require('supertest');
const app = require('../app');
const { pool } = require('../src/config/db');

let jwt;
let apiKey;
let appId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'logstest@example.com'");

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'logstest@example.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'logstest@example.com', password: 'Password123!' });

  jwt = loginRes.body.data.token;

  const appRes = await request(app)
    .post('/api/apps')
    .set('Authorization', `Bearer ${jwt}`)
    .send({ name: 'test-log-app' });

  apiKey = appRes.body.app.api_key;
  appId = appRes.body.app.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'logstest@example.com'");
  await pool.end();
});

describe('POST /api/logs', () => {
  it('ingests a valid log entry', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('x-api-key', apiKey)
      .send({
        level: 'error',
        message: 'Something broke',
        service: 'payment-service',
        metadata: { orderId: 'ord_123' },
      });

    expect(res.status).toBe(201);
    expect(res.body.log.level).toBe('error');
    expect(res.body.log.message).toBe('Something broke');
  });

  it('rejects invalid log level', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('x-api-key', apiKey)
      .send({ level: 'critical', message: 'bad level' });

    expect(res.status).toBe(400);
  });

  it('rejects missing message', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('x-api-key', apiKey)
      .send({ level: 'info' });

    expect(res.status).toBe(400);
  });

  it('rejects missing API key', async () => {
    const res = await request(app)
      .post('/api/logs')
      .send({ level: 'info', message: 'no key' });

    expect(res.status).toBe(401);
  });

  it('rejects invalid API key', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('x-api-key', 'ls_fakekeyhere')
      .send({ level: 'info', message: 'bad key' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/logs', () => {
  it('returns logs for a valid app', async () => {
    const res = await request(app)
      .get(`/api/logs?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  it('filters logs by level', async () => {
    const res = await request(app)
      .get(`/api/logs?app_id=${appId}&level=error`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    res.body.logs.forEach(log => expect(log.level).toBe('error'));
  });

  it('rejects missing JWT', async () => {
    const res = await request(app)
      .get(`/api/logs?app_id=${appId}`);

    expect(res.status).toBe(401);
  });
});