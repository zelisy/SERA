import React from 'react';

const Contact = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '2rem' }}>
    <h1 style={{ color: '#228B22' }}>İletişim</h1>
    <p style={{ color: '#444', fontSize: 18 }}>
      Bize ulaşmak için <a href="mailto:info@seratakip.com" style={{ color: '#228B22', textDecoration: 'underline' }}>info@seratakip.com</a> adresine e-posta gönderebilirsiniz.
    </p>
  </div>
);

export default Contact; 