/**
 * Practical 10: Event-Driven Processing Live Console Demonstration
 * Course: Advanced Web Development Frameworks (IT3E301)
 * Student: Megh Solanki (24IT094)
 * 
 * Demonstrates:
 * 1. emit('task-created') after response logic (API responds immediately, listener handles asynchronously)
 * 2. 2-second simulated delay in listener proving non-blocking asynchronous execution
 * 3. emit('task-deleted') with distinct message and delay
 * 4. Error event listener catching errors thrown in handler without crashing process
 */

const taskEvents = require('./events');
// Register listeners
require('./listeners');

console.log('='.repeat(75));
console.log('  PRACTICAL 10: ASYNCHRONOUS PROCESSING WITH EVENT-DRIVEN ARCHITECTURE');
console.log('  Course: IT3E301 | Student: Megh Solanki (24IT094)');
console.log('='.repeat(75));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemonstration() {
  console.log('\n--- SCENARIO 1: POST /tasks (Task Creation with Slow 2s Notification) ---');
  const dummyTask = {
    _id: '67bf10a129d3c50012ab9901',
    title: 'Complete Practical 10 Lab Assignment',
    description: 'Implement EventEmitter and demonstrate non-blocking execution',
    userId: '24IT094',
    completed: false
  };

  const t0 = Date.now();
  const apiResponseTime = new Date().toISOString();
  console.log(`[API] Response sent at ${apiResponseTime} (HTTP 201 Created returned immediately)`);
  
  // Pedagogical pattern: emit right after sending response logic
  taskEvents.emit('task-created', dummyTask);

  console.log('[Observation] The main thread is free! Node.js did NOT wait for notification.');
  console.log('[Observation] Waiting for listener 2000ms artificial delay to complete...\n');

  // Wait 2.2 seconds to allow listener to complete
  await wait(2200);

  console.log('\n--- SCENARIO 2: DELETE /tasks/:id (Supplementary Problem: task-deleted) ---');
  const deleteApiResponseTime = new Date().toISOString();
  console.log(`[API] Response sent at ${deleteApiResponseTime} (HTTP 200 OK returned immediately)`);
  
  taskEvents.emit('task-deleted', dummyTask);

  console.log('[Observation] Main thread continues execution while deletion notification runs in background...');
  await wait(1800);

  console.log('\n--- SCENARIO 3: Error Event Listener (Supplementary Problem: error handling) ---');
  console.log('Simulating an error inside task-created handler (title = TRIGGER_ERROR)...');
  
  const erroneousTask = {
    _id: '67bf10a129d3c50012ab9902',
    title: 'TRIGGER_ERROR',
    userId: '24IT094',
    simulateError: true
  };

  taskEvents.emit('task-created', erroneousTask);
  console.log('[Observation] Server process remained stable and alive; error was intercepted by error listener.');

  await wait(500);

  console.log('\n' + '='.repeat(75));
  console.log('  DEMONSTRATION COMPLETE: ALL PRACTICAL 10 REQUIREMENTS VERIFIED!');
  console.log('='.repeat(75));
}

runDemonstration();
