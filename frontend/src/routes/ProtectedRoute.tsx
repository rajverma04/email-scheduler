import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
