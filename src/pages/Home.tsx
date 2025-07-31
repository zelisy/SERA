import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import arkaplanImage from '../assets/arkaplan1.jpg';
import { getAllProducts } from '../utils/firestoreUtils';
import type { Product } from '../types/product';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = () => {
    return !!localStorage.getItem('isLoggedIn');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Ürünler yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleFeatureClick = (route: string) => {
    if (isAuthenticated()) {
      navigate(route);
    } else {
      alert('Bu özelliği kullanmak için giriş yapmanız gerekmektedir.');
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Full Screen Background - Image + Overlay */}
      <div className="absolute inset-0">
        <img 
          src={arkaplanImage} 
          alt="AGROVİA Sistemi Arkaplan"
          className="w-full h-full object-cover"
          style={{ minHeight: '100vh' }}
          onLoad={() => console.log('Arkaplan resmi başarıyla yüklendi')}
          onError={(e) => {
            console.log('Arkaplan resmi yüklenemedi:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Dark Overlay with Green Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-emerald-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AGROVİA
            </h1>
            <p className="text-xl md:text-3xl mb-8 text-emerald-400 font-light leading-relaxed">
              Sera Takip Sistemi
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Sera üretiminizi dijital dünyaya taşıyın.
            AGROVİA, dikim öncesinden hasada kadar tüm üretim sürecinizi adım adım takip etmenizi sağlayan yenilikçi bir kontrol platformudur.
            <br />
          
            📊 İklim verileri, 🌱 bitki gelişimi, 💧 sulama planlaması ve 🐛 zararlı gözlemleri artık tek yerde, parmaklarınızın ucunda.
          
            <br />
            Tarımı kolaylaştırmak, verimi artırmak, her adımı kayıt altına almak için buradayız.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {!isAuthenticated() ? (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-lg border-2 border-emerald-500 hover:border-emerald-400"
                  >
                    Sisteme Giriş Yap
                  </button>
                  <button 
                    onClick={() => navigate('/about')}
                    className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black font-semibold py-4 px-12 rounded-full transition-all duration-300 text-lg"
                  >
                    Daha Fazla Bilgi
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-lg border-2 border-emerald-500 hover:border-emerald-400"
                  >
                    Admin Panel
                  </button>
                  <button 
                    onClick={() => handleFeatureClick('/dikim-oncesi')}
                    className="border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black font-semibold py-4 px-12 rounded-full transition-all duration-300 text-lg"
                  >
                    Hızlı Başlangıç
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-900 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Sistem <span className="text-emerald-400">Özellikleri</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Modern sera yönetimi için ihtiyacınız olan tüm araçlar tek platformda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Producer Management */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Üretici Yönetimi</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Üretici bilgilerini kaydedin, düzenleyin ve her üretici için ayrı takip yapın.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>

              {/* Pre-Planting Checklist */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Dikim Öncesi Kontrol</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  11 kategoride detaylı kontrol listesi. Solarizasyon, toprak analizi, dezenfeksiyon ve daha fazlası.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>

              {/* Photo Documentation */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">📸</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Fotoğraf Dokümantasyonu</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Cloudinary entegrasyonu ile fotoğraf yükleme ve kontrol süreçlerini görsel olarak belgeleme.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">💾</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Veri Yönetimi</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Firebase entegrasyonu ile güvenli veri saklama ve gerçek zamanlı senkronizasyon.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>

              {/* Reports & Analytics */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Raporlama</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Detaylı raporlar, istatistikler ve kontrol süreçlerinin analizi.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>

              {/* Mobile Responsive */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700 hover:border-emerald-500/50">
                <div className="bg-emerald-500/20 rounded-xl p-4 mb-6 w-fit border border-emerald-500/30">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mobil Uyumlu</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Tablet ve telefon üzerinden saha çalışması yapmak için optimize edilmiş arayüz.
                </p>
                <div className="flex items-center text-sm text-emerald-400 font-semibold">
                  <span className="mr-2">🔐</span>
                  <span>Sadece Yetkili Kullanıcılar İçin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                <span className="text-emerald-400">Ürünlerimiz</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Kaliteli sera ürünleri ve ekipmanları
              </p>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                <p className="text-gray-300 mt-4">Ürünler yükleniyor...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-300 text-lg">Henüz ürün eklenmedi.</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Ürünler Sayfasına Git
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 md:space-x-6 pb-4" style={{ minWidth: 'max-content' }}>
                                     {products.map(product => (
                                          <div key={product.id} className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-600 p-3 md:p-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex-shrink-0" style={{ width: '220px', minWidth: '220px' }}>
                       {product.imageUrl && (
                         <div className="mb-2 md:mb-3">
                           <img 
                             src={product.imageUrl} 
                             alt={product.name} 
                             className="w-full h-28 md:h-36 object-cover rounded-xl shadow-lg"
                           />
                         </div>
                       )}
                                             <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">{product.name}</h3>
                       <p className="text-gray-300 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed line-clamp-2">{product.description}</p>
                                              <div className="flex items-center justify-between">
                          <div className="text-emerald-400 font-bold text-lg md:text-xl">₺{product.price}</div>
                          <div className="text-xs text-gray-400">{new Date(product.createdAt).toLocaleDateString('tr-TR')}</div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                         <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/products')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-lg border-2 border-emerald-500 hover:border-emerald-400"
              >
                Tüm Ürünleri Gör
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated() && (
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Hemen Başlayın
              </h2>
              <p className="text-xl text-emerald-900 mb-8 leading-relaxed">
                Sera üretim süreçlerinizi dijitalleştirin ve verimliliğinizi artırın
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-black text-emerald-400 font-bold py-4 px-12 rounded-full hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg border-2 border-black hover:border-gray-900"
              >
                Ücretsiz Başlayın
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
