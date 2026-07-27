import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

export default function AppLayout({ role, children }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <main className="main-content">
        {children}
      </main>
      <NotificationPanel />
    </div>
  );
}
