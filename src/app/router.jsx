import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicOnlyRoute from '../components/PublicOnlyRoute';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const TransactionCreatePage = lazy(() => import('../pages/TransactionCreatePage'));
const TransactionEditPage = lazy(() => import('../pages/TransactionEditPage'));

function RouteLoader() {
  return <LoadingScreen title="กำลังเปิดหน้า" message="ระบบกำลังเตรียมข้อมูลให้พร้อมใช้งาน" fullScreen />;
}

function withSuspense(element) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route path="/register" element={withSuspense(<RegisterPage />)} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
        <Route path="/transactions/new" element={withSuspense(<TransactionCreatePage />)} />
        <Route path="/transactions/:transactionId/edit" element={withSuspense(<TransactionEditPage />)} />
        <Route path="/profile" element={withSuspense(<ProfilePage />)} />
      </Route>

      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </Routes>
  );
}

export default AppRouter;
