import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import routes from './routes'; // Student routes
import LoginPage from './pages/LoginPage'; // Student login
import Unauthorized from './pages/Unauthorized';

import AdminLogin from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard'; // Barcha admin route'lar shu yerda

import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Layout from './layouts/Layout'; // Student Layout

const App = () => {
  const userRole = localStorage.getItem('role');
  const accessToken = localStorage.getItem('accessToken');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* === 🧑‍🎓 STUDENT QISMI === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student PrivateRoute ichida Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Student sahifalarini map qilib joylaymiz */}
            {routes.map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
          </Route>

          {/* === 🛡️ ADMIN QISMI === */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminPrivateRoute token={accessToken} userRole={userRole}>
                <AdminDashboard />
              </AdminPrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
