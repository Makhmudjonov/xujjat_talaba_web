import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/account', label: '🏠 Account' },
    { path: '/hujjat', label: '📤 Hujjat yuborish' },
  ];

  const drawerContent = (
    <Box sx={{ width: 220, bgcolor: '#343a40', color: '#fff', height: '100%' }}>
      <Typography variant="h6" align="center" sx={{ p: 2 }}>
        Dashboard
      </Typography>
      <Divider sx={{ bgcolor: '#555' }} />
      <List>
        {menuItems.map(({ path, label }) => (
          <Link to={path} key={path} style={{ textDecoration: 'none' }}>
            <ListItemButton
              selected={location.pathname === path}
              sx={{
                color: location.pathname === path ? '#0d6efd' : '#ffffff',
                '&.Mui-selected': {
                  bgcolor: '#212529',
                  color: '#0d6efd',
                },
              }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          </Link>
        ))}
        <ListItemButton onClick={handleLogout} sx={{ color: '#ffc107' }}>
          <ListItemText primary="🚪 Chiqish" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1201, color: '#343a40' }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Box sx={{ position: 'fixed', height: '100vh' }}>{drawerContent}</Box>
      )}
    </>
  );
};

export default Sidebar;
