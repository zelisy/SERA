import React, { useState } from 'react';
import type { ReactElement } from 'react';
import UreticiListesi from '../components/UreticiListesi';
import UretimAlanBilgisi from '../components/UretimAlanBilgisi';
import DikimOncesiDonem from '../components/DikimOncesiDonem';
import SeraKontrol from '../components/SeraKontrol';
import HasatBilgisi from '../components/HasatBilgisi';
import Rapor from '../components/Rapor';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { getAllProducers } from '../utils/firestoreUtils';
import type { Producer } from '../types/producer';

// DenemeComponent tanımı:
const DenemeComponent: React.FC = () => {
  const [producers, setProducers] = React.useState<Producer[]>([]);
  const [selected, setSelected] = React.useState<Producer | null>(null);
  const [form, setForm] = React.useState({
    genelCalismak: '',
    genelAmac: '',
    ulke: '',
    konum: '',
    turler: '',
    cesitlilik: '',
    tedaviler: '',
    tekrarlar: '',
    tedaviBitkiSayisi: '',
    mahsulDurumu: '',
    goruntuler: [] as string[], // image urls
  });
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    getAllProducers().then(setProducers).catch(() => setProducers([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
      setForm({ ...form, goruntuler: Array.from(e.target.files).map(f => URL.createObjectURL(f)) });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Kaydedildi (örnek, Firestore entegrasyonu eklenebilir)');
    // Firestore'a kaydetmek için burada bir fonksiyon çağrılabilir
  };

  if (!selected) {
    return (
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mt-8">
        <h2 className="text-xl font-bold mb-4">Üretici Seç</h2>
        <ul className="space-y-2">
          {producers.map((p) => (
            <li key={p.id} className="flex items-center justify-between bg-slate-50 rounded p-3 border">
              <span>{p.firstName} {p.lastName}</span>
              <button className="bg-emerald-500 text-white px-4 py-1 rounded" onClick={() => setSelected(p)}>Seç</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mt-8">
      <form className="space-y-8" onSubmit={handleSave}>
        <button type="button" className="mb-4 text-emerald-600 underline" onClick={() => setSelected(null)}>← Başka üretici seç</button>
        <h2 className="text-2xl font-bold mb-2">Genel Bilgi</h2>
        <div className="bg-slate-50 rounded p-4 mb-4 space-y-2">
          <div>
            <label className="block font-semibold">Çalışmak</label>
            <input name="genelCalismak" value={form.genelCalismak} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div>
            <label className="block font-semibold">Amaç</label>
            <input name="genelAmac" value={form.genelAmac} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Çalışma Yeri</h2>
        <div className="bg-slate-50 rounded p-4 mb-4 space-y-2">
          <div>
            <label className="block font-semibold">Ülke</label>
            <input name="ulke" value={form.ulke} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div>
            <label className="block font-semibold">Konum</label>
            <input name="konum" value={form.konum} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Mahsul Bilgileri</h2>
        <div className="bg-slate-50 rounded p-4 mb-4 space-y-2">
          <div>
            <label className="block font-semibold">Türler</label>
            <input name="turler" value={form.turler} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div>
            <label className="block font-semibold">Çeşitlilik</label>
            <input name="cesitlilik" value={form.cesitlilik} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Sonuçlar</h2>
        <div className="bg-slate-50 rounded p-4 mb-4 space-y-2">
          <div>
            <label className="block font-semibold">Tedaviler</label>
            <input name="tedaviler" value={form.tedaviler} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div>
            <label className="block font-semibold">Tekrarlar</label>
            <input name="tekrarlar" value={form.tekrarlar} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
          <div>
            <label className="block font-semibold">Tedavi başına bitki sayısı</label>
            <input name="tedaviBitkiSayisi" value={form.tedaviBitkiSayisi} onChange={handleChange} className="w-full p-2 rounded border" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Mahsul Durumu</h2>
        <div className="bg-slate-50 rounded p-4 mb-4">
          <label className="block font-semibold">Mahsul durumu</label>
          <textarea name="mahsulDurumu" value={form.mahsulDurumu} onChange={handleChange} className="w-full p-2 rounded border" rows={3} />
        </div>
        <h2 className="text-xl font-bold mb-2">Görüntüler</h2>
        <div className="bg-slate-50 rounded p-4 mb-4">
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <div className="flex flex-wrap gap-4 mt-2">
            {form.goruntuler.map((url, i) => (
              <img key={i} src={url} alt={`görsel${i}`} className="w-32 h-32 object-cover rounded" />
            ))}
          </div>
        </div>
        <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-600">Kaydet</button>
        {message && <div className="text-center text-emerald-600 mt-2">{message}</div>}
      </form>
    </div>
  );
};

const sidebarItems = [
  { id: 'producers', name: 'Üretici Listesi', icon: '👥' },
  { id: 'production', name: 'Üretim Alan Bilgisi', icon: '🏭' },
  { id: 'pre-planting', name: 'Dikim Öncesi Dönem', icon: '🌱' },
  { id: 'greenhouse', name: 'Sera Kontrol', icon: '🏠' },
  { id: 'harvest', name: 'Hasat Bilgisi', icon: '🌾' },
  { id: 'reports', name: 'Rapor', icon: '📊' },
  { id: 'deneme', name: 'Deneme', icon: '🧪' },
];

const sectionComponents: Record<string, ReactElement> = {
  'Üretici Listesi': <UreticiListesi />,
  'Üretim Alan Bilgisi': <UretimAlanBilgisi />,
  'Dikim Öncesi Dönem': <DikimOncesiDonem />,
  'Sera Kontrol': <SeraKontrol />,
  'Hasat Bilgisi': <HasatBilgisi />,
  'Rapor': <Rapor />,
  'Deneme': <DenemeComponent />,
};

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Üretici Listesi');
  const navigate = useNavigate();
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklayınca kapat
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setSettingsMenuOpen(false);
      }
    }
    if (settingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 lg:w-64
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">SERA TAKİP</h1>
              <p className="text-sm text-slate-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="space-y-2 px-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.name);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeSection === item.name 
                    ? 'bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-600 border border-emerald-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                  group relative
                `}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="font-medium text-left truncate">
                  {item.name}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">admin@sera.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <span>🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
                <h2 className="text-lg lg:text-xl font-semibold text-slate-800">{activeSection}</h2>
                <p className="text-sm text-slate-500">Yönetim paneli</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setSettingsMenuOpen((open) => !open)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Ayarlar"
                type="button"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {settingsMenuOpen && (
                <div ref={settingsMenuRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                        onClick={() => {
                          setSettingsMenuOpen(false);
                          navigate('/messages');
                        }}
                      >
                        Mesajlar
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                        onClick={() => {
                          setSettingsMenuOpen(false);
                          navigate('/admin/products');
                        }}
                      >
                        Ürün Yönetimi
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                        onClick={() => {
                          setSettingsMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        Profil
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {sectionComponents[activeSection]}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin; 