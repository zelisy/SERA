import React from 'react';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0ffe0 0%, #b3ffd8 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2rem' }}>
        <h1 style={{ color: '#228B22', marginBottom: 8 }}>Sera Takip Uygulamasına Hoş Geldiniz</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>
          Sera ortamınızı anlık olarak takip edin, verimliliği artırın ve bitkilerinizin sağlığını koruyun.
        </p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, background: '#e6ffe6', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <h2 style={{ color: '#228B22', fontSize: 18 }}>Sıcaklık</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>24°C</p>
          </div>
          <div style={{ flex: 1, background: '#e6ffe6', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <h2 style={{ color: '#228B22', fontSize: 18 }}>Nem</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>60%</p>
          </div>
          <div style={{ flex: 1, background: '#e6ffe6', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <h2 style={{ color: '#228B22', fontSize: 18 }}>Toprak</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>İyi</p>
          </div>
        </div>
        <button style={{ background: '#228B22', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}>
          Detaylı Raporu Görüntüle
        </button>
      </div>
    </div>
  );
};

export default Home;
