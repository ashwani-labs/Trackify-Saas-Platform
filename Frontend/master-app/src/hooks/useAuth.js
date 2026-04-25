import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectAuthRole, selectAuthToken } from '../features/auth/authSlice';
import { ROUTES } from '../constants/routes';

/**
 * useAuth — reads auth state from Redux.
 * Optionally redirects to login if not authenticated (requireAuth = true).
 * Optionally redirects away from login if already authenticated (requireGuest = true).
 */
export const useAuth = ({ requireAuth = false, requireGuest = false } = {}) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectAuthRole);
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
    if (requireGuest && isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate, requireAuth, requireGuest]);

  return { isAuthenticated, role, token };
};
