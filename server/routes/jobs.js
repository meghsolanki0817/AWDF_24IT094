const express = require('express');
const router = express.Router();
const jobQueue = require('../services/asyncJobQueue');
const eventBus = require('../events/eventBus');
const { getAuditLogs } = require('../services/auditLogger');
const { getNotifications } = require('../services/notificationService');

// POST /jobs - Submit an asynchronous background job (HTTP 202 Pattern)
router.post('/', (req, res) => {
  const { jobType = 'DATA_EXPORT', payload = {} } = req.body || {};
  const userId = req.user ? req.user.id : 'user-24IT094';

  const job = jobQueue.submitJob(jobType, payload, userId);

  // Return HTTP 202 Accepted immediately without waiting for background worker
  res.status(202).json({
    message: 'Job accepted and queued for asynchronous processing.',
    jobId: job.id,
    status: job.status,
    checkStatusUrl: `/jobs/${job.id}`,
    submittedAt: job.createdAt
  });
});

// GET /jobs - List all submitted jobs
router.get('/', (req, res) => {
  res.status(200).json(jobQueue.getAllJobs());
});

// GET /jobs/audit - View asynchronous audit logs
router.get('/audit', (req, res) => {
  res.status(200).json(getAuditLogs());
});

// GET /jobs/notifications - View asynchronous dispatched notifications
router.get('/notifications', (req, res) => {
  res.status(200).json(getNotifications());
});

// GET /jobs/events/stream - Server-Sent Events (SSE) real-time event bus listener
router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected confirmation
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Event Stream Active' })}\n\n`);

  const onEvent = (eventRecord) => {
    res.write(`data: ${JSON.stringify(eventRecord)}\n\n`);
  };

  eventBus.on('*', onEvent);

  req.on('close', () => {
    eventBus.removeListener('*', onEvent);
  });
});

// GET /jobs/:id - Check status of a specific background job
router.get('/:id', (req, res) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.status(200).json(job);
});

module.exports = router;
