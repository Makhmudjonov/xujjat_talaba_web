import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes';
import LoginPage from './pages/LoginPage';
import Unauthorized from './pages/Unauthorized';
import AdminLogin from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Layout from './layouts/Layout'; // 🆕 Yangi layout

const App = () => {
  const userRole = localStorage.getItem('role');
  const accessToken = localStorage.getItem('accessToken');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/*"
          element={
            <AdminPrivateRoute token={accessToken} userRole={userRole}>
              <AdminDashboard />
            </AdminPrivateRoute>
          }
        />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  {routes.map((route, idx) => (
                    <Route key={idx} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
