import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserApprovalPage from './pages/UserApprovalPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TeamPage from './pages/TeamPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: '#161b22', color: '#f0f6fc', border: '1px solid #30363d' } }} />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Team — Admin only */}
          <Route path="/team" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout><TeamPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Pending Users — Admin only */}
          <Route path="/pending-users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout><UserApprovalPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Projects */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <DashboardLayout><ProjectsPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Project Detail / Kanban */}
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <DashboardLayout><ProjectDetailPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
