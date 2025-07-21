import React from 'react';

const Contact = () => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '2rem' }}>
    <div style={{ maxWidth: 700, margin: '2rem auto', background: 'rgba(255,255,255,0.95)', borderRadius: 12, boxShadow: '0 2px 12px rgba(56,249,215,0.10)', padding: '2rem' }}>
      <h1 style={{ color: '#43e97b' }}>İletişim</h1>
      <p style={{ color: '#14532d', fontSize: 18 }}>
        SERA TAKİP ekibi olarak, her türlü soru, öneri ve iş birliği talepleriniz için sizlere destek olmaktan memnuniyet duyarız.<br/><br/>
        <b>E-posta:</b> <a href="mailto:info@seratakip.com" style={{ color: '#38f9d7', textDecoration: 'underline' }}>info@seratakip.com</a><br/>
        <b>Telefon:</b> <a href="tel:+902122223344" style={{ color: '#38f9d7', textDecoration: 'underline' }}>+90 212 222 33 44</a><br/>
        <b>Adres:</b> İstanbul Teknokent, Ar-Ge 2 Binası, No: 101, İstanbul, Türkiye<br/><br/>
        Müşteri temsilcilerimiz hafta içi 09:00-18:00 saatleri arasında hizmetinizdedir. Size en kısa sürede dönüş yapabilmemiz için lütfen iletişim bilgilerinizi eksiksiz iletiniz.
      </p>
    </div>
  </div>
);

export default Contact; 