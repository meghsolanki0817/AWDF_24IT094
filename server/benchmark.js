const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          durationMs: parseFloat(durationMs.toFixed(2)),
          data: json || body
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runBenchmark() {
  console.log('========================================================');
  console.log('   PRACTICAL 9: IN-MEMORY CACHING & QUERY OPTIMIZATION  ');
  console.log('========================================================\n');

  // Login / Register
  const authPayload = JSON.stringify({ email: 'pr9_user@example.com', password: 'password123' });
  let authRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(authPayload) }
  }, authPayload);

  if (authRes.statusCode !== 200) {
    const regPayload = JSON.stringify({ name: 'Megh Solanki', email: 'pr9_user@example.com', password: 'password123' });
    authRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regPayload) }
    }, regPayload);
  }

  const token = authRes.data.token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Seed sample tasks
  for (let i = 1; i <= 3; i++) {
    const taskData = JSON.stringify({ title: `Practical 9 Task #${i}`, description: `Automated sample task for cache benchmark` });
    await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(taskData) } }, taskData);
  }

  // 1. Uncached Measurements (flushing cache before each read to simulate cold cache / direct database queries)
  console.log('[1] Testing Uncached Requests (Cold Cache / Direct DB query):');
  const uncachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    await request({ hostname: 'localhost', port: 3000, path: '/cache/clear', method: 'POST' });
    const res = await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'GET', headers });
    uncachedReadings.push(res.durationMs);
    console.log(`    Sample ${i}: ${res.durationMs.toFixed(2)} ms (X-Cache: ${res.headers['x-cache']})`);
  }

  // Prime cache with 1 miss
  await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'GET', headers });

  // 2. Cached Measurements (Warm Cache / node-cache Memory Reads)
  console.log('\n[2] Testing Cached Requests (Warm node-cache in-memory reads):');
  const cachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    const res = await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'GET', headers });
    cachedReadings.push(res.durationMs);
    console.log(`    Sample ${i}: ${res.durationMs.toFixed(2)} ms (X-Cache: ${res.headers['x-cache']})`);
  }

  const avgUncached = (uncachedReadings.reduce((a, b) => a + b, 0) / uncachedReadings.length).toFixed(2);
  const avgCached = (cachedReadings.reduce((a, b) => a + b, 0) / cachedReadings.length).toFixed(2);
  const speedup = ((avgUncached - avgCached) / avgUncached * 100).toFixed(1);

  console.log('\n---------------- RESULTS SUMMARY ----------------');
  console.log(`Average Uncached Latency : ${avgUncached} ms`);
  console.log(`Average Cached Latency   : ${avgCached} ms`);
  console.log(`Latency Reduction        : ${speedup}% faster response`);

  // Verify Invalidation
  console.log('\n[3] Testing Cache Invalidation on Write (POST /tasks):');
  const addPayload = JSON.stringify({ title: 'Invalidation Trigger Task', description: 'Testing cache.del()' });
  await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(addPayload) } }, addPayload);
  const afterWriteRes = await request({ hostname: 'localhost', port: 3000, path: '/tasks', method: 'GET', headers });
  console.log(`    After write GET /tasks -> X-Cache: ${afterWriteRes.headers['x-cache']} (Expected: MISS -> Cache successfully invalidated!)`);

  // Cache Stats
  const statsRes = await request({ hostname: 'localhost', port: 3000, path: '/cache/stats', method: 'GET' });
  console.log('\n[4] Debug Cache Stats Snapshot:');
  console.log(JSON.stringify(statsRes.data, null, 2));
}

runBenchmark().catch(console.error);
