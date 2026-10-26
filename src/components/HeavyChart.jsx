function HeavyChart({ data, title = 'Task & Performance Metrics Chart' }) {
  // Sample data points if none provided
  const chartData = data || [
    { label: 'Mon', tasksCompleted: 4, bundleKiloBytes: 197 },
    { label: 'Tue', tasksCompleted: 7, bundleKiloBytes: 187 },
    { label: 'Wed', tasksCompleted: 5, bundleKiloBytes: 187 },
    { label: 'Thu', tasksCompleted: 9, bundleKiloBytes: 187 },
    { label: 'Fri', tasksCompleted: 12, bundleKiloBytes: 187 },
    { label: 'Sat', tasksCompleted: 8, bundleKiloBytes: 187 },
    { label: 'Sun', tasksCompleted: 11, bundleKiloBytes: 187 },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.tasksCompleted), 1);

  return (
    <div className="heavy-chart-container" style={{
      background: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
      color: '#f8fafc',
      animation: 'fadeIn 0.4s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '1.25rem' }}>📈 {title}</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Heavy data visualization component loaded dynamically via <code>React.lazy()</code>
          </p>
        </div>
        <span style={{
          background: 'rgba(37, 99, 235, 0.2)',
          color: '#93c5fd',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '999px',
          padding: '4px 12px',
          fontSize: '0.78rem',
          fontWeight: 600
        }}>
          Chunk: HeavyChart.jsx
        </span>
      </div>

      {/* SVG Interactive Multi-Bar / Trend Chart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '180px',
        background: '#090d16',
        borderRadius: '12px',
        padding: '20px 16px 12px',
        gap: '12px',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        {chartData.map((item, idx) => {
          const heightPercent = Math.round((item.tasksCompleted / maxVal) * 100);
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginBottom: '6px', fontWeight: 'bold' }}>
                {item.tasksCompleted}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${Math.max(heightPercent, 8)}%`,
                  background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '6px 6px 2px 2px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  transition: 'height 0.6s ease'
                }}
                title={`${item.label}: ${item.tasksCompleted} tasks completed`}
              />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Technical Note */}
      <div style={{
        marginTop: '18px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderLeft: '4px solid #10b981',
        borderRadius: '6px',
        padding: '10px 14px',
        fontSize: '0.85rem',
        color: '#cbd5e1'
      }}>
        💡 <strong>Performance Note:</strong> <code>HeavyChart.jsx</code> was split into its own chunk by Vite. It is only fetched when explicitly requested, preventing heavy chart logic and rendering math from slowing down the initial page load.
      </div>
    </div>
  );
}

export default HeavyChart;
