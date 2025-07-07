import React from 'react';
import { AppBar, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';

// drawerWidth ni bu yerda endi ishlatish shart emas, chunki Layout uni boshqaradi.
// const drawerWidth = 240; // Bu qatorni o'chiring yoki kommentga oling

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        // *** BU YERDAGI ML VA WIDTH STYLLARINI OLIB TASHLANG ***
        // Chunki ularni Layout boshqaradi. Header shunchaki o'zining otasining enini oladi.
        // width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`, // O'CHIRILSIN
        // ml: isMobile ? 0 : `${drawerWidth}px`, // O'CHIRILSIN
        // transition ham shart emas, chunki o'zgaradigan narsa yo'q
      }}
    >
      <Toolbar
        sx={{
          justifyContent: isMobile ? 'center' : 'flex-start',
          padding: isMobile ? theme.spacing(1.5, 2) : theme.spacing(2, 3),
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="h1"
          sx={{
            flexGrow: 1,
            textAlign: isMobile ? 'center' : 'left',
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          TashMedUni.uz
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;