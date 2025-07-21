import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#228B22', color: '#fff' }}>
      <div style={{ fontWeight: 'bold', fontSize: 24 }}>SERA TAKİP</div>
      <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>Anasayfa</Link>
        <Link to="/about" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>Hakkımızda</Link>
        <Link to="/contact" style={{ color: '#fff', textDecoration: 'none', fontSize: 16 }}>İletişim</Link>
        <button onClick={() => navigate('/login')} style={{ background: '#fff', color: '#228B22', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: 16 }}>
          Giriş
        </button>
      </nav>
    </header>
  );
};

export default Header;
