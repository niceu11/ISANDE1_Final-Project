import { NavLink, useNavigate } from 'react-router-dom';
import ShieldCrest from './ShieldCrest';
import { getCurrentUser } from './RequireAuth';
import './Sidebar.css';

const NAV_ITEMS = {
  ae: [
    { label: 'Dashboard',  path: '/ae/dashboard', icon: '◆' },
    { label: 'Inquiries',  path: '/ae/inquiries', icon: '✉' },
    { label: 'Calendar',   path: '/calendar',     icon: '◷' },
    { label: 'Clients',    path: '/ae/clients',   icon: '◎' },
    { label: 'Payments',   path: '/ae/payments',  icon: '◈' },
  ],
  manager: [
    { label: 'Dashboard',  path: '/manager/dashboard', icon: '◆' },
    { label: 'Calendar',   path: '/calendar',          icon: '◷' },
    { label: 'Reports',    path: '/reports',           icon: '▤' },
  ],
  ceo: [
    { label: 'Dashboard',  path: '/ceo/dashboard', icon: '◆' },
    { label: 'Calendar',   path: '/calendar',      icon: '◷' },
    { label: 'Reports',    path: '/reports',       icon: '▤' },
  ],
  staff: [
    { label: 'Dashboard',  path: '/staff/dashboard', icon: '◆' },
    { label: 'Calendar',   path: '/calendar',        icon: '◷' },
    { label: 'Event Day',  path: '/staff/event-day', icon: '✦' },
  ],
};

const ROLE_LABELS = {
  ae:      { name: 'Miss Paula', title: 'Account Executive' },
  manager: { name: 'Christine',  title: 'Events Manager' },
  ceo:     { name: 'Rowena',     title: 'CEO' },
  staff:   { name: 'Miguel',     title: 'On-site Staff' },
};

export default function Sidebar({ role }) {
  const items = NAV_ITEMS[role] ?? [];
  const sessionUser = getCurrentUser();
  const user = sessionUser?.role === role
    ? { name: sessionUser.name, title: sessionUser.title }
    : (ROLE_LABELS[role] ?? { name: role, title: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('soiree-user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <ShieldCrest size={38} color="#dcaf61" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Soirée Hub</span>
          <span className="sidebar-brand-sub">Event Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-title">{user.title}</div>
          </div>
        </div>
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Log out"
        >
          <span className="sidebar-logout-icon">⏻</span>
          <span className="sidebar-logout-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
