import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';
import { ThemeProvider } from './context/ThemeContext';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const UserApprovalPage = lazy(() => import('./pages/UserApprovalPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'glass-panel',
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-main)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Dashboard */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <DashboardPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Team — Admin only */}
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DashboardLayout>
                        <TeamPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Pending Users — Admin only */}
                <Route
                  path="/pending-users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DashboardLayout>
                        <UserApprovalPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Projects */}
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProjectsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Project Detail / Kanban */}
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProjectDetailPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
