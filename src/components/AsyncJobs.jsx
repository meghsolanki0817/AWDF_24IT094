import { useState, useEffect } from 'react';
import { 
  getEventLogs, 
  simulateEventError, 
  clearEventLogs, 
  createTask, 
  deleteTask, 
  getTasks,
  submitJob, 
  getJobs, 
  getAuditLogs, 
  getDispatchedNotifications 
} from '../api.js';

function AsyncJobs() {
  const [eventLogs, setEventLogs] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  
  // Background jobs state
  const [jobs, setJobs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionNotice, setLastSubmissionNotice] = useState(null);
  const [sseEvents, setSseEvents] = useState([]);

  // Fetch initial data
  const loadData = async () => {
    try {
      const [logsData, jobsData, auditData, notifData] = await Promise.all([
        getEventLogs().catch(() => ({ logs: [] })),
        getJobs().catch(() => []),
        getAuditLogs().catch(() => []),
        getDispatchedNotifications().catch(() => [])
      ]);
      setEventLogs(logsData.logs || []);
      setJobs(jobsData);
      setAuditLogs(auditData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load async data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // SSE stream for real-time events
    const eventSource = new EventSource('/jobs/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type !== 'CONNECTED') {
          setSseEvents((prev) => [parsed, ...prev.slice(0, 19)]);
          if (parsed.name && parsed.name.startsWith('job:')) {
            getJobs().then(setJobs).catch(() => {});
          }
          if (parsed.name && parsed.name.startsWith('task:')) {
            getAuditLogs().then(setAuditLogs).catch(() => {});
            getDispatchedNotifications().then(setNotifications).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    const interval = setInterval(loadData, 2000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // Trigger Task Creation (with 2s slow notification listener)
  const handleCreateTaskDemo = async () => {
    setLoadingAction(true);
    setActionNotice(null);
    try {
      const startTime = Date.now();
      const taskTitle = `Background Task (${new Date().toLocaleTimeString()})`;
      const created = await createTask({
        title: taskTitle,
        description: 'Testing non-blocking EventEmitter notification handler'
      });
      const responseTime = Date.now() - startTime;
      const apiTimestamp = new Date().toISOString();

      setActionNotice({
        status: 'SUCCESS',
        message: `[API] Response 201 Created returned in ${responseTime}ms at ${apiTimestamp}. Notification handler is now running asynchronously in the background (2s delay).`,
        task: created,
        apiTimestamp
      });

      // Poll event logs after 2.3s to display listener execution
      setTimeout(loadData, 2300);
    } catch (err) {
      setActionNotice({ status: 'ERROR', message: err.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Trigger Task Deletion (with 1.5s listener)
  const handleDeleteTaskDemo = async () => {
    setLoadingAction(true);
    setActionNotice(null);
    try {
      // Fetch current tasks to get an ID
      const tasks = await getTasks().catch(() => []);
      if (!tasks || tasks.length === 0) {
        setActionNotice({
          status: 'WARNING',
          message: 'No tasks available to delete. Please create a task first!'
        });
        return;
      }
      const target = tasks[0];
      const startTime = Date.now();
      await deleteTask(target._id);
      const responseTime = Date.now() - startTime;
      const apiTimestamp = new Date().toISOString();

      setActionNotice({
        status: 'SUCCESS',
        message: `[API] Delete response 200 OK returned in ${responseTime}ms at ${apiTimestamp}. Deletion notification running in background.`,
        apiTimestamp
      });

      setTimeout(loadData, 1800);
    } catch (err) {
      setActionNotice({ status: 'ERROR', message: err.message });
    } finally {
      setLoadingAction(false);
    }
  };

  // Simulate Error Event
  const handleSimulateError = async () => {
    setLoadingAction(true);
    setActionNotice(null);
    try {
      const res = await simulateEventError();
      setActionNotice({
        status: 'INFO',
        message: res.message
      });
      setTimeout(loadData, 1000);
    } catch (err) {
      setActionNotice({ status: 'ERROR', message: err.message });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearEventLogs();
      setEventLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchJob = async (type) => {
    try {
      setSubmitting(true);
      const res = await submitJob(type, { triggeredFrom: 'WebUI', requestedAt: new Date().toISOString() });
      setLastSubmissionNotice(res);
      await loadData();
    } catch (err) {
      alert('Error launching job: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section async-jobs-section" id="async-jobs">
      <div className="section-heading">
        <p className="section-label">Event-Driven Architecture</p>
        <h2>Asynchronous Processing Center</h2>
        <p style={{ color: '#cbd5e1', marginTop: '8px' }}>
          Decoupled background processing using Node.js native <code>EventEmitter</code> and asynchronous event streams.
        </p>
      </div>

      {/* Non-Blocking Execution Console */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.25rem' }}>
              🎯 Live EventEmitter Non-Blocking Execution Console
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Observe how the API response returns instantly while the notification listener finishes <strong>2 seconds later</strong> in the background.
            </p>
          </div>
          <button
            onClick={handleClearLogs}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94a3b8',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            🗑️ Clear Logs
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            type="button"
            className="submit-btn"
            disabled={loadingAction}
            onClick={handleCreateTaskDemo}
            style={{ background: '#2563eb', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
          >
            ⚡ POST /tasks (Slow 2s Notification)
          </button>

          <button
            type="button"
            className="submit-btn"
            disabled={loadingAction}
            onClick={handleDeleteTaskDemo}
            style={{ background: '#dc2626', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
          >
            🗑️ DELETE /tasks/:id (task-deleted Event)
          </button>

          <button
            type="button"
            className="submit-btn"
            disabled={loadingAction}
            onClick={handleSimulateError}
            style={{ background: '#d97706', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
          >
            ⚠️ Trigger Error Event (Handled Safely)
          </button>
        </div>

        {/* Interactive Notice */}
        {actionNotice && (
          <div style={{
            background: actionNotice.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : actionNotice.status === 'INFO' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${actionNotice.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.4)' : actionNotice.status === 'INFO' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '0.88rem',
            color: actionNotice.status === 'SUCCESS' ? '#a7f3d0' : actionNotice.status === 'INFO' ? '#bfdbfe' : '#fca5a5'
          }}>
            {actionNotice.message}
          </div>
        )}

        {/* Live EventEmitter Log Table */}
        <div style={{
          background: '#090d16',
          borderRadius: '12px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#cbd5e1',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Event Name / Handler</span>
            <span>Completion Timestamp (Non-Blocking Delay Proof)</span>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '8px' }}>
            {eventLogs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No events recorded yet. Click one of the buttons above to test live event dispatch!
              </div>
            ) : (
              eventLogs.map((log) => (
                <div key={log.id} style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginRight: '8px',
                      background: log.status === 'CAUGHT' ? '#ef4444' : log.event === 'task-deleted' ? '#f59e0b' : '#10b981',
                      color: '#ffffff'
                    }}>
                      {log.event}
                    </span>
                    <strong style={{ color: '#f1f5f9' }}>{log.message || log.title}</strong>
                    {log.delayMs && (
                      <span style={{ color: '#38bdf8', marginLeft: '8px', fontSize: '0.75rem' }}>
                        ⏱️ +{log.delayMs}ms delay completed
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem', textAlign: 'right' }}>
                    {log.completionTime || log.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Architecture Concepts Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ margin: '0 0 16px', color: '#38bdf8', fontSize: '1.15rem' }}>
          💡 Architecture &amp; Non-Blocking Processing Insights
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: '#60a5fa', margin: '0 0 8px', fontSize: '0.95rem' }}>
              1. Non-Blocking Response Mechanism
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
              In Node.js, <code>res.status(201).json()</code> writes response headers and data to the socket immediately. Event listener callbacks are offloaded to the event loop, executing on subsequent ticks without blocking HTTP clients.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: '#34d399', margin: '0 0 8px', fontSize: '0.95rem' }}>
              2. Decoupled Side-Effects
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
              Decoupling slow side-effects (e.g., email/SMS dispatch or analytics logging) prevents requests from stalling. Latency remains at ~10ms instead of spiking by 2,000ms+ for each operation.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 8px', fontSize: '0.95rem' }}>
              3. In-Process vs Distributed Queues
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
              <code>EventEmitter</code> is lightweight and zero-dependency for single-instance Node.js apps. High-scale multi-container production environments use persistent distributed message brokers (RabbitMQ, Redis Streams, BullMQ, Kafka).
            </p>
          </div>
        </div>
      </div>

      {/* Background Job Queue Section (HTTP 202 Async Pattern) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#60a5fa', fontSize: '1.2rem' }}>
          ⚡ Background Job Worker Queue (HTTP 202 Pattern)
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '18px' }}>
          Submits long-running background batch jobs returning instant <strong>HTTP 202 Accepted</strong> status.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="submit-btn"
            disabled={submitting}
            onClick={() => handleLaunchJob('BATCH_TASK_EXPORT')}
            style={{ background: '#2563eb', padding: '10px 18px', cursor: 'pointer' }}
          >
            🚀 Export Task Report (Async)
          </button>
          <button
            type="button"
            className="submit-btn"
            disabled={submitting}
            onClick={() => handleLaunchJob('DATA_ARCHIVE_SYNC')}
            style={{ background: '#059669', padding: '10px 18px', cursor: 'pointer' }}
          >
            📦 Archive &amp; Sync Data (Async)
          </button>
          <button
            type="button"
            className="submit-btn"
            disabled={submitting}
            onClick={() => handleLaunchJob('AI_METRIC_ANALYSIS')}
            style={{ background: '#7c3aed', padding: '10px 18px', cursor: 'pointer' }}
          >
            🤖 AI Analytics Batch (Async)
          </button>
        </div>

        {lastSubmissionNotice && (
          <div style={{
            marginTop: '18px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.86rem',
            color: '#a7f3d0'
          }}>
            <strong>HTTP 202 Accepted:</strong> {lastSubmissionNotice.message} (Job ID: <code>{lastSubmissionNotice.jobId}</code>)
          </div>
        )}
      </div>

      {/* Grid: Active Jobs & Live SSE Console */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Job Queue Status */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 16px', color: '#93c5fd', fontSize: '1.1rem' }}>
            📋 Background Job Queue ({jobs.length})
          </h3>
          {jobs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No jobs enqueued yet. Submit one above to start processing.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
              {jobs.map((job) => (
                <div key={job.id} style={{
                  background: '#1e293b',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f8fafc' }}>{job.jobType}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: job.status === 'COMPLETED' ? '#059669' : job.status === 'PROCESSING' ? '#d97706' : '#475569',
                      color: '#fff'
                    }}>
                      {job.status} ({job.progress}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{
                      width: `${job.progress}%`,
                      height: '100%',
                      background: job.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    ID: <code>{job.id}</code>
                    {job.result && <div style={{ color: '#34d399', marginTop: '4px' }}>Result: {job.result.summary} ({job.result.executionTimeMs}ms)</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live SSE Stream Console */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem' }}>
              📡 Live Event Stream (SSE)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
              Live Connected
            </span>
          </div>

          <div style={{
            background: '#090d16',
            borderRadius: '10px',
            padding: '12px',
            height: '280px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            {sseEvents.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>Listening for live events from EventEmitter... Create a task or submit an async job to see events fire in real time.</div>
            ) : (
              sseEvents.map((evt, idx) => (
                <div key={idx} style={{ marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                  <span style={{ color: '#38bdf8' }}>[{new Date(evt.timestamp).toLocaleTimeString()}]</span>{' '}
                  <strong style={{ color: '#34d399' }}>{evt.name}</strong>:{' '}
                  <span style={{ color: '#cbd5e1' }}>{JSON.stringify(evt.payload)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Asynchronous Consumers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 14px', color: '#fbbf24', fontSize: '1.05rem' }}>
            📋 Asynchronous Audit Log Consumer
          </h3>
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No audit logs recorded yet.</div>
            ) : (
              auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc' }}>
                    <strong>{log.eventName}</strong>
                    <span style={{ color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                    Actor: {log.actor} | ID: {log.id}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '16px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 14px', color: '#c084fc', fontSize: '1.05rem' }}>
            🔔 Asynchronous Notification Consumer
          </h3>
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No notifications dispatched yet. Create a task to trigger background dispatch!</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} style={{ background: '#1e293b', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f8fafc' }}>
                    <span>{n.subject}</span>
                    <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>{n.status}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                    Channel: {n.channel} | To: {n.recipient}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AsyncJobs;
