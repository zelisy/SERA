import React from 'react';

const HasatBilgisi = () => (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ color: '#228B22', marginBottom: 20 }}>Hasat Bilgisi</h2>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <thead>
          <tr style={{ background: '#e6ffe6' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Ürün</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Miktar (kg)</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Tarih</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: 12 }}>Domates</td>
            <td style={{ padding: 12 }}>1200</td>
            <td style={{ padding: 12 }}>05.06.2024</td>
          </tr>
          <tr>
            <td style={{ padding: 12 }}>Salatalık</td>
            <td style={{ padding: 12 }}>800</td>
            <td style={{ padding: 12 }}>03.06.2024</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default HasatBilgisi; 