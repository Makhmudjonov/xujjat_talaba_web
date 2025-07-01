// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import routes from './routes';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import AdminLogin from './pages/admin/LoginPage';

// RoleBasedRoute komponenti
const RoleBasedRoute = ({ userRole, allowedRoles, children }: {
  userRole: string | null;
  allowedRoles: string[];
  children: React.ReactElement;
}) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const App = () => {
  // userRole ni localStorage yoki kontekstdan oling
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Login sahifasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* Unauthorized sahifa */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin login uchun alohida route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin sahifalari, faqat ma'lum rollar uchun */}
        <Route 
          path="/admin/*" 
          element={
            <AdminPrivateRoute 
              token={localStorage.getItem('accessToken')} 
              userRole={localStorage.getItem('role')}
            >
              <AdminDashboard />
            </AdminPrivateRoute>
          } 
        />

        {/* Boshqa barcha sahifalar, token bilan himoyalangan */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Header />
                  <main style={{ flex: 1, padding: '20px' }}>
                    <Routes>
                      {routes.map((route, idx) => (
                        <Route key={idx} path={route.path} element={route.element} />
                      ))}
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
