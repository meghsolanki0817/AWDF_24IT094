const EventEmitter = require('events');

/**
 * Practical 10: Event-Driven Architecture
 * Centralized Event Bus extending Node.js EventEmitter.
 * Handles decoupled publishing and asynchronous consumption of domain events.
 */
class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase listener limit to prevent memory leak warnings in busy event systems
    this.setMaxListeners(30);
    this.eventHistory = [];
  }

  /**
   * Publish an event asynchronously and maintain in-memory audit trail of recent events
   * @param {string} eventName 
   * @param {object} payload 
   */
  publish(eventName, payload = {}) {
    const eventRecord = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: eventName,
      payload,
      timestamp: new Date().toISOString()
    };

    // Store in circular history (last 50 events)
    this.eventHistory.unshift(eventRecord);
    if (this.eventHistory.length > 50) {
      this.eventHistory.pop();
    }

    // Emit event non-blockingly using setImmediate so publisher returns instantly
    setImmediate(() => {
      this.emit(eventName, eventRecord);
      this.emit('*', eventRecord); // Wildcard listener for debug/SSE streams
    });

    return eventRecord;
  }

  getHistory() {
    return this.eventHistory;
  }
}

const eventBus = new AppEventBus();
module.exports = eventBus;
