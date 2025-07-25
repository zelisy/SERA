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
import { saveDenemeProducer, getAllDenemeProducers, deleteDenemeProducer, saveDenemeForm, getAllDenemeForms } from '../utils/firestoreUtils';
import type { Producer } from '../types/producer';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';

// DenemeComponent tanımı:
const DenemeComponent: React.FC = () => {
  const [producers, setProducers] = React.useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [selected, setSelected] = React.useState<{id: string, firstName: string, lastName: string} | null>(null);
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
    evrim: '', // yeni eklenen alan
    goruntuler: [] as string[],
  });
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [message, setMessage] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = React.useState(false);
  const [savedForms, setSavedForms] = React.useState<any[]>([]); // Kayıtlı formlar
  const [editIndex, setEditIndex] = React.useState<number | null>(null); // Düzenlenen formun indexi
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<any | null>(null);
  const navigate = useNavigate();
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [imageModalIndex, setImageModalIndex] = React.useState<number>(0);
  const [imageModalImages, setImageModalImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    getAllDenemeProducers().then(setProducers).catch(() => setProducers([]));
    // Deneme formlarını Firestore'dan çek
    getAllDenemeForms().then(setSavedForms).catch(() => setSavedForms([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      const urls = files.map(f => URL.createObjectURL(f));
      setForm(prev => ({ ...prev, goruntuler: [...prev.goruntuler, ...urls] }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await Promise.all(imageFiles.map(file => uploadToCloudinary(file)));
    }
    let newForm = { ...form, producer: selected, goruntuler: imageUrls };
    if (editIndex !== null) {
      // Düzenleme modunda güncelle (Firestore'da silip tekrar ekle)
      const oldId = savedForms[editIndex]?.id;
      if (oldId) {
        // Firestore'dan sil
        // (Silme fonksiyonu eklenirse burada kullanılabilir)
      }
      await saveDenemeForm(newForm);
      setEditIndex(null);
    } else {
      await saveDenemeForm(newForm);
    }
    setMessage('Kayıt edildi');
    setForm({
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
      evrim: '',
      goruntuler: [],
    });
    setImageFiles([]);
    setSelected(null);
    setLoading(false);
    // Kayıtları tekrar çek
    getAllDenemeForms().then(setSavedForms);
  };

  const handleEdit = (idx: number) => {
    const item = savedForms[idx];
    setForm({ ...item });
    setEditIndex(idx);
    setMessage('Düzenleme modunda');
  };

  const handleDelete = async (idx: number) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      const formToDelete = savedForms[idx];
      if (formToDelete && formToDelete.id) {
        await deleteDoc(doc(db, 'denemeForms', formToDelete.id));
      }
      setSavedForms(prev => prev.filter((_, i) => i !== idx));
      getAllDenemeForms().then(setSavedForms);
    }
  };

  const handleAddProducer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.firstName.trim() || !addForm.lastName.trim()) return;
    setLoading(true);
    try {
      await saveDenemeProducer({ firstName: addForm.firstName, lastName: addForm.lastName });
      setAddForm({ firstName: '', lastName: '' });
      setShowAddForm(false);
      const updated = await getAllDenemeProducers();
      setProducers(updated);
    } catch {
      setMessage('Üretici eklenemedi!');
    }
    setLoading(false);
  };

  const handleDeleteProducer = async (id: string) => {
    if (!window.confirm('Bu üreticiyi silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      await deleteDenemeProducer(id);
      const updated = await getAllDenemeProducers();
      setProducers(updated);
    } catch {
      setMessage('Üretici silinemedi!');
    }
    setLoading(false);
  };

  // ADIM 1: Üretici seçimi
  if (!selected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <button onClick={() => navigate(-1)} className="mb-6 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow hover:from-gray-400 hover:to-gray-500 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
            ← Geri
          </button>
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Deneme Ekranı
            </h1>
            <p className="text-slate-600 text-lg">
              Devam etmek için önce bir üretici seçin
            </p>
          </div>
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2">Deneme Formu</span>
              </div>
            </div>
          </div>
          <div className="mb-6 flex justify-end">
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" onClick={() => setShowAddForm(f => !f)}>
              {showAddForm ? 'Formu Kapat' : 'Üretici Ekle'}
            </button>
          </div>
          {showAddForm && (
            <form onSubmit={handleAddProducer} className="mb-6 bg-slate-50 p-4 rounded-xl border space-y-3">
              <div>
                <label className="block font-semibold mb-1">Ad</label>
                <input name="firstName" value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} className="w-full p-2 rounded border" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">Soyad</label>
                <input name="lastName" value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} className="w-full p-2 rounded border" required />
              </div>
              <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-600 mt-2">Ekle</button>
            </form>
          )}
          <ul className="space-y-2">
            {producers.length === 0 && <li className="text-slate-500">Henüz üretici eklenmedi.</li>}
            {producers.map((p) => (
              <li key={p.id} className="flex items-center justify-between bg-slate-50 rounded p-3 border">
                <span>{p.firstName} {p.lastName}</span>
                <div className="flex gap-2">
                  <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-1 rounded shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" onClick={() => setSelected(p)}>Seç</button>
                  <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded shadow hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400" onClick={() => handleDeleteProducer(p.id)}>Sil</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ADIM 2: Deneme formu
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🧪</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                  Deneme - {selected.firstName} {selected.lastName}
                </h1>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800 rounded-xl shadow hover:from-gray-300 hover:to-gray-500 hover:scale-105 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              👤 Üretici Değiştir
            </button>
          </div>
        </div>
        <form className="space-y-8" onSubmit={handleSave}>
          <h2 className="text-2xl font-bold mb-2">Genel Bilgi</h2>
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4 space-y-2">
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
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4 space-y-2">
            <div>
              <label className="block font-semibold">Ülke</label>
              <select name="ulke" value={form.ulke} onChange={handleChange} className="w-full p-2 rounded border">
                <option value="">Ülke Seçiniz</option>
                <option value="Türkiye">Türkiye</option>
                <option value="Almanya">Almanya</option>
                <option value="Fransa">Fransa</option>
                <option value="İtalya">İtalya</option>
                <option value="İspanya">İspanya</option>
                <option value="Ukrayna">Ukrayna</option>
                <option value="ABD">ABD</option>
                <option value="İngiltere">İngiltere</option>
                <option value="Rusya">Rusya</option>
                <option value="Çin">Çin</option>
                <option value="Japonya">Japonya</option>
                <option value="Hollanda">Hollanda</option>
                <option value="Brezilya">Brezilya</option>
                <option value="Kanada">Kanada</option>
                <option value="Avustralya">Avustralya</option>
                <option value="Meksika">Meksika</option>
                <option value="Güney Kore">Güney Kore</option>
                <option value="Hindistan">Hindistan</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold">Konum</label>
              <input name="konum" value={form.konum} onChange={handleChange} className="w-full p-2 rounded border" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Mahsul Bilgileri</h2>
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4 space-y-2">
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
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4 space-y-2">
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
              <input name="tedaviBitkiSayisi" type="number" value={form.tedaviBitkiSayisi} onChange={handleChange} className="w-full p-2 rounded border" min="0" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Mahsul Durumu</h2>
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4 space-y-4">
            <div>
              <label className="block font-semibold">Mahsul durumu</label>
              <textarea name="mahsulDurumu" value={form.mahsulDurumu} onChange={handleChange} className="w-full p-2 rounded border" rows={3} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Evrim</h3>
              <textarea name="evrim" value={form.evrim} onChange={handleChange} className="w-full p-2 rounded border" rows={2} placeholder="Evrim bilgisini giriniz..." />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Görüntüler</h2>
          <div className="bg-slate-50 rounded-2xl shadow border p-4 mb-4">
            <label htmlFor="deneme-goruntu-input" className="inline-block cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400">
              📷 Fotoğraf Seç
            </label>
            <input id="deneme-goruntu-input" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            <div className="flex flex-row flex-wrap gap-4 mt-2">
              {form.goruntuler.map((url, i) => (
                <img key={i} src={url} alt={`görsel${i}`} className="w-32 h-32 object-cover rounded shadow cursor-pointer" onClick={e => { e.stopPropagation(); setImageModalImages(form.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
              ))}
            </div>
          </div>
          <button type="submit" className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400">Kaydet</button>
          {message && <div className="text-center text-emerald-600 mt-2">{message}</div>}
        </form>
        {/* Kayıtlı Deneme Formları Listesi */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Kayıtlı Deneme Formları</h2>
          {savedForms.length === 0 && <div className="text-slate-500">Henüz kayıt yok.</div>}
          <ul className="space-y-4">
            {savedForms.map((item, idx) => (
              <li key={idx} className="bg-white rounded-xl shadow border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-emerald-50 transition" onClick={() => { setModalOpen(true); setModalData(item); }}>
                <div>
                  <div className="font-semibold text-emerald-700">{item.producer?.firstName} {item.producer?.lastName}</div>
                  <div className="text-sm text-slate-600">Amaç: {item.genelAmac}</div>
                  <div className="text-sm text-slate-600">Mahsul Durumu: {item.mahsulDurumu}</div>
                  <div className="text-sm text-slate-600">Evrim: {item.evrim}</div>
                  <div className="flex flex-row flex-wrap gap-2 mt-2">
                    {item.goruntuler?.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`görsel${i}`} className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-1 rounded shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" onClick={() => handleEdit(idx)}>Düzenle</button>
                  <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded shadow hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400" onClick={() => handleDelete(idx)}>Sil</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Detaylı Pop-up Modal */}
        {modalOpen && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in">
              <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-emerald-600" onClick={() => setModalOpen(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-emerald-700">Deneme Formu Detayı</h2>
              <div className="space-y-2 mb-4">
                <div><span className="font-semibold">Üretici:</span> {modalData.producer?.firstName} {modalData.producer?.lastName}</div>
                <div><span className="font-semibold">Çalışmak:</span> {modalData.genelCalismak}</div>
                <div><span className="font-semibold">Amaç:</span> {modalData.genelAmac}</div>
                <div><span className="font-semibold">Ülke:</span> {modalData.ulke}</div>
                <div><span className="font-semibold">Konum:</span> {modalData.konum}</div>
                <div><span className="font-semibold">Türler:</span> {modalData.turler}</div>
                <div><span className="font-semibold">Çeşitlilik:</span> {modalData.cesitlilik}</div>
                <div><span className="font-semibold">Tedaviler:</span> {modalData.tedaviler}</div>
                <div><span className="font-semibold">Tekrarlar:</span> {modalData.tekrarlar}</div>
                <div><span className="font-semibold">Tedavi başına bitki sayısı:</span> {modalData.tedaviBitkiSayisi}</div>
                <div><span className="font-semibold">Mahsul Durumu:</span> {modalData.mahsulDurumu}</div>
                <div><span className="font-semibold">Evrim:</span> {modalData.evrim}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Görüntüler:</div>
                <div className="flex flex-row flex-wrap gap-3">
                  {modalData.goruntuler?.length > 0 ? (
                    modalData.goruntuler.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`görsel${i}`} className="w-32 h-32 object-cover rounded shadow cursor-pointer" onClick={e => { e.stopPropagation(); setImageModalImages(modalData.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
                    ))
                  ) : (
                    <span className="text-slate-400">Görsel yok</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Görsel Carousel Lightbox Modal */}
        {imageModalOpen && imageModalImages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setImageModalOpen(false)}>
            <div className="relative flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-white bg-black/40 rounded-full px-3 py-1 hover:bg-black/70 z-10"
                onClick={e => { e.stopPropagation(); setImageModalIndex((prev) => (prev - 1 + imageModalImages.length) % imageModalImages.length); }}
                disabled={imageModalImages.length < 2}
              >&#8592;</button>
              <img src={imageModalImages[imageModalIndex]} alt="Büyük görsel" className="max-w-3xl max-h-[80vh] rounded-xl shadow-2xl border-4 border-white" />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl text-white bg-black/40 rounded-full px-3 py-1 hover:bg-black/70 z-10"
                onClick={e => { e.stopPropagation(); setImageModalIndex((prev) => (prev + 1) % imageModalImages.length); }}
                disabled={imageModalImages.length < 2}
              >&#8594;</button>
              <button className="absolute top-8 right-8 text-4xl text-white bg-black/40 rounded-full px-3 py-1 hover:bg-black/70" onClick={() => setImageModalOpen(false)}>&times;</button>
            </div>
          </div>
        )}
      </div>
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