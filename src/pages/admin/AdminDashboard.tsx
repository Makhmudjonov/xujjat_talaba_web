// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Arizalar from './Arizalar';
import CheckAriza from './CheckAriza';
import AdminLogin from './LoginPage';
import AdminLayout from '../../layouts/AdminLayout';

const AdminDashboard = () => {
  return (
    <Routes>
      {/* Login sahifasi layoutdan mustaqil */}
      <Route path="login" element={<AdminLogin />} />

      {/* Boshqa sahifalar uchun umumiy layout */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Arizalar />} />
        <Route path="check-ariza/:id" element={<CheckAriza />} />
        <Route path="applications" element={<Arizalar />} />

        {/* boshqa admin sahifalar */}
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
