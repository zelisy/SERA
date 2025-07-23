import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return !!localStorage.getItem('isLoggedIn');
  };

  const handleFeatureClick = (route: string) => {
    if (isAuthenticated()) {
      navigate(route);
    } else {
      alert('Bu özelliği kullanmak için giriş yapmanız gerekmektedir.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-50">
      <div className="max-w-6xl mx-auto p-4 space-y-12">
        
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-slate-700 bg-clip-text text-transparent mb-6">
              🌱 SERA TAKİP SİSTEMİ
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Profesyonel sera yönetimi ve dikim öncesi kontrol sistemi
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Sera üreticileri için geliştirilmiş kapsamlı takip ve kontrol sistemi. 
              Dikim öncesi dönem kontrollerinden hasat sürecine kadar tüm üretim aşamalarınızı dijital ortamda yönetin.
            </p>
            
            {!isAuthenticated() && (
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-6 text-white mb-8">
                <h3 className="text-xl font-bold mb-2">🔐 Sistemi Kullanmak İçin Giriş Yapın</h3>
                <p className="text-emerald-100 mb-4">
                  Tüm özellikler sadece kayıtlı kullanıcılar için mevcuttur
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Giriş Yap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Producer Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Üretici Yönetimi</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Üretici bilgilerini kaydedin, düzenleyin ve her üretici için ayrı takip yapın.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>

          {/* Pre-Planting Checklist */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">📋</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Dikim Öncesi Kontrol</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              11 kategoride detaylı kontrol listesi. Solarizasyon, toprak analizi, dezenfeksiyon ve daha fazlası.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>

          {/* Photo Documentation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">📸</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Fotoğraf Dokümantasyonu</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Cloudinary entegrasyonu ile fotoğraf yükleme ve kontrol süreçlerini görsel olarak belgeleme.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">💾</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Veri Yönetimi</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Firebase entegrasyonu ile güvenli veri saklama ve gerçek zamanlı senkronizasyon.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Raporlama</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Detaylı raporlar, istatistikler ve kontrol süreçlerinin analizi.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>

          {/* Mobile Responsive */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl p-4 mb-4 w-fit">
              <span className="text-2xl text-white">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Mobil Uyumlu</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Tablet ve telefon üzerinden saha çalışması yapmak için optimize edilmiş arayüz.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">🔐</span>
              <span>Giriş Gerekli</span>
            </div>
          </div>
        </div>

        {/* Action Cards for Login Users */}
        {isAuthenticated() ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              📋 Hoş Geldiniz! İşlemlerinize Başlayın
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Admin Panel */}
              <div className="group cursor-pointer" onClick={() => navigate('/admin')}>
                <div className="bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h3 className="text-xl font-bold">Admin Panel</h3>
                  </div>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    Üretici yönetimi, raporlar, kontrol listeleri ve sistem ayarları.
                  </p>
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">🛠️</span>
                    <span>Yönetim</span>
                    <span className="mx-2">•</span>
                    <span>Kontrol</span>
                    <span className="mx-2">•</span>
                    <span>Raporlar</span>
                  </div>
                </div>
              </div>

              {/* Quick Start Checklist */}
              <div className="group cursor-pointer" onClick={() => handleFeatureClick('/dikim-oncesi')}>
                <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold">Hızlı Başlangıç</h3>
                  </div>
                  <p className="text-emerald-100 mb-4 leading-relaxed">
                    Dikim öncesi kontrol işlemlerini başlatın. Üretici seçin ve kontrollere başlayın.
                  </p>
                  <div className="flex items-center text-sm text-emerald-200">
                    <span className="mr-2">⚡</span>
                    <span>Hızlı</span>
                    <span className="mx-2">•</span>
                    <span>Kolay</span>
                    <span className="mx-2">•</span>
                    <span>Etkili</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* For Non-Logged Users */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              🔐 Sistemin Tüm Özelliklerini Kullanın
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Demo Features (Locked) */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-6 text-white opacity-60">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-bold">Dikim Öncesi Kontrol</h3>
                  </div>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    Üretici seçimi, 11 kategoride detaylı kontrol, fotoğraf yükleme ve raporlama.
                  </p>
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">🔒</span>
                    <span>Kilitli Özellik</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gray-900/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="text-4xl mb-2 block">🔒</span>
                    <p className="font-semibold">Giriş Gerekli</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-6 text-white opacity-60">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h3 className="text-xl font-bold">Admin Panel</h3>
                  </div>
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    Üretici yönetimi, raporlar, kontrol listeleri ve detaylı analizler.
                  </p>
                  <div className="flex items-center text-sm text-gray-300">
                    <span className="mr-2">🔒</span>
                    <span>Kilitli Özellik</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gray-900/20 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="text-4xl mb-2 block">🔒</span>
                    <p className="font-semibold">Giriş Gerekli</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 Hemen Giriş Yapın
              </button>
            </div>
          </div>
        )}

        {/* About System */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                🏗️ Modern Seracılık İçin Dijital Çözüm
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                SERA TAKİP, sera üreticilerinin dikim öncesi dönem kontrollerini sistematik olarak 
                yapabilmeleri için geliştirilmiş profesyonel bir platformdur. Firebase ve Cloudinary 
                entegrasyonu ile güvenli ve ölçeklenebilir bir altyapı sunar.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-emerald-100 rounded-full p-2 mr-4">
                    <span className="text-emerald-600">🌿</span>
                  </div>
                  <span className="text-gray-700">Çevre Dostu Dijital Dokümantasyon</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <span className="text-blue-600">📋</span>
                  </div>
                  <span className="text-gray-700">Sistematik Kontrol Listeleri</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <span className="text-purple-600">📊</span>
                  </div>
                  <span className="text-gray-700">Detaylı Raporlama ve Analiz</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-full p-2 mr-4">
                    <span className="text-orange-600">🔄</span>
                  </div>
                  <span className="text-gray-700">Gerçek Zamanlı Veri Senkronizasyonu</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Teknoloji Altyapısı</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <span className="mr-3">⚡</span>
                    <span>React + TypeScript</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">🔥</span>
                    <span>Firebase Firestore</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">☁️</span>
                    <span>Cloudinary Integration</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">🎨</span>
                    <span>Tailwind CSS</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">📱</span>
                    <span>Responsive Design</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/about')}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 backdrop-blur-sm mt-6"
                >
                  Detaylı Bilgi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
