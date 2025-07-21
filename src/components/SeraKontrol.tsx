import React from 'react';

const SeraKontrol = () => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ color: '#228B22', marginBottom: 20 }}>Sera Kontrol</h2>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ background: '#e6ffe6', borderRadius: 12, padding: 24, minWidth: 180, flex: 1, textAlign: 'center' }}>
        <h3 style={{ color: '#228B22' }}>Sıcaklık</h3>
        <p style={{ fontSize: 24, fontWeight: 'bold' }}>24.9°C</p>
      </div>
      <div style={{ background: '#e6ffe6', borderRadius: 12, padding: 24, minWidth: 180, flex: 1, textAlign: 'center' }}>
        <h3 style={{ color: '#228B22' }}>Nem</h3>
        <p style={{ fontSize: 24, fontWeight: 'bold' }}>60%</p>
      </div>
      <div style={{ background: '#e6ffe6', borderRadius: 12, padding: 24, minWidth: 180, flex: 1, textAlign: 'center' }}>
        <h3 style={{ color: '#228B22' }}>Toprak</h3>
        <p style={{ fontSize: 24, fontWeight: 'bold' }}>İyi</p>
      </div>
    </div>
  </div>
);

export default SeraKontrol; 