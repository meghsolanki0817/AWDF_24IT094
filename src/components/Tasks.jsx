import { useEffect, useState, lazy, Suspense } from 'react';
import { createTask, deleteTask, getTasks, updateTask, generateAiDescription } from '../api.js';

// Supplementary Problem: Lazy loading heavy components on demand
const TaskAnalytics = lazy(() => import('./TaskAnalytics.jsx'));
const HeavyChart = lazy(() => import('./HeavyChart.jsx'));

const emptyForm = { title: '', description: '' };

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHeavyChart, setShowHeavyChart] = useState(false);

  // AI-Powered Task Description & Suggestions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiCooldown, setAiCooldown] = useState(0);
  const [aiError, setAiError] = useState('');

  // Supplementary Problem: Rate Limiting countdown timer
  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [aiCooldown]);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      setTasks(await getTasks());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Practical CO6: Call secure backend AI endpoint
  const handleGenerateAiDescription = async () => {
    if (!form.title.trim()) {
      setError('Please enter a task title first so the AI can generate a relevant description.');
      return;
    }
    if (aiCooldown > 0) return;

    setAiLoading(true);
    setAiError('');
    setError('');

    try {
      const result = await generateAiDescription(form.title.trim());
      // Populate the form description as an editable suggestion
      setForm((prev) => ({
        ...prev,
        description: result.description || prev.description
      }));
      setAiSuggestion(result);
      setAiCooldown(10); // 10-second client-side cooldown
      setNotice(
        result.fallback
          ? 'ℹ️ Smart fallback description applied (Graceful degradation active).'
          : '✨ AI description generated successfully! You can review or edit it below.'
      );
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI description.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await updateTask(editingId, form);
        setNotice('Task updated successfully.');
      } else {
        const optimisticTask = { ...form, _id: `optimistic-${Date.now()}`, completed: false };
        setTasks((currentTasks) => [optimisticTask, ...currentTasks]);
        await createTask(form);
        setNotice('Task created successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      setAiSuggestion(null);
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setForm({ title: task.title, description: task.description || '' });
    setNotice('');
    setAiSuggestion(null);
  };

  const toggleTask = async (task) => {
    setError('');
    try {
      await updateTask(task._id, { title: task.title, description: task.description, completed: !task.completed });
      setTasks(await getTasks());
      setNotice('Task status updated.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const removeTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setError('');
    try {
      await deleteTask(id);
      setTasks(await getTasks());
      setNotice('Task deleted successfully.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="section tasks-section">
      <div className="section-heading">
        <p className="section-label">Task Management</p>
        <h2>Task board</h2>
        <p className="tasks-intro">A full-stack task list backed by Express, MongoDB, and AI-powered task assistance.</p>
      </div>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="task-title" style={{ margin: 0 }}>Title</label>
            <button
              type="button"
              className="ai-generate-btn"
              onClick={handleGenerateAiDescription}
              disabled={aiLoading || aiCooldown > 0}
              title="Auto-generate an actionable task description using AI"
            >
              {aiLoading ? (
                <>⏳ Generating with AI...</>
              ) : aiCooldown > 0 ? (
                <>⏳ Wait {aiCooldown}s</>
              ) : (
                <>✨ Generate description with AI</>
              )}
            </button>
          </div>
          <input
            id="task-title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="e.g. Implement Docker containerization or Fix navigation bug"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            rows="3"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Add context manually or click 'Generate description with AI' above"
          />
        </div>

        {/* AI Suggestion Metadata Card & Disclaimer */}
        {aiSuggestion && (
          <div className={`ai-suggestion-box ${aiSuggestion.fallback ? 'ai-suggestion-box--fallback' : 'ai-suggestion-box--live'}`}>
            <div className="ai-suggestion-header">
              <span className="ai-badge">
                {aiSuggestion.fallback ? '🛡️ Graceful Fallback Mode' : '✨ AI-Generated Suggestion'}
              </span>
              <span className="ai-provider-tag">{aiSuggestion.provider}</span>
            </div>

            <div className="ai-meta-grid">
              {aiSuggestion.suggestedPriority && (
                <div className="ai-meta-item">
                  <span className="ai-meta-label">Suggested Priority:</span>
                  <span className={`priority-pill priority-pill--${aiSuggestion.suggestedPriority.toLowerCase()}`}>
                    {aiSuggestion.suggestedPriority}
                  </span>
                </div>
              )}
              {aiSuggestion.suggestedDeadline && (
                <div className="ai-meta-item">
                  <span className="ai-meta-label">Estimated Deadline:</span>
                  <span className="ai-deadline-val">{aiSuggestion.suggestedDeadline}</span>
                </div>
              )}
            </div>

            <p className="ai-disclaimer">
              ⚠️ <strong>Disclaimer:</strong> {aiSuggestion.disclaimer || 'This suggestion was generated by AI. Please review, edit, or customize it above before saving.'}
            </p>
          </div>
        )}

        {aiError && (
          <div className="message-card message-card--error">
            {aiError}
          </div>
        )}

        <div className="task-form-actions">
          <button className="submit-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update task' : 'Create task'}</button>
          {editingId && <button className="cancel-btn" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setAiSuggestion(null); }}>Cancel</button>}
        </div>
      </form>
      {notice && <p className="task-notice">{notice}</p>}
      {error && <div className="message-card message-card--error">{error}<br /><button className="retry-button" onClick={loadTasks}>Retry</button></div>}
      {loading ? <div className="message-card">Loading tasks...</div> : tasks.length === 0 ? <div className="message-card">No tasks yet. Create your first one above.</div> : <div className="task-list">{tasks.map((task) => <article className={`task-card ${task.completed ? 'task-card--done' : ''}`} key={task._id}>
        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} />
        <div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
        <div className="task-actions"><button type="button" onClick={() => startEditing(task)}>Edit</button><button type="button" onClick={() => removeTask(task._id)}>Delete</button></div>
      </article>)}</div>}

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="submit-btn"
          style={{ background: '#2563eb', padding: '12px 24px', cursor: 'pointer' }}
          onClick={() => setShowAnalytics((prev) => !prev)}
        >
          {showAnalytics ? 'Hide Analytics' : '📊 View Task Analytics (Lazy-Loaded)'}
        </button>

        <button
          type="button"
          className="submit-btn"
          style={{ background: '#059669', padding: '12px 24px', cursor: 'pointer' }}
          onClick={() => setShowHeavyChart((prev) => !prev)}
        >
          {showHeavyChart ? 'Hide Heavy Chart' : '📈 View Heavy Chart (Lazy-Loaded)'}
        </button>
      </div>

      {showAnalytics && (
        <Suspense fallback={<div className="message-card">Loading Task Analytics chunk...</div>}>
          <TaskAnalytics tasks={tasks} />
        </Suspense>
      )}

      {showHeavyChart && (
        <Suspense fallback={<div className="message-card">Loading HeavyChart chunk...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </section>
  );
}

export default Tasks;