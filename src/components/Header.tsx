import React from 'react';
import { useMediaQuery } from '@mui/material';

const Header = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <header
      style={{
        backgroundColor: '#fff',
        padding: isMobile ? '12px 16px' : '16px 24px',
        borderBottom: '1px solid #dee2e6',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        TashMedUni.uz
      </h1>
    </header>
  );
};

export default Header;
