import React from 'react';

const DikimOncesiDonem = () => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ color: '#228B22', marginBottom: 20 }}>Dikim Öncesi Dönem</h2>
    <ul style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, listStyle: 'none', margin: 0 }}>
      <li>✔️ Toprak analizi yapıldı</li>
      <li>✔️ Sera temizliği tamamlandı</li>
      <li>✔️ Sulama sistemi kontrol edildi</li>
      <li>❌ Gübreleme planı hazırlanıyor</li>
      <li>❌ Fide seçimi bekleniyor</li>
    </ul>
  </div>
);

export default DikimOncesiDonem; 