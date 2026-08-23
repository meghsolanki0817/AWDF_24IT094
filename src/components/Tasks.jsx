import { useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api.js';

const emptyForm = { title: '', description: '' };

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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
    if (!localStorage.getItem('taskToken')) {
      window.location.replace('/login');
      return;
    }
    loadTasks();
  }, []);

  useEffect(() => {
    const redirectToLogin = () => window.location.replace('/login');
    window.addEventListener('auth-expired', redirectToLogin);
    return () => window.removeEventListener('auth-expired', redirectToLogin);
  }, []);

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
        <p className="section-label">Practical 7</p>
        <h2>Task board</h2>
        <p className="tasks-intro">A full-stack task list backed by Express, MongoDB, and synchronized React state.</p>
      </div>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs doing?" required />
        </div>
        <div className="form-group">
          <label htmlFor="task-description">Description</label>
          <textarea id="task-description" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add useful context" />
        </div>
        <div className="task-form-actions">
          <button className="submit-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update task' : 'Create task'}</button>
          {editingId && <button className="cancel-btn" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      {notice && <p className="task-notice">{notice}</p>}
      {error && <div className="message-card message-card--error">{error}<br /><button className="retry-button" onClick={loadTasks}>Retry</button></div>}
      {loading ? <div className="message-card">Loading tasks...</div> : tasks.length === 0 ? <div className="message-card">No tasks yet. Create your first one above.</div> : <div className="task-list">{tasks.map((task) => <article className={`task-card ${task.completed ? 'task-card--done' : ''}`} key={task._id}>
        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} aria-label={`Mark ${task.title} complete`} />
        <div className="task-copy"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
        <div className="task-actions"><button type="button" onClick={() => startEditing(task)}>Edit</button><button type="button" onClick={() => removeTask(task._id)}>Delete</button></div>
      </article>)}</div>}
    </section>
  );
}

export default Tasks;