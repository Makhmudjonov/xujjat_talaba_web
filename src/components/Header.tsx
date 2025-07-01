import React from 'react';

const Header = () => {
  return (
    <header style={{
      backgroundColor: '#fff',
      padding: '16px 24px',
      borderBottom: '1px solid #dee2e6',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Tanlov Dashboard</h1>
    </header>
  );
};

export default Header;
