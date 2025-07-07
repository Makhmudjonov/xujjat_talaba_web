import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // useNavigate qo'shildi
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme, // Themega kirish uchun
} from '@mui/material';

// Material-UI Icons (o'rnatishingiz kerak bo'ladi: npm install @mui/icons-material)
import DashboardIcon from '@mui/icons-material/Dashboard'; // Dashboard yoki Asosiy sahifa
import AssignmentIcon from '@mui/icons-material/Assignment'; // Arizalar
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Tekshirilgan arizalar
import CategoryIcon from '@mui/icons-material/Category'; // Bo'limlar
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Yo'nalishlar
import SchoolIcon from '@mui/icons-material/School'; // Talabalar
import SettingsIcon from '@mui/icons-material/Settings'; // Sozlamalar
import LogoutIcon from '@mui/icons-material/Logout'; // Chiqish

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate hookini ishlatamiz
  const theme = useTheme(); // Theme ob'ektiga kirish

  // Har bir link uchun menyu elementlari ro'yxati
  const navItems = [
    { text: 'Yangi arizalar', path: '/admin/applications', icon: <AssignmentIcon /> },
    { text: 'Tekshirilgan arizalar', path: '/admin/checked-applications', icon: <CheckCircleOutlineIcon /> },
    // Quyidagi izohlangan qismlar, agar ular kerak bo'lsa, sharhdan chiqarib foydalanishingiz mumkin
    // { text: 'Bo‘limlar', path: '/admin/sections', icon: <CategoryIcon /> },
    // { text: 'Yo‘nalishlar', path: '/admin/directions', icon: <TrendingUpIcon /> },
    // { text: 'Talabalar', path: '/admin/students', icon: <SchoolIcon /> },
    // { text: 'Sozlamalar', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    // navigate('/admin/login') dan so'ng to'liq refresh qilish uchun
    navigate('/admin/login');
    window.location.reload(); // Saytni to'liq yangilash
  };

  return (
    <Box
      sx={{
        width: '240px',
        bgcolor: theme.palette.grey[900], // To'q kulrang fon
        color: theme.palette.common.white, // Oq matn rangi
        padding: theme.spacing(2, 1), // Yuqori/pastga 2, chap/o'ngga 1 spacing
        minHeight: '100vh',
        boxShadow: theme.shadows[3], // Engil soya
        display: 'flex',
        flexDirection: 'column', // Elementlarni vertikal joylashtirish
      }}
    >
      <Typography
        variant="h5" // Kattaroq sarlavha
        component="div"
        sx={{
          textAlign: 'center',
          mb: theme.spacing(3), // Pastdan bo'sh joy
          mt: theme.spacing(1), // Yuqoridan bo'sh joy
          fontWeight: 700, // Qalinroq shrift
          color: theme.palette.primary.light, // Asosiy rangning ochroq tusidan foydalanish
        }}
      >
        Admin Panel
      </Typography>

      <Divider sx={{ mb: theme.spacing(2), bgcolor: theme.palette.grey[700] }} /> {/* Ajratuvchi */}

      <List component="nav">
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path} // Tanlangan holat
            sx={{
              borderRadius: theme.shape.borderRadius, // Kichikroq yumaloq burchaklar
              mb: theme.spacing(0.5), // Elementlar orasida kichik bo'sh joy
              '&.Mui-selected': {
                bgcolor: theme.palette.primary.dark, // Tanlangan element uchun to'qroq fon
                color: theme.palette.common.white, // Oq rang
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.light, // Ikonka rangini yorqinroq qilish
                },
                '&:hover': {
                  bgcolor: theme.palette.primary.dark, // Hoverda ham tanlangan rangni saqlash
                },
              },
              '&:hover': {
                bgcolor: theme.palette.grey[700], // Oddiy hover effekti
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon> {/* Ikonka */}
            <ListItemText primary={item.text} /> {/* Matn */}
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} /> {/* Bo'sh joyni to'ldiruvchi */}

      <Divider sx={{ mt: theme.spacing(2), mb: theme.spacing(1), bgcolor: theme.palette.grey[700] }} /> {/* Ajratuvchi */}

      <ListItemButton
        onClick={handleLogout}
        sx={{
          borderRadius: theme.shape.borderRadius,
          mt: theme.spacing(2), // Yuqoridan ko'proq bo'sh joy
          color: theme.palette.warning.light, // Sariqroq rang
          '&:hover': {
            bgcolor: theme.palette.grey[700], // Hover effekti
            color: theme.palette.warning.main, // Hoverda to'qroq sariq
          },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Chiqish" />
      </ListItemButton>
    </Box>
  );
};

export default AdminSidebar;