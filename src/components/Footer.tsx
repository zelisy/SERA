import React from 'react';

const Footer = () => (
  <footer style={{
    width: '100%',
    background: 'linear-gradient(135deg, #43e97b 0%, #228B22 100%)',
    color: '#fff',
    textAlign: 'center',
    padding: '1rem 0',
    fontWeight: 600,
    letterSpacing: 1,
    fontSize: 16,
    borderTop: '2px solid #228B22',
    boxShadow: '0 -2px 12px rgba(34,139,34,0.10)'
  }}>
    © {new Date().getFullYear()} SERA TAKİP. Tüm hakları saklıdır.
  </footer>
);

export default Footer;
