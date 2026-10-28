const taskEvents = require('./events');

/**
 * Practical 10: Event Listeners Module
 * Registers asynchronous listeners for domain events using Node.js native EventEmitter.
 * Includes artificial delays to demonstrate non-blocking execution and error handling.
 */

// In-memory record of event executions for inspection and demonstration
const eventLogs = [];

const recordLog = (entry) => {
  eventLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  });
  if (eventLogs.length > 50) {
    eventLogs.pop();
  }
};

// 1. Register listener for 'task-created' event (Step 2 & Supplementary Problems)
taskEvents.on('task-created', (task) => {
  const handlerStartTime = new Date().toISOString();
  
  // Supplementary Problem: Catch any error thrown inside the task-created handler
  try {
    if (task.simulateError || task.title === 'TRIGGER_ERROR') {
      throw new Error(`Simulated notification failure for task "${task.title}"`);
    }

    // Step 5: Add an artificial delay (2 seconds) inside the listener
    // to simulate a slow notification handler (e.g. email/SMS/webhook dispatch)
    setTimeout(() => {
      const completionTime = new Date().toISOString();
      const logMessage = `[Notification] Task "${task.title}" created at ${completionTime} (Assigned User: ${task.userId || 'User-24IT094'})`;
      
      console.log(logMessage);

      recordLog({
        type: 'NOTIFICATION_TASK_CREATED',
        event: 'task-created',
        taskId: task._id || task.id,
        title: task.title,
        userId: task.userId || 'User-24IT094',
        handlerStartTime,
        completionTime,
        delayMs: 2000,
        message: logMessage,
        status: 'SUCCESS'
      });
    }, 2000); // 2000ms delay to make asynchronous non-blocking behavior clearly visible
  } catch (err) {
    // Supplementary Problem: Forward caught error to the dedicated error event listener
    recordLog({
      type: 'NOTIFICATION_ERROR',
      event: 'task-created',
      taskId: task._id || task.id,
      title: task.title,
      error: err.message,
      handlerStartTime,
      status: 'FAILED'
    });
    taskEvents.emit('error', err);
  }
});

// 2. Supplementary Problem: Register listener for 'task-deleted' event
taskEvents.on('task-deleted', (task) => {
  const handlerStartTime = new Date().toISOString();
  
  // Simulate slow asynchronous audit/notification dispatch (1.5 seconds)
  setTimeout(() => {
    const completionTime = new Date().toISOString();
    const logMessage = `[Notification] Task "${task.title || task.id}" deleted at ${completionTime} (Assigned User: ${task.userId || 'User-24IT094'})`;
    
    console.log(logMessage);

    recordLog({
      type: 'NOTIFICATION_TASK_DELETED',
      event: 'task-deleted',
      taskId: task._id || task.id,
      title: task.title || task.id,
      userId: task.userId || 'User-24IT094',
      handlerStartTime,
      completionTime,
      delayMs: 1500,
      message: logMessage,
      status: 'SUCCESS'
    });
  }, 1500);
});

// 3. Supplementary Problem: Dedicated error event listener
// Important: Node.js EventEmitter throws an uncaught exception if an 'error' event
// is emitted without an active listener. Registering this guarantees process stability.
taskEvents.on('error', (err) => {
  const errorTime = new Date().toISOString();
  const errorMessage = `[Error Listener] Caught EventEmitter error at ${errorTime}: ${err.message}`;
  
  console.error(errorMessage);

  recordLog({
    type: 'EVENT_ERROR',
    event: 'error',
    message: errorMessage,
    errorMessage: err.message,
    timestamp: errorTime,
    status: 'CAUGHT'
  });
});

console.log('[Practical 10] Task EventEmitter listeners successfully registered.');

module.exports = {
  getEventLogs: () => eventLogs,
  clearEventLogs: () => { eventLogs.length = 0; }
};
