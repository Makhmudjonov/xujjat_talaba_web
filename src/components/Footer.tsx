import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#fff',
      padding: '16px 24px',
      borderTop: '1px solid #dee2e6',
      textAlign: 'center',
    }}>
      <small>&copy; {new Date().getFullYear()} Tanlov Dashboard. Barcha huquqlar himoyalangan.</small>
    </footer>
  );
};

export default Footer;
