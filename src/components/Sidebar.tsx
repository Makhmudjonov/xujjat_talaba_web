import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const linkStyle = (path: string) => ({
    display: 'block',
    padding: '12px 16px',
    color: location.pathname === path ? '#0d6efd' : '#ffffff',
    backgroundColor: location.pathname === path ? '#212529' : 'transparent',
    textDecoration: 'none',
    borderRadius: '4px',
    marginBottom: '4px',
  });

// har qanday komponentda (masalan Header)
const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login'; // tozalab qayta yo‘naltiradi
};



  return (
    <aside style={{
      width: '220px',
      backgroundColor: '#343a40',
      color: '#fff',
      padding: '20px 10px',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: '#fff', textAlign: 'center' }}>Dashboard</h2>
      <nav>
        <Link to="/account" style={linkStyle('/account')}>🏠 Account</Link>
        <Link to="/hujjat" style={linkStyle('/hujjat')}>📤 Hujjat yuborish</Link>
        <div
          onClick={handleLogout}
          style={{
            ...linkStyle('/logout'),
            cursor: 'pointer',
            color: '#ffc107'
          }}
        >
          🚪 Chiqish
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
