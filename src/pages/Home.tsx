import React from 'react';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(255,255,255,0.95)', borderRadius: 16, boxShadow: '0 4px 24px rgba(56,249,215,0.10)', padding: '2rem' }}>
        <h1 style={{ color: '#43e97b', marginBottom: 8 }}>Sera Takip Uygulamasına Hoş Geldiniz</h1>
        <p style={{ color: '#14532d', marginBottom: 24 }}>
          Sera ortamınızı anlık olarak takip edin, verimliliği artırın ve bitkilerinizin sağlığını koruyun.<br/><br/>
          <b>Akıllı Tarım ve Seracılıkta Dijital Dönüşüm</b><br/>
          SERA TAKİP, modern tarım ve seracılık uygulamalarında verimliliği ve sürdürülebilirliği artırmak için geliştirilmiş bir platformdur. Akıllı sensörler ve otomasyon sistemleriyle; sıcaklık, nem, toprak ve ışık gibi kritik parametreleri anlık olarak izleyebilir, üretim süreçlerinizi optimize edebilirsiniz.<br/><br/>
          <b>Çevre Dostu ve Yenilikçi Yaklaşım</b><br/>
          Sürdürülebilir tarım ilkeleriyle, kaynak kullanımını en aza indirirken ürün kalitesini ve miktarını artırmayı hedefliyoruz. SERA TAKİP ile, çevreye duyarlı ve modern seracılık yöntemlerini kolayca uygulayabilirsiniz.<br/><br/>
          <b>Geleceğin Tarımı Sizinle</b><br/>
          Tarımda dijitalleşmenin öncüsü olarak, üreticilere ve girişimcilere rekabet avantajı sunuyoruz. SERA TAKİP ile geleceğin akıllı seralarını birlikte inşa ediyoruz.
        </p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, background: '#e0ffe0', borderRadius: 8, padding: 16, textAlign: 'center', color: '#14532d' }}>
            <h2 style={{ color: '#43e97b', fontSize: 18 }}>Sıcaklık</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>24°C</p>
          </div>
          <div style={{ flex: 1, background: '#e0ffe0', borderRadius: 8, padding: 16, textAlign: 'center', color: '#14532d' }}>
            <h2 style={{ color: '#43e97b', fontSize: 18 }}>Nem</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>60%</p>
          </div>
          <div style={{ flex: 1, background: '#e0ffe0', borderRadius: 8, padding: 16, textAlign: 'center', color: '#14532d' }}>
            <h2 style={{ color: '#43e97b', fontSize: 18 }}>Toprak</h2>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>İyi</p>
          </div>
        </div>
        <button style={{ background: '#38f9d7', color: '#14532d', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer', fontWeight: 600 }}>
          Detaylı Raporu Görüntüle
        </button>
      </div>
    </div>
  );
};

export default Home;
