import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

import ErrorBoundary from './components/ui/ErrorBoundary';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy-Loaded Pages for optimized chunk splitting
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Bids = lazy(() => import('./pages/bids/Bids'));
const Workflow = lazy(() => import('./pages/workflow/Workflow'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const AiInsights = lazy(() => import('./pages/ai-insights/AiInsights'));
const Team = lazy(() => import('./pages/team/Team'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const AuditLogs = lazy(() => import('./pages/audit-logs/AuditLogs'));
const Unauthorized = lazy(() => import('./pages/auth/Unauthorized'));

// Premium dynamic loader fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/10 border-t-blue-500" />
      <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse">Loading workspace...</span>
    </div>
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        {/* Toast notifications configuration */}
        <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bids" element={<Bids />} />
              <Route path="/workflow" element={<Workflow />} />
              
              {/* Guarded Analytics Route */}
              <Route element={<ProtectedRoute requiredPermission="access-analytics" />}>
                <Route path="/analytics" element={<Analytics />} />
              </Route>
              
              <Route path="/ai-insights" element={<AiInsights />} />
              <Route path="/team" element={<Team />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Guarded Settings Route */}
              <Route element={<ProtectedRoute requiredPermission="access-settings" />}>
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="/profile" element={<Profile />} />
              
              {/* Guarded Audit Logs Route */}
              <Route element={<ProtectedRoute requiredPermission="manage-users" />}>
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;