const path = require('path');
const express = require('express');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
const logger = require('./middleware/logger');
const validateContentType = require('./middleware/validateContentType');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const validateTask = require('./middleware/validateTask');
const cors = require('cors');
const mongoose = require('mongoose');

const cache = require('./cache');
// Practical 10: Initialize native EventEmitter listeners (required once at startup)
require('./listeners');
const taskEvents = require('./events');
const { getEventLogs, clearEventLogs } = require('./listeners');

// Practical 10: Background services
require('./services/auditLogger');
require('./services/notificationService');

// Load server/.env whether the server is started from root or server/.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';

app.use(express.json());
app.use(logger);

// Enable CORS for development / front-end
app.use(cors());

// Practical 9: Public debug endpoint for cache statistics
app.get('/cache/stats', (req, res) => {
  const stats = cache.getDebugStats ? cache.getDebugStats() : { stats: cache.getStats(), keys: cache.keys() };
  res.status(200).json({
    description: 'Practical 9: In-Memory Caching Debug Stats (node-cache)',
    ttlSeconds: 60,
    ...stats
  });
});

app.post('/cache/clear', (req, res) => {
  cache.flushAll();
  res.status(200).json({ message: 'All in-memory cache keys flushed successfully.' });
});

// Practical 10: Public endpoints for Event-Driven Processing inspection & simulation
app.get('/events/logs', (req, res) => {
  res.status(200).json({
    description: 'Practical 10: Native EventEmitter Notification & Error Logs',
    logs: getEventLogs()
  });
});

app.post('/events/simulate-error', (req, res) => {
  const simulatedTask = {
    _id: `sim-err-${Date.now()}`,
    title: 'TRIGGER_ERROR',
    userId: 'User-24IT094',
    simulateError: true
  };
  console.log(`[API] Response sent at ${new Date().toISOString()} (Simulating error inside listener)`);
  res.status(200).json({
    message: 'Simulated task-created with error dispatched. Observer console: [Error Listener] catches it without crash.',
    task: simulatedTask
  });
  taskEvents.emit('task-created', simulatedTask);
});

app.post('/events/clear-logs', (req, res) => {
  clearEventLogs();
  res.status(200).json({ message: 'EventEmitter logs cleared.' });
});

app.use('/auth', validateContentType, authRouter);
// Practical 10: Event-Driven Background Jobs & SSE Stream
app.use('/jobs', jobsRouter);
// Mount tasks router with content-type validation for POST/PUT
app.use('/tasks', auth, validateContentType, (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') return validateTask(req, res, next);
  next();
}, tasksRouter);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    app.listen(PORT, () => console.log(`Task Manager API listening on port ${PORT} with MongoDB`));
  })
  .catch((error) => {
    console.warn(`MongoDB unavailable (${error.message}). Starting in temporary in-memory mode.`);
    app.listen(PORT, () => console.log(`Task Manager API listening on port ${PORT} in memory mode`));
  });
