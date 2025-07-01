import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const linkStyle = (path: string) => ({
    display: 'block',
    padding: '12px 16px',
    color: location.pathname === path ? '#0d6efd' : '#ffffff',
    backgroundColor: location.pathname === path ? '#212529' : 'transparent',
    textDecoration: 'none',
    borderRadius: '4px',
    marginBottom: '4px',
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#343a40',
      color: '#fff',
      padding: '20px 10px',
      minHeight: '100vh'
    }}>
      <h2 style={{ textAlign: 'center' }}>Admin</h2>
      <nav>
        {/* <Link to="/admin-panel" style={linkStyle('/admin-panel')}>🏠 Asosiy</Link> */}
        <Link to="/admin/applications" style={linkStyle('/admin/applications')}>📋 Arizalar</Link>
        {/* <Link to="/admin/sections" style={linkStyle('/admin/sections')}>🗂 Bo‘limlar</Link>
        <Link to="/admin/directions" style={linkStyle('/admin/directions')}>📌 Yo‘nalishlar</Link>
        <Link to="/admin/students" style={linkStyle('/admin/students')}>🎓 Talabalar</Link>
        <Link to="/admin/settings" style={linkStyle('/admin/settings')}>⚙️ Sozlamalar</Link> */}
        <div
          onClick={handleLogout}
          style={{
            ...linkStyle('/logout'),
            cursor: 'pointer',
            color: '#ffc107',
            marginTop: '20px'
          }}
        >
          🚪 Chiqish
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
