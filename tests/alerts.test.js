const request = require('supertest');
const app     = require('../app');
const { pool } = require('../src/config/db');

let jwt;
let apiKey;
let appId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'alertstest@example.com'");

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'alertstest@example.com', password: 'Password123!' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alertstest@example.com', password: 'Password123!' });

  jwt = loginRes.body.data.token;

  const appRes = await request(app)
    .post('/api/apps')
    .set('Authorization', `Bearer ${jwt}`)
    .send({ name: 'alerts-test-app' });

  apiKey = appRes.body.app.api_key;
  appId  = appRes.body.app.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'alertstest@example.com'");
  await pool.end();
});

describe('POST /api/alerts', () => {
  it('creates an alert rule', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ app_id: appId, metric: 'error_rate', threshold: 50, cooldown_minutes: 5 });

    expect(res.status).toBe(201);
    expect(res.body.rule.metric).toBe('error_rate');
    expect(parseFloat(res.body.rule.threshold)).toBe(50);
  });

  it('rejects invalid metric', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ app_id: appId, metric: 'cpu_usage', threshold: 80 });

    expect(res.status).toBe(400);
  });

  it('rejects threshold above 100', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ app_id: appId, metric: 'error_rate', threshold: 150 });

    expect(res.status).toBe(400);
  });

  it('rejects missing JWT', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .send({ app_id: appId, metric: 'error_rate', threshold: 50 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/alerts', () => {
  it('returns alert rules for an app', async () => {
    const res = await request(app)
      .get(`/api/alerts?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rules)).toBe(true);
    expect(res.body.rules.length).toBeGreaterThan(0);
  });

  it('returns 400 when app_id missing', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(400);
  });
});

describe('Alert threshold triggering', () => {
  it('triggers alert when error rate exceeds threshold', async () => {
    // Create a rule with low threshold — fires on very first error log
    // cooldown_minutes: 60 ensures no interference from other test logs
    await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ app_id: appId, metric: 'error_rate', threshold: 10, cooldown_minutes: 60 });

    // Ingest ONE error log — error rate is 100% which exceeds 10%
    // Check THIS response — alert fires here before any cooldown is set
    const res = await request(app)
      .post('/api/logs')
      .set('x-api-key', apiKey)
      .send({ level: 'error', message: 'trigger error', service: 'test' });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.alerts)).toBe(true);
    expect(res.body.alerts.length).toBeGreaterThan(0);
    expect(res.body.alerts[0].metric).toBe('error_rate');
  });
});

describe('DELETE /api/alerts/:id', () => {
  it('deletes an alert rule', async () => {
    const createRes = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ app_id: appId, metric: 'error_rate', threshold: 90 });

    const ruleId = createRes.body.rule.id;

    const deleteRes = await request(app)
      .delete(`/api/alerts/${ruleId}?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('returns 404 for non-existent rule', async () => {
    const res = await request(app)
      .delete(`/api/alerts/99999?app_id=${appId}`)
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(404);
  });
});