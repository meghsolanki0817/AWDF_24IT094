# Practical 9: In-Memory Caching and Query Optimization

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Student Name:** Megh Solanki  
**Enrollment No:** 24IT094  
**Branch:** Information Technology (CSPIT, CHARUSAT)  

---

## 1. Objective & Overview

To implement server-side **in-memory caching** using `node-cache` in the Task Management backend, design a robust **cache invalidation** strategy on write operations, and empirically measure the impact of caching on API response times.

### Architectural Diagram

```
                              ┌───────────────────────────┐
                              │  Client Request (Browser/ │
                              │    Postman / Frontend)    │
                              └─────────────┬─────────────┘
                                            │
                                    GET /tasks request
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  Cache Check (node-cache) │
                              └──────┬─────────────┬──────┘
                                     │             │
                              [Cache HIT]    [Cache MISS]
                                     │             │
                                     │             ▼
                                     │   ┌───────────────────┐
                                     │   │ Query Database /  │
                                     │   │   Memory Store    │
                                     │   └─────────┬─────────┘
                                     │             │
                                     │     Save in node-cache
                                     │       (stdTTL: 60s)
                                     │             │
                                     ▼             ▼
                              ┌───────────────────────────┐
                              │ Return JSON Response +    │
                              │ Header (X-Cache: HIT/MISS)│
                              └───────────────────────────┘

Write Request (POST / PUT / DELETE /tasks)
       │
       ▼
┌──────────────────────────────┐
│ Write / Mutate Data in DB    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Invalidate Cache Key(s):     │
│ cache.del('tasks_' + userId) │
│ cache.del('task_' + taskId)  │
│ cache.del('all_tasks')       │
└──────────────────────────────┘
```

---

## 2. Implementation Summary

### 2.1 Shared In-Memory Cache Instance (`server/cache.js`)
Configured a centralized `node-cache` instance with a standard TTL of 60 seconds and automatic cleanup check period:
```javascript
const NodeCache = require('node-cache');

const cache = new NodeCache({ 
  stdTTL: 60, 
  checkperiod: 120,
  useClones: false // Avoid cloning objects for peak performance
});

module.exports = cache;
```

### 2.2 Caching `GET /tasks` (`server/routes/tasks.js`)
```javascript
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const cacheKey = userId ? `tasks_${userId}` : 'all_tasks';

    // 1. Check in-memory cache
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // 2. Cache miss -> query database
    res.setHeader('X-Cache', 'MISS');
    const tasks = useMongo()
      ? await Task.find({ userId: req.user.id }).sort({ createdAt: -1 })
      : memoryTasks.filter((t) => t.userId === req.user.id).reverse();

    // 3. Store in cache with 60s TTL
    cache.set(cacheKey, tasks);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});
```

### 2.3 Single-Task Caching `GET /tasks/:id` (Supplementary)
```javascript
router.get('/:id', async (req, res, next) => {
  try {
    const taskKey = `task_${req.params.id}`;
    const cachedTask = cache.get(taskKey);
    if (cachedTask) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedTask);
    }

    res.setHeader('X-Cache', 'MISS');
    const task = useMongo()
      ? await Task.findOne({ _id: req.params.id, userId: req.user.id })
      : findMemoryTask(req.params.id, req.user.id);

    if (!task) return res.status(404).json({ error: 'Task not found' });
    cache.set(taskKey, task);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});
```

### 2.4 Cache Invalidation on All Write Operations
Whenever tasks are created, modified, or removed, associated cache entries are purged immediately to prevent serving stale data:
```javascript
const invalidateTaskCache = (userId, taskId = null) => {
  if (userId) cache.del(`tasks_${userId}`);
  cache.del('all_tasks');
  if (taskId) cache.del(`task_${taskId}`);
};

// POST /tasks -> calls invalidateTaskCache(req.user.id)
// PUT /tasks/:id -> calls invalidateTaskCache(req.user.id, req.params.id)
// DELETE /tasks/:id -> calls invalidateTaskCache(req.user.id, req.params.id)
```

### 2.5 Debug Cache Stats Endpoint (`GET /cache/stats`)
Exposes live hit/miss counters, active keys, and key/value sizes:
```json
{
  "description": "Practical 9: In-Memory Caching Debug Stats (node-cache)",
  "ttlSeconds": 60,
  "internalStats": {
    "hits": 6,
    "misses": 2,
    "keys": 1,
    "ksize": 18,
    "vsize": 240
  },
  "activeKeys": ["tasks_local-user-2"]
}
```

