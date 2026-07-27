import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSwitcher from './components/RoleSwitcher';
import RequireAuth from './components/RequireAuth';

import Login            from './pages/Login';
import AEDashboard      from './pages/ae/Dashboard';
import Inquiries        from './pages/ae/Inquiries';
import CalendarPage     from './pages/ae/CalendarPage';
import ClientProfile    from './pages/ae/ClientProfile';
import PaymentTracker   from './pages/ae/PaymentTracker';
import ManagerDashboard from './pages/manager/Dashboard';
import CEODashboard     from './pages/ceo/Dashboard';
import EventDay         from './pages/staff/EventDay';
import Reports          from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />

        <Route path="/ae/dashboard"    element={<RequireAuth allow={['ae']}><AEDashboard /></RequireAuth>} />
        <Route path="/ae/inquiries"    element={<RequireAuth allow={['ae']}><Inquiries /></RequireAuth>} />
        <Route path="/ae/calendar"     element={<RequireAuth allow={['ae']}><CalendarPage /></RequireAuth>} />
        <Route path="/ae/clients"      element={<RequireAuth allow={['ae']}><ClientProfile /></RequireAuth>} />
        <Route path="/ae/clients/:id"  element={<RequireAuth allow={['ae']}><ClientProfile /></RequireAuth>} />
        <Route path="/ae/payments"     element={<RequireAuth allow={['ae']}><PaymentTracker /></RequireAuth>} />
        <Route path="/ae/payments/:id" element={<RequireAuth allow={['ae']}><PaymentTracker /></RequireAuth>} />

        <Route path="/manager/dashboard" element={<RequireAuth allow={['manager']}><ManagerDashboard /></RequireAuth>} />
        <Route path="/ceo/dashboard"     element={<RequireAuth allow={['ceo']}><CEODashboard /></RequireAuth>} />
        <Route path="/reports"           element={<RequireAuth allow={['manager', 'ceo']}><Reports /></RequireAuth>} />
        <Route path="/staff/event-day"   element={<RequireAuth allow={['staff']}><EventDay /></RequireAuth>} />
      </Routes>
      <RoleSwitcher />
    </BrowserRouter>
  );
}
