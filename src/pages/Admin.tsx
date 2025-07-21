import React, { useState } from 'react';
import type { ReactElement } from 'react';
import UreticiListesi from '../components/UreticiListesi';
import UretimAlanBilgisi from '../components/UretimAlanBilgisi';
import DikimOncesiDonem from '../components/DikimOncesiDonem';
import SeraKontrol from '../components/SeraKontrol';
import HasatBilgisi from '../components/HasatBilgisi';
import Rapor from '../components/Rapor';

const sidebarItems = [
  'Üretici Listesi',
  'Üretim Alan Bilgisi',
  'Dikim Öncesi Dönem',
  'Sera Kontrol',
  'Hasat Bilgisi',
  'Rapor',
];

const sectionComponents: Record<string, ReactElement> = {
  'Üretici Listesi': <UreticiListesi />,
  'Üretim Alan Bilgisi': <UretimAlanBilgisi />,
  'Dikim Öncesi Dönem': <DikimOncesiDonem />,
  'Sera Kontrol': <SeraKontrol />,
  'Hasat Bilgisi': <HasatBilgisi />,
  'Rapor': <Rapor />,
};

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Üretici Listesi');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6faf7' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: sidebarOpen ? 220 : 60,
          background: '#228B22',
          color: '#fff',
          transition: 'width 0.2s',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 10,
          left: 0,
          top: 0,
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
          {/* Logo Placeholder */}
          <div style={{ fontWeight: 'bold', fontSize: 20, letterSpacing: 1, color: '#fff' }}>
            <span role="img" aria-label="logo" style={{ marginRight: sidebarOpen ? 8 : 0 }}>🌱</span>
            {sidebarOpen && 'SERA TAKİP'}
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: sidebarOpen ? 8 : 0, marginBottom: 16 }}
          aria-label="Menüyü Aç/Kapat"
        >
          {sidebarOpen ? '←' : '☰'}
        </button>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
          {sidebarItems.map((item, idx) => (
            <li
              key={item}
              onClick={() => setActiveSection(item)}
              style={{
                padding: sidebarOpen ? '12px 24px' : '12px 8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 16,
                borderLeft: activeSection === item ? '4px solid #fff' : 'none',
                background: activeSection === item ? 'rgba(255,255,255,0.08)' : 'none',
                fontWeight: activeSection === item ? 600 : 400,
                color: '#fff',
                transition: 'background 0.2s',
              }}
            >
              {sidebarOpen ? item : item[0]}
            </li>
          ))}
        </ul>
      </nav>
      {/* Main Content */}
      <div style={{ marginLeft: sidebarOpen ? 220 : 60, flex: 1, transition: 'margin-left 0.2s', width: '100%' }}>
        {/* Top Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 500, color: '#228B22' }}>Admin</span>
            <button style={{ background: '#228B22', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>Çıkış</button>
          </div>
        </header>
        {/* Section Content */}
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          {sectionComponents[activeSection]}
        </main>
      </div>
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          nav {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 100;
          }
          main {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin; 