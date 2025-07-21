import React from 'react';

const Contact = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '2rem' }}>
    <h1 style={{ color: '#228B22' }}>İletişim</h1>
    <p style={{ color: '#444', fontSize: 18 }}>
      SERA TAKİP ekibi olarak, her türlü soru, öneri ve iş birliği talepleriniz için sizlere destek olmaktan memnuniyet duyarız.<br/><br/>
      <b>E-posta:</b> <a href="mailto:info@seratakip.com" style={{ color: '#228B22', textDecoration: 'underline' }}>info@seratakip.com</a><br/>
      <b>Telefon:</b> <a href="tel:+902122223344" style={{ color: '#228B22', textDecoration: 'underline' }}>+90 212 222 33 44</a><br/>
      <b>Adres:</b> İstanbul Teknokent, Ar-Ge 2 Binası, No: 101, İstanbul, Türkiye<br/><br/>
      Müşteri temsilcilerimiz hafta içi 09:00-18:00 saatleri arasında hizmetinizdedir. Size en kısa sürede dönüş yapabilmemiz için lütfen iletişim bilgilerinizi eksiksiz iletiniz.
    </p>
  </div>
);

export default Contact; 