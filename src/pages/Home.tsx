import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🌱 SERA TAKİP
            </h1>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Sera ortamınızı anlık olarak takip edin, verimliliği artırın ve bitkilerinizin sağlığını koruyun.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🌡️ Sıcaklık</h3>
              <p className="text-3xl font-bold text-green-600">24°C</p>
              <p className="text-sm text-green-700 mt-1">Optimal Seviye</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">💧 Nem</h3>
              <p className="text-3xl font-bold text-blue-600">60%</p>
              <p className="text-sm text-blue-700 mt-1">İdeal Aralık</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">🌱 Toprak</h3>
              <p className="text-3xl font-bold text-purple-600">İyi</p>
              <p className="text-sm text-purple-700 mt-1">Sağlıklı Durum</p>
            </div>
          </div>
        </div>

        {/* Checklist Navigation */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            📋 Dikim Öncesi Checklist'ler
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Simple Checklist */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
                   onClick={() => navigate('/dikim-oncesi')}>
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 rounded-full p-3 mr-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold">Basit Checklist</h3>
                </div>
                <p className="text-green-100 mb-4 leading-relaxed">
                  Hızlı ve kolay kullanım için temel kontrol listesi. 5 ana madde ile dikim öncesi hazırlıkları kontrol edin.
                </p>
                <div className="flex items-center text-sm text-green-200">
                  <span className="mr-2">⚡</span>
                  <span>Hızlı ve Basit</span>
                  <span className="mx-2">•</span>
                  <span>5 Madde</span>
                  <span className="mx-2">•</span>
                  <span>Temel Kontroller</span>
                </div>
                <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span>Başla</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Detailed Checklist */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
                   onClick={() => navigate('/dikim-oncesi-detay')}>
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 rounded-full p-3 mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold">Detaylı Checklist</h3>
                </div>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Kapsamlı ve profesyonel kontrol listesi. 11 kategoride detaylı analizler ve fotoğraf yükleme özelliği.
                </p>
                <div className="flex items-center text-sm text-blue-200">
                  <span className="mr-2">🔬</span>
                  <span>Kapsamlı Analiz</span>
                  <span className="mx-2">•</span>
                  <span>11 Kategori</span>
                  <span className="mx-2">•</span>
                  <span>Fotoğraf Upload</span>
                </div>
                <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span>Başla</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                🚀 Akıllı Tarım ve Seracılıkta Dijital Dönüşüm
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                SERA TAKİP, modern tarım ve seracılık uygulamalarında verimliliği ve sürdürülebilirliği artırmak için geliştirilmiş bir platformdur. Akıllı sensörler ve otomasyon sistemleriyle kritik parametreleri anlık olarak izleyebilir, üretim süreçlerinizi optimize edebilirsiniz.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <span className="text-green-600">🌿</span>
                  </div>
                  <span className="text-gray-700">Çevre Dostu ve Yenilikçi Yaklaşım</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <span className="text-blue-600">📱</span>
                  </div>
                  <span className="text-gray-700">Gerçek Zamanlı İzleme ve Kontrol</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <span className="text-purple-600">⚡</span>
                  </div>
                  <span className="text-gray-700">Otomatik Raporlama ve Analiz</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Geleceğin Tarımı Sizinle</h3>
                <p className="text-lg opacity-90 mb-6">
                  Tarımda dijitalleşmenin öncüsü olarak, üreticilere rekabet avantajı sunuyoruz.
                </p>
                <button 
                  onClick={() => navigate('/about')}
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  Daha Fazla Bilgi
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
