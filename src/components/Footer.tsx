import React from 'react';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '1rem 0', background: '#228B22', color: '#fff', marginTop: 'auto' }}>
      © {new Date().getFullYear()} SERA TAKİP | Tüm hakları saklıdır.
    </footer>
  );
};

export default Footer;
