const eventBus = require('../events/eventBus');

// Practical 10 Consumer 1: Asynchronous Audit Logging Service
const auditLogs = [];

// Subscribe to all domain events via the wildcard listener
eventBus.on('*', (event) => {
  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId: event.id,
    eventName: event.name,
    actor: event.payload?.userId || 'system',
    details: event.payload,
    timestamp: event.timestamp
  };

  auditLogs.unshift(logEntry);
  if (auditLogs.length > 100) auditLogs.pop();

  console.log(`[AuditService 📋] Handled ${event.name} at ${event.timestamp}`);
});

module.exports = {
  getAuditLogs: () => auditLogs
};
