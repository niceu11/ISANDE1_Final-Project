import { NavLink, useNavigate } from 'react-router-dom';
import ShieldCrest from './ShieldCrest';
import { getCurrentUser } from './RequireAuth';
import {
  DashboardIcon, InquiriesIcon, CalendarIcon, ClientsIcon,
  PaymentsIcon, ReportsIcon, EventDayIcon, HistoryIcon, LogoutIcon,
} from './icons/NavIcons';
import './Sidebar.css';

const NAV_ITEMS = {
  ae: [
    { label: 'Dashboard',  path: '/ae/dashboard', Icon: DashboardIcon },
    { label: 'Inquiries',  path: '/ae/inquiries', Icon: InquiriesIcon },
    { label: 'Calendar',   path: '/calendar',     Icon: CalendarIcon },
    { label: 'Clients',    path: '/ae/clients',   Icon: ClientsIcon },
    { label: 'Payments',   path: '/ae/payments',  Icon: PaymentsIcon },
  ],
  manager: [
    { label: 'Dashboard',  path: '/manager/dashboard', Icon: DashboardIcon },
    { label: 'Calendar',   path: '/calendar',          Icon: CalendarIcon },
    { label: 'Reports',    path: '/reports',           Icon: ReportsIcon },
    { label: 'History',    path: '/history',           Icon: HistoryIcon },
  ],
  ceo: [
    { label: 'Dashboard',  path: '/ceo/dashboard', Icon: DashboardIcon },
    { label: 'Calendar',   path: '/calendar',      Icon: CalendarIcon },
    { label: 'Reports',    path: '/reports',       Icon: ReportsIcon },
    { label: 'History',    path: '/history',       Icon: HistoryIcon },
  ],
  staff: [
    { label: 'Dashboard',  path: '/staff/dashboard', Icon: DashboardIcon },
    { label: 'Calendar',   path: '/calendar',        Icon: CalendarIcon },
    { label: 'Event Day',  path: '/staff/event-day', Icon: EventDayIcon },
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
        {items.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar-link-icon"><Icon /></span>
            <span className="sidebar-link-label">{label}</span>
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
          <span className="sidebar-logout-icon"><LogoutIcon width={14} height={14} /></span>
          <span className="sidebar-logout-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
