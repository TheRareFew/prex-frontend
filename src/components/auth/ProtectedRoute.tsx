import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'employee' | 'customer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.includes(userRole as UserRole);

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard/customer" replace />;
    }
  }

  return <>{children}</>;
}; 