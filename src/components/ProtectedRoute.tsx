import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/reduxHooks';
import { selectIsAdmin, selectIsAuthenticated } from '../store/authSlice';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

/**
 * Útvonal-őr: bejelentkezést (és opcionálisan admin szerepkört) követel meg.
 * Hozzáférés hiányában a megfelelő oldalra irányít át.
 */
export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
