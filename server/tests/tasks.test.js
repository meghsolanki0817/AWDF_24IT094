const request = require('supertest');
const app = require('../index');

/**
 * Automated Backend API Test Suite
 * End-to-end API verification using Jest and Supertest.
 */
describe('Task Management API - Automated Tests', () => {
  // Test 1 (Lab Manual Step 2): GET /tasks endpoint returns status 200
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 2 (Student Assignment requirement: Second automated test covering a different endpoint)
  test('GET /cache/stats returns 200 and cache metadata', async () => {
    const res = await request(app).get('/cache/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ttlSeconds', 60);
    expect(res.body).toHaveProperty('description');
  });

  // Test 3 (Event-Driven Architecture Endpoint): GET /events/logs returns 200
  test('GET /events/logs returns 200 and event log structure', async () => {
    const res = await request(app).get('/events/logs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  // Test 4 (Request validation test): POST /tasks requires title
  test('POST /tasks without title returns 400 validation error', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ description: 'Task missing required title property' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // AI Service status endpoint test
  test('GET /api/ai/status returns 200 with AI service configuration', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ONLINE');
    expect(res.body).toHaveProperty('gracefulDegradationEnabled', true);
  });

  // AI description generator returns structured suggestion with graceful degradation
  test('POST /api/ai/generate-description with valid title returns description and metadata', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Deploy Docker container to AWS' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('description');
    expect(typeof res.body.description).toBe('string');
    expect(res.body).toHaveProperty('suggestedPriority');
    expect(res.body).toHaveProperty('suggestedDeadline');
    expect(res.body).toHaveProperty('disclaimer');
  });

  // AI endpoint returns 400 when title is missing
  test('POST /api/ai/generate-description without title returns 400 error', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
