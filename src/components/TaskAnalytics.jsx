import { useEffect, useState } from 'react';
import { getCacheStats, clearCache } from '../api.js';

function TaskAnalytics({ tasks = [] }) {
  const [cacheStats, setCacheStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getCacheStats();
      setCacheStats(data);
    } catch (err) {
      console.error('Failed to load cache stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFlushCache = async () => {
    try {
      await clearCache();
      await fetchStats();
      alert('In-memory cache flushed successfully!');
    } catch (err) {
      alert('Failed to flush cache: ' + err.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
      <div style={{ marginBottom: '24px' }}>
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

      {/* Practical 9: In-Memory Caching (node-cache) Live Monitor */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <strong style={{ color: '#34d399', fontSize: '1.05rem' }}>Practical 9: In-Memory Caching Monitor (`node-cache`)</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchStats}
              disabled={loadingStats}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {loadingStats ? 'Loading...' : '🔄 Refresh Stats'}
            </button>
            <button
              onClick={handleFlushCache}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🗑️ Flush Cache
            </button>
          </div>
        </div>

        {cacheStats ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Cache Hits</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#34d399' }}>
                  {cacheStats.internalStats?.hits ?? 0}
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Cache Misses</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#f87171' }}>
                  {cacheStats.internalStats?.misses ?? 0}
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Active Keys</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#60a5fa' }}>
                  {cacheStats.internalStats?.keys ?? 0}
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Default TTL</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fbbf24' }}>
                  {cacheStats.ttlSeconds ?? 60}s
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              <div><strong>Cached Keys:</strong> {cacheStats.activeKeys?.length > 0 ? cacheStats.activeKeys.join(', ') : 'None (Cache is currently empty)'}</div>
              {cacheStats.metrics?.lastInvalidation && (
                <div style={{ marginTop: '4px', color: '#a7f3d0' }}>
                  <strong>Last Invalidation:</strong> Key `{cacheStats.metrics.lastInvalidation.key}` at {new Date(cacheStats.metrics.lastInvalidation.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading cache metrics...</div>
        )}
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
        <strong style={{ color: '#e2e8f0' }}>⚡ Practical 8 &amp; 9 Optimization Summary:</strong> Route components and heavy charts are split with <code>React.lazy()</code> for fast frontend bundles, while backend queries are accelerated with <code>node-cache</code> in-memory caching (60s TTL) with automatic invalidation on writes.
      </div>
    </div>
  );
}

export default TaskAnalytics;
