const eventBus = require('../events/eventBus');

// Practical 10 Consumer 2: Asynchronous Notification & Alert Service
const notificationQueue = [];

// Listen to task creation event
eventBus.on('task:created', (event) => {
  // Simulate asynchronous background notification dispatch (e.g., SMTP email / Slack webhook)
  setTimeout(() => {
    const notice = {
      id: `notif-${Date.now()}`,
      channel: 'email',
      recipient: `user-${event.payload.userId || 'megh'}@example.com`,
      subject: `New Task Created: "${event.payload.title}"`,
      status: 'SENT',
      dispatchedAt: new Date().toISOString()
    };
    notificationQueue.unshift(notice);
    if (notificationQueue.length > 50) notificationQueue.pop();
    console.log(`[NotificationService 🔔] Sent email to ${notice.recipient} for task "${event.payload.title}"`);
  }, 1200); // 1.2s async simulated dispatch delay (completely non-blocking)
});

// Listen to task completion event
eventBus.on('task:updated', (event) => {
  if (event.payload.completed) {
    setTimeout(() => {
      const notice = {
        id: `notif-${Date.now()}`,
        channel: 'in-app',
        recipient: `user-${event.payload.userId || 'megh'}@example.com`,
        subject: `Task Completed: "${event.payload.title}"`,
        status: 'DELIVERED',
        dispatchedAt: new Date().toISOString()
      };
      notificationQueue.unshift(notice);
      if (notificationQueue.length > 50) notificationQueue.pop();
      console.log(`[NotificationService 🔔] Sent completion alert for task "${event.payload.title}"`);
    }, 800);
  }
});

// Listen to async background job completion
eventBus.on('job:completed', (event) => {
  const notice = {
    id: `notif-${Date.now()}`,
    channel: 'webhook',
    recipient: 'admin@system.local',
    subject: `Async Job [${event.payload.jobType}] Completed Successfully`,
    status: 'DELIVERED',
    dispatchedAt: new Date().toISOString()
  };
  notificationQueue.unshift(notice);
  if (notificationQueue.length > 50) notificationQueue.pop();
});

module.exports = {
  getNotifications: () => notificationQueue
};
