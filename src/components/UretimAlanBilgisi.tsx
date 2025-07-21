import React from 'react';

const UretimAlanBilgisi = () => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ color: '#228B22', marginBottom: 20 }}>Üretim Alan Bilgisi</h2>
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 220, flex: 1 }}>
        <h3 style={{ color: '#228B22' }}>Sera 1</h3>
        <p>Alan: 500 m²</p>
        <p>Bitki Türü: Domates</p>
        <p>Durum: Aktif</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 220, flex: 1 }}>
        <h3 style={{ color: '#228B22' }}>Sera 2</h3>
        <p>Alan: 300 m²</p>
        <p>Bitki Türü: Salatalık</p>
        <p>Durum: Pasif</p>
      </div>
    </div>
  </div>
);

export default UretimAlanBilgisi; 