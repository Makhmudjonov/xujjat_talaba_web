// src/layouts/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminSidebar from '../components/admin/AdminSidebar';

const Layout = () => {
  const role = localStorage.getItem('role');

  return (
    <div style={{ display: 'flex' }}>
      {role === 'admin' || role === 'dekan' || role === 'kichik_admin'
        ? <AdminSidebar />
        : <Sidebar />
      }

      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
