import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantManagementPage from './pages/TenantManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

/**
 * App — defines all application routes.
 * BrowserRouter is provided in main.jsx (above this component).
 *
 * Route map:
 *   /           → redirect → /login
 *   /login      → LoginPage (public, guests only)
 *   /dashboard  → DashboardPage (protected)
 *   *           → redirect → /login (404 fallback)
 */
function App() {
  return (
    <Routes>
      {/* Default — redirect root to login */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* Public auth routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TENANTS}
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TenantManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 — fallback to login */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default App;
