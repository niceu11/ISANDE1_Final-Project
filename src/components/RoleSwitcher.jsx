import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ROLE_HOME } from './RequireAuth';
import './RoleSwitcher.css';

const ROLES = [
  { label: 'AE',      email: 'paula@soireeeventsplace.com' },
  { label: 'Manager', email: 'christine@soireeeventsplace.com' },
  { label: 'CEO',     email: 'rowena@soireeeventsplace.com' },
  { label: 'Staff',   email: 'miguel@soireeeventsplace.com' },
];

export default function RoleSwitcher() {
  const navigate = useNavigate();

  const switchTo = async (email) => {
    try {
      const user = await api.login(email, 'password123');
      localStorage.setItem('soiree-user', JSON.stringify(user));
      navigate(ROLE_HOME[user.role] ?? '/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="role-switcher">
      <span className="role-switcher-label">Dev</span>
      {ROLES.map(r => (
        <button key={r.label} className="role-switcher-btn" onClick={() => switchTo(r.email)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
