import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('isLoggedIn');
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #43e97b 0%, #228B22 100%)',
      color: '#fff',
      borderBottom: '2px solid #228B22',
      boxShadow: '0 2px 12px rgba(34,139,34,0.10)',
      fontWeight: 600,
      letterSpacing: 1
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 24, color: '#fff' }}>SERA TAKİP</div>
      <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>Anasayfa</Link>
        <Link to="/about" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>Hakkımızda</Link>
        <Link to="/contact" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>İletişim</Link>
        <button onClick={() => navigate('/login')} style={{ background: '#228B22', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>
          {isLoggedIn ? 'Admin' : 'Giriş'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
