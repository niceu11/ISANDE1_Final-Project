import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShieldCrest from '../components/ShieldCrest';
import { api } from '../api/client';
import './Login.css';

const ROLE_ROUTES = {
  ae: '/ae/dashboard',
  manager: '/manager/dashboard',
  ceo: '/ceo/dashboard',
  staff: '/staff/event-day',
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login(email, password);
      localStorage.setItem('soiree-user', JSON.stringify(user));
      navigate(ROLE_ROUTES[user.role] ?? '/login');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <ShieldCrest size={52} color="#dcaf61" />
          <h1 className="login-brand">Soirée Hub</h1>
          <p className="login-tagline">Event Management System</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@soireeeventsplace.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--terracotta)', fontSize: 13, marginTop: -8 }}>{error}</p>
          )}

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">Soirée Events Place · Internal System</p>
      </div>
    </div>
  );
}
