const eventBus = require('../events/eventBus');

/**
 * Practical 10: Asynchronous Job Processing Queue & Worker
 * Demonstrates non-blocking background task lifecycle (PENDING -> PROCESSING -> COMPLETED).
 */
class AsyncJobQueue {
  constructor() {
    this.jobs = new Map();
    this.activeJobId = null;
  }

  /**
   * Enqueue a new asynchronous job and immediately return receipt (HTTP 202 pattern)
   */
  submitJob(jobType, payload = {}, userId = 'anonymous') {
    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const job = {
      id: jobId,
      jobType,
      payload,
      userId,
      status: 'PENDING',
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);

    // Publish event that job was submitted
    eventBus.publish('job:submitted', { jobId, jobType, userId });

    // Defer execution to the asynchronous worker loop (does NOT block API response)
    setImmediate(() => this.processNext(jobId));

    return job;
  }

  /**
   * Background Worker simulation
   */
  async processNext(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'PROCESSING';
    job.progress = 15;
    job.updatedAt = new Date().toISOString();
    eventBus.publish('job:started', { jobId: job.id, jobType: job.jobType });

    // Step 1: Simulate heavy calculation / DB batch processing
    setTimeout(() => {
      job.progress = 60;
      job.updatedAt = new Date().toISOString();
      eventBus.publish('job:progress', { jobId: job.id, progress: 60 });

      // Step 2: Finalize heavy operation
      setTimeout(() => {
        job.status = 'COMPLETED';
        job.progress = 100;
        job.updatedAt = new Date().toISOString();
        job.result = {
          summary: `Asynchronous processing for "${job.jobType}" completed successfully.`,
          recordsProcessed: Math.floor(Math.random() * 50) + 10,
          executionTimeMs: 2500,
          generatedAt: new Date().toISOString()
        };

        eventBus.publish('job:completed', {
          jobId: job.id,
          jobType: job.jobType,
          result: job.result
        });
      }, 1400);
    }, 1200);
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  getAllJobs() {
    return Array.from(this.jobs.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

const jobQueue = new AsyncJobQueue();
module.exports = jobQueue;
