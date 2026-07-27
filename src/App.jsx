import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSwitcher from './components/RoleSwitcher';

import Login            from './pages/Login';
import AEDashboard      from './pages/ae/Dashboard';
import Inquiries        from './pages/ae/Inquiries';
import CalendarPage     from './pages/ae/CalendarPage';
import ClientProfile    from './pages/ae/ClientProfile';
import PaymentTracker   from './pages/ae/PaymentTracker';
import ManagerDashboard from './pages/manager/Dashboard';
import CEODashboard     from './pages/ceo/Dashboard';
import EventDay         from './pages/staff/EventDay';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<Login />} />

        <Route path="/ae/dashboard"    element={<AEDashboard />} />
        <Route path="/ae/inquiries"    element={<Inquiries />} />
        <Route path="/ae/calendar"     element={<CalendarPage />} />
        <Route path="/ae/clients"      element={<ClientProfile />} />
        <Route path="/ae/clients/:id"  element={<ClientProfile />} />
        <Route path="/ae/payments"     element={<PaymentTracker />} />
        <Route path="/ae/payments/:id" element={<PaymentTracker />} />

        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/ceo/dashboard"     element={<CEODashboard />} />
        <Route path="/staff/event-day"   element={<EventDay />} />
      </Routes>
      <RoleSwitcher />
    </BrowserRouter>
  );
}
