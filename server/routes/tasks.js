const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const cache = require('../cache');
const router = express.Router();

const memoryTasks = [];
let nextMemoryId = 1;

const useMongo = () => require('mongoose').connection.readyState === 1;

const findMemoryTask = (id, userId) => memoryTasks.find((task) => task._id === id && task.userId === userId);

// Helper to invalidate all associated cache keys on write operations
const invalidateTaskCache = (userId, taskId = null) => {
  if (userId) cache.del(`tasks_${userId}`);
  cache.del('all_tasks');
  if (taskId) cache.del(`task_${taskId}`);
};

// Practical 9: Debug endpoint to inspect cache statistics, hits, and misses
router.get('/cache/stats', (req, res) => {
  const stats = cache.getDebugStats ? cache.getDebugStats() : { stats: cache.getStats(), keys: cache.keys() };
  res.status(200).json({
    description: 'Practical 9: In-Memory Caching Debug Stats (node-cache)',
    ttlSeconds: 60,
    ...stats
  });
});

// Practical 9: Clear cache endpoint (useful for testing and benchmarking)
router.post('/cache/clear', (req, res) => {
  cache.flushAll();
  res.status(200).json({ message: 'All in-memory cache keys flushed successfully.' });
});

// GET /tasks - Fetch all tasks with in-memory caching (60s TTL)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const cacheKey = userId ? `tasks_${userId}` : 'all_tasks';

    // Step 1: Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // Step 2: Cache miss -> query database / memory store
    res.setHeader('X-Cache', 'MISS');
    const tasks = useMongo()
      ? await Task.find({ userId: req.user.id }).sort({ createdAt: -1 })
      : memoryTasks.filter((task) => task.userId === req.user.id).reverse();

    // Step 3: Store in cache with 60s TTL
    cache.set(cacheKey, tasks);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// Practical 9 Supplementary: GET /tasks/:id - Single-task caching
router.get('/:id', async (req, res, next) => {
  try {
    const taskKey = `task_${req.params.id}`;

    // Check single-task cache
    const cachedTask = cache.get(taskKey);
    if (cachedTask) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedTask);
    }

    // Cache miss
    res.setHeader('X-Cache', 'MISS');
    const task = useMongo()
      ? await Task.findOne({ _id: req.params.id, userId: req.user.id })
      : findMemoryTask(req.params.id, req.user.id);

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Store in cache
    cache.set(taskKey, task);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create task + invalidate cache
router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', completed = false } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

    const task = useMongo()
      ? await Task.create({ userId: req.user.id, title, description, completed })
      : { _id: `local-${nextMemoryId++}`, userId: req.user.id, title: title.trim(), description: description.trim(), completed: Boolean(completed), createdAt: new Date().toISOString() };

    if (!useMongo()) memoryTasks.push(task);

    // Practical 9: Invalidate cache so stale list is never served
    invalidateTaskCache(req.user.id);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update task + invalidate both list and single-task cache
router.put('/:id', async (req, res, next) => {
  try {
    let task;
    if (useMongo()) {
      task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true, runValidators: true });
    } else {
      task = findMemoryTask(req.params.id, req.user.id);
      if (task) {
        Object.assign(task, req.body);
        task.title = task.title.trim();
        task.description = (task.description || '').trim();
        task.completed = Boolean(task.completed);
      }
    }

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Practical 9: Invalidate both the list and the single task cache
    invalidateTaskCache(req.user.id, req.params.id);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete task + invalidate cache
router.delete('/:id', async (req, res, next) => {
  try {
    let task;
    if (useMongo()) {
      task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    } else {
      const index = memoryTasks.findIndex((item) => item._id === req.params.id && item.userId === req.user.id);
      task = index === -1 ? null : memoryTasks.splice(index, 1)[0];
    }

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Practical 9: Invalidate cache after delete
    invalidateTaskCache(req.user.id, req.params.id);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
