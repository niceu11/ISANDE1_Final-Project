import { useNavigate } from 'react-router-dom';
import './RoleSwitcher.css';

const ROLES = [
  { label: 'AE',      path: '/ae/dashboard' },
  { label: 'Manager', path: '/manager/dashboard' },
  { label: 'CEO',     path: '/ceo/dashboard' },
  { label: 'Staff',   path: '/staff/event-day' },
];

export default function RoleSwitcher() {
  const navigate = useNavigate();
  return (
    <div className="role-switcher">
      <span className="role-switcher-label">Dev</span>
      {ROLES.map(r => (
        <button key={r.label} className="role-switcher-btn" onClick={() => navigate(r.path)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
