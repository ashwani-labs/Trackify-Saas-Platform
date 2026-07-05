import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from './constants/routes';
import { ThemeProvider } from './context/ThemeContext';
import { MasterSearchProvider } from './context/MasterSearchContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantManagementPage from './pages/TenantManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { ErrorBoundary } from '@trackify/shared';

function App() {
  return (
    <ErrorBoundary homeHref={ROUTES.LOGIN}>
      <ThemeProvider>
        <MasterSearchProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
          <Routes>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
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
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </MasterSearchProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
