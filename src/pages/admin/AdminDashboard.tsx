// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Arizalar from './Arizalar';
import CheckAriza from './CheckAriza';
import AdminLogin from './LoginPage';
import AdminLayout from '../../layouts/AdminLayout';
import CheckedArizalar from './checkedAriza';

const AdminDashboard = () => {
  return (
    <Routes>
  <Route path="login" element={<AdminLogin />} />
  <Route element={<AdminLayout />}>
    <Route path="/" element={<Arizalar />} />
    <Route path="applications" element={<Arizalar />} />
    <Route path="check-ariza/:id" element={<CheckAriza />} />
    <Route path="checked-applications" element={<CheckedArizalar />} />

  </Route>
</Routes>
  );
};

export default AdminDashboard;
