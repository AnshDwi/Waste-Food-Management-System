import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { initialized, user } = useAppSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel-strong w-full max-w-md rounded-[32px] p-6">
          <div className="skeleton-shimmer h-6 w-32 rounded-xl" />
          <div className="skeleton-shimmer mt-4 h-12 w-full rounded-2xl" />
          <div className="skeleton-shimmer mt-3 h-12 w-5/6 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
