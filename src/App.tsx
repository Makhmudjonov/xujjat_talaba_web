import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Sizning Material-UI temangiz

import routes from './routes'; // Student route'lar
import LoginPage from './pages/LoginPage'; // Student login sahifasi
import Unauthorized from './pages/Unauthorized'; // Ruxsatsiz kirish sahifasi

import AdminLogin from './pages/admin/LoginPage'; // Admin login sahifasi
import AdminDashboard from './pages/admin/AdminDashboard'; // Barcha admin route'lar shu yerda

import PrivateRoute from './components/PrivateRoute'; // Talaba uchun shaxsiy route
import AdminPrivateRoute from './components/AdminPrivateRoute'; // Admin uchun shaxsiy route
import Layout from './layouts/Layout'; // Talaba layouti
import FloatingBanner from './components/FloatingBanner'; // Mavjud banner

// Telegram ikonkasini import qilish
import TelegramIcon from '@mui/icons-material/Telegram';
import { Box, IconButton } from '@mui/material'; // Box va IconButton komponentlarini import qilish

const App = () => {
  const userRole = localStorage.getItem('role');
  const accessToken = localStorage.getItem('accessToken');

  // Telegram havolasi. Buni o'zingizning Telegram guruhingiz/kanal havolangizga o'zgartiring.
  const telegramLink = "https://t.me/tsmuuz"; // <<<<< BU YERNI O'ZGARTIRING

  return (
    <ThemeProvider theme={theme}>
      {/* CSS ni standartlashtirish */}
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

        {/* Telegram FAB (Floating Action Button) */}
        <Box
          sx={{
            position: 'fixed', // Ekran bo'ylab qotirilgan pozitsiya
            bottom: { xs: 16, sm: 24 }, // Pastdan masofa (mobil va desktop uchun)
            right: { xs: 16, sm: 24 }, // O'ngdan masofa (mobil va desktop uchun)
            zIndex: 1000, // Boshqa elementlardan ustun bo'lishi uchun
            // FABga o'xshash stil
            bgcolor: theme.palette.primary.main, // Asosiy rangdan foydalanish
            borderRadius: '50%', // Dumaloq shakl
            boxShadow: theme.shadows[6], // Yumshoq soya
            transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out', // Animatsiya
            '&:hover': {
              bgcolor: theme.palette.primary.dark, // Hoverda to'qroq rang
              transform: 'scale(1.05)', // Hoverda sal kattalashish
              boxShadow: theme.shadows[8], // Hoverda kattaroq soya
            },
          }}
        >
          <IconButton
            color="inherit" // Fon rangini meros qilib olish
            aria-label="Telegram"
            href={telegramLink}
            target="_blank" // Yangi tabda ochish
            rel="noopener noreferrer" // Xavfsizlik uchun
            sx={{
              padding: { xs: '10px', sm: '14px' }, // Tugma ichki bo'shlig'i
              color: '#ffffff', // Oq ikonka rangi
            }}
          >
            <TelegramIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> {/* Ikonka hajmi */}
          </IconButton>
        </Box>

        {/* FloatingBanner mavjud bo'lsa, uni ham joylashtirish */}
        {/* FloatingBanner odatda FAB bilan bir joyda bo'lmaydi, lekin agar kerak bo'lsa,
            uning pozitsiyasini FAB bilan to'qnashmasligi uchun sozlash kerak bo'ladi.
            Masalan, FloatingBanner ni chap pastga joylashtirish mumkin. */}
        {/* <FloatingBanner /> */}

      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;