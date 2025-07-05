import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useMediaQuery } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const sidebarWidth = 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        }}
      >
        <Header />
        <main style={{ flex: 1, padding: '20px' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
