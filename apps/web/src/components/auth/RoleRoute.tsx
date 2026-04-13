import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export const RoleRoute = ({
  children,
  roles
}: {
  children: ReactNode;
  roles: Array<'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'>;
}) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
