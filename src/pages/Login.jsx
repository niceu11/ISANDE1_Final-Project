import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShieldCrest from '../components/ShieldCrest';
import { api } from '../api/client';
import './Login.css';

const ROLE_ROUTES = {
  ae: '/ae/dashboard',
  manager: '/manager/dashboard',
  ceo: '/ceo/dashboard',
  staff: '/staff/dashboard',
};

const QUICK_LOGINS = [
  { label: 'AE',      email: 'paula@soireeeventsplace.com' },
  { label: 'Manager', email: 'christine@soireeeventsplace.com' },
  { label: 'CEO',     email: 'rowena@soireeeventsplace.com' },
  { label: 'Staff',   email: 'miguel@soireeeventsplace.com' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const user = await api.login(loginEmail, loginPassword);
      localStorage.setItem('soiree-user', JSON.stringify(user));
      navigate(ROLE_ROUTES[user.role] ?? '/login');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    signIn(email, password);
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

        <div className="login-quick">
          <span className="login-quick-label">Quick demo access</span>
          <div className="login-quick-buttons">
            {QUICK_LOGINS.map(r => (
              <button
                key={r.label}
                type="button"
                className="login-quick-btn"
                disabled={loading}
                onClick={() => signIn(r.email, 'password123')}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <p className="login-footer">Soirée Events Place · Internal System</p>
      </div>
    </div>
  );
}
