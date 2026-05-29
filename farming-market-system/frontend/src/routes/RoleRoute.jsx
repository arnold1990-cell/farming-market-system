import { Navigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const roleHome = {
  BUYER: '/',
  FARMER: '/farmer/dashboard',
  ADMIN: '/admin/dashboard',
  DELIVERY_AGENT: '/agent/dashboard'
};

export default function RoleRoute({ roles, children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={roleHome[user.role] || '/login'} replace />;
  return children;
}
