import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, loginDemo } from '../api.js';

function Auth() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await (isRegistering ? register({ email, password }) : login({ email, password }));
      localStorage.setItem('taskToken', result.token);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/tasks');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginDemo();
      localStorage.setItem('taskToken', result.token);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/tasks');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section auth-section">
      <div className="section-heading">
        <p className="section-label">Authentication</p>
        <h2>{isRegistering ? 'Create Account' : 'Sign In'}</h2>
        <p className="tasks-intro">
          Access your secured Task Management board with JWT-protected session.
        </p>
      </div>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto 20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '0.86rem',
        color: '#bfdbfe',
        lineHeight: 1.5
      }}>
        💡 <strong>Why is this login page showing?</strong><br />
        The Task Board is protected by <strong>JWT Authentication</strong>. Only authenticated users can create, edit, and manage their personal tasks.
      </div>

      <form className="task-form auth-form" onSubmit={handleSubmit} style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 18px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}
        >
          ⚡ 1-Click Instant Demo Login
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0', color: '#64748b', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          <span>or sign in with credentials</span>
          <div style={{ flex: 1, height: '1px', background: '#334155' }} />
        </div>

        <div className="form-group">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            placeholder="e.g. megh@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="At least 6 characters"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <div className="message-card message-card--error">{error}</div>}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isRegistering ? 'Register & Enter' : 'Login'}
        </button>

        <button
          className="auth-switch"
          type="button"
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account yet? Register"}
        </button>
      </form>
    </section>
  );
}

export default Auth;