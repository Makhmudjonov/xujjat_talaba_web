// src/components/RoleBasedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

type RoleBasedRouteProps = {
  allowedRoles: string[];
  userRole: string | null;
  children: React.ReactElement;
};

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, userRole, children }) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
