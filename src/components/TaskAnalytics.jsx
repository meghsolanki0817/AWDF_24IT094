function TaskAnalytics({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="task-analytics-card" style={{
      background: 'rgba(30, 41, 59, 0.75)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '18px',
      padding: '24px',
      marginTop: '28px',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
      animation: 'fadeIn 0.5s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.3rem' }}>
          📊 Task &amp; Performance Analytics (Lazy-Loaded Component)
        </h3>
        <span style={{
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#93c5fd',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '999px',
          padding: '4px 12px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          Code-split Chunk: TaskAnalytics.jsx
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Tasks</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc' }}>{total}</div>
        </div>
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Completed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#34d399' }}>{completed}</div>
        </div>
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pending</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>{pending}</div>
        </div>
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Completion Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>{completionRate}%</div>
        </div>
      </div>

      {/* Visual SVG Progress Bar / Chart */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <span>Completion Progress</span>
          <span>{completionRate}% Completed</span>
        </div>
        <div style={{ width: '100%', height: '14px', background: '#334155', borderRadius: '7px', overflow: 'hidden' }}>
          <div style={{
            width: `${completionRate}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: '7px',
            transition: 'width 0.8s ease'
          }} />
        </div>
      </div>

      {/* Practical 8 Metrics Snapshot */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderLeft: '4px solid #3b82f6',
        borderRadius: '8px',
        padding: '14px 18px',
        fontSize: '0.88rem',
        color: '#94a3b8',
        lineHeight: 1.6
      }}>
        <strong style={{ color: '#e2e8f0' }}>⚡ Practical 8 Code Splitting Note:</strong> This component was not included in the initial page bundle. It was loaded dynamically on-demand only when the user requested analytics, reducing the initial bundle size and improving initial page load performance.
      </div>
    </div>
  );
}

export default TaskAnalytics;
