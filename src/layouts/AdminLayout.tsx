// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px' }}>
          <Outlet /> {/* Bu yerda ichki sahifalar chiqadi */}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
