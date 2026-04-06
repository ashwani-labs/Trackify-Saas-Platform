import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserApprovalPage from './pages/UserApprovalPage';
import ProjectsPage from './pages/ProjectsPage';
import './styles/variables.css';

const MainDashboard = () => (
  <div style={{ padding: '1rem' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Workspace Overview</h1>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Projects</h3>
        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</span>
      </div>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pending Tasks</h3>
        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>0</span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MainDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pending-users"
            element={
              <ProtectedRoute>
                <UserApprovalPage />
              </ProtectedRoute>
            }
          />

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

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Project Details</h1>
                    <p>Coming soon: Kanban Board and Issue List.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
