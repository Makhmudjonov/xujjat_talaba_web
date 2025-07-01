// src/components/AdminPrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminPrivateRouteProps {
  userRole: string | null;
  token: string | null;
  children: React.ReactElement;
}

const AdminPrivateRoute: React.FC<AdminPrivateRouteProps> = ({ userRole, token, children }) => {
  if (!token) {
    // Token yo‘q bo‘lsa, admin/login ga yo‘naltir
    return <Navigate to="/admin/login" replace />;
  }

  if (!userRole || !['admin', 'dekan', 'kichik_admin'].includes(userRole)) {
    // Role mos kelmasa unauthorized sahifaga
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminPrivateRoute;
