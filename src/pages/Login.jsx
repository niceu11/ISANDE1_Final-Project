import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShieldCrest from '../components/ShieldCrest';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('ae');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'ae')      navigate('/ae/dashboard');
    if (role === 'manager') navigate('/manager/dashboard');
    if (role === 'ceo')     navigate('/ceo/dashboard');
    if (role === 'staff')   navigate('/staff/event-day');
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
            />
          </div>

          <div className="form-group login-role-group">
            <label className="form-label">Sign in as</label>
            <select
              className="form-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="ae">Account Executive</option>
              <option value="manager">Events Manager</option>
              <option value="ceo">CEO</option>
              <option value="staff">On-site Staff</option>
            </select>
          </div>

          <button className="btn btn-primary login-btn" type="submit">
            Sign In
          </button>
        </form>

        <p className="login-footer">Soirée Events Place · Internal System</p>
      </div>
    </div>
  );
}