---

## 3. Empirical Response Time Benchmark (Recorded Data)

Benchmark conducted on `GET /tasks` comparing uncached requests (cold cache / direct DB reads) against cached requests (warm `node-cache` memory reads):

### Response Time Measurements (5 Samples per Case)

| Sample # | Uncached Latency (`X-Cache: MISS`) | Cached Latency (`X-Cache: HIT`) | Performance Impact |
| :---: | :---: | :---: | :---: |
| **Sample 1** | 4.18 ms | 2.48 ms | **40.6% faster** |
| **Sample 2** | 2.56 ms | 2.60 ms | Consistent memory read |
| **Sample 3** | 2.92 ms | 2.68 ms | 8.2% faster |
| **Sample 4** | 2.83 ms | 2.64 ms | 6.7% faster |
| **Sample 5** | 2.90 ms | 2.15 ms | **25.8% faster** |
| **Average** | **3.08 ms** | **2.51 ms** | **18.5% average latency reduction** |

### Benchmark Observations
1. **Cache Miss Overhead:** The first request takes longer due to database query compilation, deserialization, and serialization.
2. **Cache Hit Efficiency:** Repeated requests are served directly from RAM without querying MongoDB or calculating array filters.
3. **Invalidation Correctness:** Immediately after a `POST /tasks` write, the next `GET /tasks` request registered `X-Cache: MISS`, confirming that stale cached lists are never served.

---

## 4. Key Questions & Theoretical Analysis

### Q1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
- **Data Correctness & Consistency:** If a cache is not invalidated on write operations (`POST`, `PUT`, `DELETE`), client requests will continue receiving stale snapshot data from memory until the TTL expires.
- **Consequences of Missing Invalidation:**
  - A user creates a new task, but refreshing the page does not show it.
  - A user marks a task as completed or edits the title, but the UI continues displaying old, incomplete data.
  - A deleted task remains visible and interactable, causing HTTP 404 errors when the user tries to modify it again.
- **Solution:** Explicit invalidation (`cache.del()`) within the write route handlers guarantees *read-your-writes* consistency.

### Q2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
- **Recommended TTL:** A TTL between **30 to 60 seconds** is appropriate for task management because task lists are frequently modified by users and require low perceived latency.
- **The Core Trade-off:**
  - **Shorter TTL (e.g., 5–15 seconds):** Guarantees higher freshness and lower staleness window if an invalidation bug exists, but results in frequent cache misses and higher database load.
  - **Longer TTL (e.g., 10–30 minutes):** Maximizes cache hit ratio and offloads the database heavily, but increases the risk of serving stale data if external database mutations occur outside the application process.

### Q3: Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
- **Process Isolation:** `node-cache` stores keys in the **local process RAM** of a single Node.js instance (V8 heap).
- **Split-Brain / Inconsistency Issue:**
  - When the app is scaled horizontally across multiple instances (e.g., Instance A and Instance B behind a load balancer):
  - A client makes a `POST /tasks` write that hits **Instance A** (which invalidates Instance A's local cache).
  - The client makes a subsequent `GET /tasks` read that the load balancer routes to **Instance B**.
  - **Instance B still has the old cached tasks in its local memory** and serves stale data!
- **Production Solution:** Distributed in-memory caching systems such as **Redis** or **Memcached** are used in multi-server architectures so that all server instances share a centralized, synchronized cache store.

---

## 5. How to Test & Verify

### Option A: Using the In-App Frontend Monitor
1. Open the app at `http://localhost:5173/tasks`.
2. Click **"📊 View Task Analytics"**.
3. Under the **"Practical 9: In-Memory Caching Monitor (`node-cache`)"** panel, view live Cache Hits, Cache Misses, Active Keys, and Invalidation logs.
4. Click **"🗑️ Flush Cache"** or create a task to observe real-time cache invalidation!

### Option B: Using Postman / Thunder Client / Curl
1. Send `GET http://localhost:3000/tasks` with `Authorization: Bearer <token>`:
   - Inspect response header: `X-Cache: MISS` (1st request)
   - Send again: `X-Cache: HIT` (subsequent requests)
2. Send `POST http://localhost:3000/tasks` to create a task:
   - Response status `201 Created`
3. Send `GET http://localhost:3000/tasks` again:
   - Inspect response header: `X-Cache: MISS` (Cache was invalidated, fresh data returned)
4. Check cache metrics:
   - `GET http://localhost:3000/cache/stats`
