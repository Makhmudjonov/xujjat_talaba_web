import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';

// Define the drawerWidth here and use it consistently.
// This is the source of truth for sidebar width.
const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/account', label: 'Hisobim', icon: <HomeIcon /> },
    { path: '/hujjat', label: 'Hujjat yuborish', icon: <UploadFileIcon /> },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: drawerWidth, // Use the constant width
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box sx={{ p: theme.spacing(2), borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 600, color: theme.palette.primary.main }}
        >
          Talaba Paneli
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map(({ path, label, icon }) => (
          <Link to={path} key={path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton
              selected={location.pathname === path}
              sx={{
                py: 1.5,
                px: theme.spacing(2.5),
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  bgcolor: theme.palette.action.selected,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 'inherit' }} />
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider sx={{ bgcolor: theme.palette.divider }} />
      <List sx={{ mt: 'auto', mb: theme.spacing(1) }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: theme.spacing(2.5),
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.error.dark,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Chiqish" primaryTypographyProps={{ fontWeight: 500 }} />
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
            sx={{
              position: 'fixed',
              top: theme.spacing(2),
              left: theme.spacing(2),
              zIndex: theme.zIndex.drawer + 1,
              color: theme.palette.primary.main,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
            {drawerContent}
          </Drawer>
        </>
      ) : (
        // Desktop Sidebar - Make this Box fixed as well
        <Box
          sx={{
            width: drawerWidth, // Use the constant
            flexShrink: 0,
            height: '100vh',
            overflowY: 'auto',
            borderRight: `1px solid ${theme.palette.divider}`,
            // *** IMPORTANT CHANGE HERE ***
            position: 'fixed', // This ensures it does not take up space in the main flow
            zIndex: theme.zIndex.drawer, // Ensure it's above normal content but below mobile drawer
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
};

export default Sidebar;