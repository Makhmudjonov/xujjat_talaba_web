import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Box, useMediaQuery, useTheme, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar />

      {/* Asosiy kontent */}
      <Box
        component="div"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isMobile ? 0 : `${drawerWidth}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Header />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: theme.spacing(3),
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
