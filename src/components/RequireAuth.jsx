import { Navigate } from 'react-router-dom';

export const ROLE_HOME = {
  ae: '/ae/dashboard',
  manager: '/manager/dashboard',
  ceo: '/ceo/dashboard',
  staff: '/staff/dashboard',
};

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('soiree-user'));
  } catch {
    return null;
  }
}

export default function RequireAuth({ allow, children }) {
  const user = getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  }
  return children;
}
