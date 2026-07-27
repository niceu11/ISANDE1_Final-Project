import { NavLink, useNavigate } from 'react-router-dom';
import ShieldCrest from './ShieldCrest';
import NotificationBell from './NotificationBell';
import { getCurrentUser } from './RequireAuth';
import './Sidebar.css';

const NAV_ITEMS = {
  ae: [
    { label: 'Dashboard',  path: '/ae/dashboard' },
    { label: 'Inquiries',  path: '/ae/inquiries' },
    { label: 'Calendar',   path: '/calendar' },
    { label: 'Clients',    path: '/ae/clients' },
    { label: 'Payments',   path: '/ae/payments' },
  ],
  manager: [
    { label: 'Dashboard',  path: '/manager/dashboard' },
    { label: 'Calendar',   path: '/calendar' },
    { label: 'Reports',    path: '/reports' },
  ],
  ceo: [
    { label: 'Dashboard',  path: '/ceo/dashboard' },
    { label: 'Calendar',   path: '/calendar' },
    { label: 'Reports',    path: '/reports' },
  ],
  staff: [
    { label: 'Dashboard',  path: '/staff/dashboard' },
    { label: 'Calendar',   path: '/calendar' },
    { label: 'Event Day',  path: '/staff/event-day' },
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

      <div className="sidebar-tools">
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            {item.label}
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
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
