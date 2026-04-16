const request = require('supertest');
const app = require('../app');
const { pool } = require('../src/config/db');

let jwt;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'appstest@example.com'");

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'appstest@example.com', password: 'Password123!' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'appstest@example.com', password: 'Password123!' });

  jwt = res.body.data.token;  // ← fixed
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'appstest@example.com'");
  await pool.end();
});

describe('POST /api/apps', () => {
  it('creates an app and returns an api_key', async () => {
    const res = await request(app)
      .post('/api/apps')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: 'test-service' });

    expect(res.status).toBe(201);
    expect(res.body.app.name).toBe('test-service');
    expect(res.body.app.api_key).toMatch(/^ls_/);
  });

  it('rejects empty name', async () => {
    const res = await request(app)
      .post('/api/apps')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('rejects missing JWT', async () => {
    const res = await request(app)
      .post('/api/apps')
      .send({ name: 'no-auth-app' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/apps', () => {
  it('returns apps for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/apps')
      .set('Authorization', `Bearer ${jwt}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.apps)).toBe(true);
  });
});