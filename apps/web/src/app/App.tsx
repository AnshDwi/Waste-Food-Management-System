import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks';
import { AppShell } from '../components/layout/AppShell';
import { PageTransition } from '../components/ui/PageTransition';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleRoute } from '../components/auth/RoleRoute';
import { ToastViewport, pushToast } from '../components/ui/ToastViewport';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DonationFlowPage } from '../pages/DonationFlowPage';
import { MapExperiencePage } from '../pages/MapExperiencePage';
import { NgoPanelPage } from '../pages/NgoPanelPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { DeliveriesPage } from '../pages/DeliveriesPage';
import { DriverPanelPage } from '../pages/DriverPanelPage';
import { DriversPage } from '../pages/DriversPage';
import { ControlRoomPage } from '../pages/ControlRoomPage';
import { logout, markActivity, restoreSession } from '../features/auth/authSlice';

const WorkspaceRoutes = () => (
  <ProtectedRoute>
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/donations"
          element={
            <RoleRoute roles={['ADMIN']}>
              <DonationFlowPage />
            </RoleRoute>
          }
        />
        <Route
          path="/map"
          element={
            <RoleRoute roles={['VOLUNTEER', 'ADMIN']}>
              <MapExperiencePage />
            </RoleRoute>
          }
        />
        <Route
          path="/ngo"
          element={
            <RoleRoute roles={['ADMIN']}>
              <NgoPanelPage />
            </RoleRoute>
          }
        />
        <Route
          path="/deliveries"
          element={
            <RoleRoute roles={['ADMIN']}>
              <DeliveriesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <RoleRoute roles={['ADMIN']}>
              <DriversPage />
            </RoleRoute>
          }
        />
        <Route
          path="/control-room"
          element={
            <RoleRoute roles={['ADMIN']}>
              <ControlRoomPage />
            </RoleRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <RoleRoute roles={['VOLUNTEER']}>
              <DriverPanelPage />
            </RoleRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <RoleRoute roles={['ADMIN']}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute roles={['ADMIN']}>
              <AdminPage />
            </RoleRoute>
          }
        />
      </Routes>
    </AppShell>
  </ProtectedRoute>
);

export const App = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { accessToken, initialized, lastActivityAt, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    const handler = () => dispatch(markActivity());
    window.addEventListener('pointerdown', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!initialized || !user || !lastActivityAt) {
      return;
    }

    const idleTimer = window.setInterval(() => {
      if (Date.now() - lastActivityAt > 30 * 60 * 1000) {
        dispatch(logout());
        pushToast('You were logged out after inactivity.', 'success');
      }
    }, 60_000);

    return () => window.clearInterval(idleTimer);
  }, [dispatch, initialized, lastActivityAt, user]);

  useEffect(() => {
    if (!accessToken || !user) {
      return;
    }

    let payload: { exp?: number } = {};
    try {
      payload = JSON.parse(atob(accessToken.split('.')[1] ?? ''));
    } catch {
      payload = {};
    }
    const expiresAt = typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now();
    const timeout = window.setTimeout(() => {
      dispatch(logout());
      pushToast('Your session expired. Please log in again.', 'error');
    }, Math.max(expiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [accessToken, dispatch, user]);

  return (
    <>
      <ToastViewport />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/app/*"
            element={
              <PageTransition>
                <WorkspaceRoutes />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};
