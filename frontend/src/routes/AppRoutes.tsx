import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthCallback } from '@/features/auth/AuthCallback';
import { Login } from '@/features/auth/Login';

// Lazy load features
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Schedule = lazy(() => import('@/features/schedule/SchedulePage').then(m => ({ default: m.SchedulePage })));
const Senders = lazy(() => import('@/features/senders/SendersPage').then(m => ({ default: m.SendersPage })));
const Emails = lazy(() => import('@/features/emails/EmailsPage').then(m => ({ default: m.EmailsPage })));
const EmailDetail = lazy(() => import('@/features/emails/EmailDetail').then(m => ({ default: m.EmailDetail })));

const SuspenseLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Suspense fallback={<SuspenseLoader />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/schedule" element={
            <Suspense fallback={<SuspenseLoader />}>
              <Schedule />
            </Suspense>
          } />
          <Route path="/senders" element={
            <Suspense fallback={<SuspenseLoader />}>
              <Senders />
            </Suspense>
          } />
          <Route path="/emails" element={
            <Suspense fallback={<SuspenseLoader />}>
              <Emails />
            </Suspense>
          } />
          <Route path="/emails/:id" element={
            <Suspense fallback={<SuspenseLoader />}>
              <EmailDetail />
            </Suspense>
          } />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
