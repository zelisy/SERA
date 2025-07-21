import React from 'react';

const UreticiListesi = () => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ color: '#228B22', marginBottom: 20 }}>Üretici Listesi</h2>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <thead>
          <tr style={{ background: '#e6ffe6' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Adı Soyadı</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Telefon</th>
            <th style={{ padding: 12, textAlign: 'left' }}>E-posta</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Kayıt Tarihi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: 12 }}>Ahmet Yılmaz</td>
            <td style={{ padding: 12 }}>0555 123 45 67</td>
            <td style={{ padding: 12 }}>ahmet@example.com</td>
            <td style={{ padding: 12 }}>01.06.2024</td>
          </tr>
          <tr>
            <td style={{ padding: 12 }}>Zeynep Kaya</td>
            <td style={{ padding: 12 }}>0544 987 65 43</td>
            <td style={{ padding: 12 }}>zeynep@example.com</td>
            <td style={{ padding: 12 }}>15.05.2024</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default UreticiListesi; 