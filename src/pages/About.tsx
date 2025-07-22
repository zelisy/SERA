import React from 'react';

const About = () => {
  const features = [
    {
      icon: '🌱',
      title: 'Akıllı Tarım',
      description: 'Modern sensörler ve veri analitiği ile tarımınızı optimize edin'
    },
    {
      icon: '📊',
      title: 'Gerçek Zamanlı İzleme',
      description: 'Sera koşullarını 7/24 takip edin ve anında müdahale edin'
    },
    {
      icon: '🔄',
      title: 'Otomasyon',
      description: 'Sulama, iklim kontrolü ve gübreleme işlemlerini otomatikleştirin'
    },
    {
      icon: '🌍',
      title: 'Sürdürülebilir',
      description: 'Çevre dostu üretim yöntemleri ile kaynak kullanımını optimize edin'
    }
  ];

  const stats = [
    { number: '500+', label: 'Aktif Sera' },
    { number: '%98', label: 'Müşteri Memnuniyeti' },
    { number: '%35', label: 'Verimlilik Artışı' },
    { number: '24/7', label: 'Teknik Destek' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
              Hakkımızda
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              SERA TAKİP, modern tarım ve seracılık alanında yenilikçi çözümler sunan 
              bir platformdur. Dijital dönüşümle geleceğin tarımını bugün gerçekleştiriyoruz.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Misyonumuz</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Üreticilere, tarım profesyonellerine ve girişimcilere dijitalleşme yolunda 
                  rehberlik ederek, bitki sağlığını ve ürün kalitesini en üst düzeye çıkarmaktır.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Sektördeki en güncel teknolojileri takip ederek, çevre dostu ve sürdürülebilir 
                  üretim modellerini destekliyoruz.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Vizyonumuz</h3>
                  <p className="leading-relaxed">
                    Tarımda dijital dönüşümün öncüsü olarak, geleceğin akıllı seralarını 
                    birlikte inşa etmek ve sürdürülebilir tarım ekosistemi oluşturmak.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
              Neden SERA TAKİP?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
              Rakamlarla SERA TAKİP
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Teknolojilerimiz</h2>
              <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                En son teknolojileri kullanarak seralarınız için kapsamlı çözümler sunuyoruz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🌡️</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">İklim Kontrolü</h3>
                <p className="text-slate-600 text-sm">Sıcaklık, nem ve havalandırma otomasyonu</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">💧</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Sulama Yönetimi</h3>
                <p className="text-slate-600 text-sm">Akıllı sulama sistemleri ve su tasarrufu</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Mobil Uygulama</h3>
                <p className="text-slate-600 text-sm">Her yerden kontrol ve izleme imkanı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 