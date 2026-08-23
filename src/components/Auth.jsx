import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api.js';

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

  return (
    <section className="section auth-section">
      <div className="section-heading">
        <h2>{isRegistering ? 'Create account' : 'Welcome back'}</h2>
        <p className="tasks-intro">Sign in to access your protected task board.</p>
      </div>
      <form className="task-form auth-form" onSubmit={handleSubmit}>
        <div className="form-group"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="form-group"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        {error && <div className="message-card message-card--error">{error}</div>}
        <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Please wait...' : isRegistering ? 'Register' : 'Login'}</button>
        <button className="auth-switch" type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>{isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}</button>
      </form>
    </section>
  );
}

export default Auth;