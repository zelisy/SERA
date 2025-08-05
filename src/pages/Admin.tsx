import React, { useState } from 'react';
import type { ReactElement } from 'react';
import UreticiListesi from '../components/UreticiListesi';
import UretimAlanBilgisi from '../components/UretimAlanBilgisi';
import DikimOncesiDonem from '../components/DikimOncesiDonem';
import SeraKontrol from '../components/SeraKontrol';
import HasatBilgisi from '../components/HasatBilgisi';
import Rapor from '../components/Rapor';
import RecipePage from './Recipe';
import RecipeCreate from './RecipeCreate';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { saveDenemeProducer, getAllDenemeProducers, deleteDenemeProducer, saveDenemeForm, getAllDenemeForms } from '../utils/firestoreUtils';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { exportDenemeFormToPDF } from '../utils/denemePDFUtils';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';



// DenemeComponent tanımı:
const DenemeComponent: React.FC = () => {
  const [producers, setProducers] = React.useState<{
    id: string, 
    firstName: string, 
    lastName: string,
    phone?: string,
    address?: string,
    gender?: string,
    birthDate?: string,
    registerDate?: string
  }[]>([]);
  const [selected, setSelected] = React.useState<{
    id: string, 
    firstName: string, 
    lastName: string,
    phone?: string,
    address?: string,
    gender?: string,
    birthDate?: string,
    registerDate?: string
  } | null>(null);
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
  const [addForm, setAddForm] = React.useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    gender: '',
    birthDate: '',
    registerDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = React.useState(false);
  const [savedForms, setSavedForms] = React.useState<any[]>([]); // Kayıtlı formlar
  const [editIndex, setEditIndex] = React.useState<number | null>(null); // Düzenlenen formun indexi
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<any | null>(null);
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [imageModalIndex, setImageModalIndex] = React.useState<number>(0);
  const [imageModalImages, setImageModalImages] = React.useState<string[]>([]);
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);

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
      await saveDenemeProducer({
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        phone: addForm.phone,
        address: addForm.address,
        gender: addForm.gender,
        birthDate: addForm.birthDate,
        registerDate: addForm.registerDate
      });
      setAddForm({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        gender: '',
        birthDate: '',
        registerDate: new Date().toISOString().split('T')[0]
      });
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

  const handleExportPDF = async (formData: any) => {
    setIsExportingPDF(true);
    try {
      await exportDenemeFormToPDF(formData);
      setMessage('PDF başarıyla oluşturuldu!');
    } catch (error) {
      console.error('PDF export error:', error);
      setMessage('PDF oluşturulurken bir hata oluştu!');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // ADIM 1: Üretici seçimi
  if (!selected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Deneme Formu Detayı
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

          {/* Add Producer Button */}
          <div className="mb-6 flex justify-end">
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" onClick={() => setShowAddForm(f => !f)}>
              {showAddForm ? 'Formu Kapat' : 'Üretici Ekle'}
            </button>
          </div>

          {/* Add Producer Form */}
          {showAddForm && (
            <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">👤 Yeni Üretici Ekle</h3>
              <form onSubmit={handleAddProducer} className="space-y-6">
                {/* Kişisel Bilgiler */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 border-b border-gray-200 pb-2">📋 Kişisel Bilgiler</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ad *</label>
                      <input 
                        name="firstName" 
                        value={addForm.firstName} 
                        onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Soyad *</label>
                      <input 
                        name="lastName" 
                        value={addForm.lastName} 
                        onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Cinsiyet</label>
                      <select 
                        name="gender" 
                        value={addForm.gender} 
                        onChange={e => setAddForm(f => ({ ...f, gender: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Doğum Tarihi</label>
                      <input 
                        type="date"
                        name="birthDate" 
                        value={addForm.birthDate} 
                        onChange={e => setAddForm(f => ({ ...f, birthDate: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Kayıt Tarihi</label>
                      <input 
                        type="date"
                        name="registerDate" 
                        value={addForm.registerDate} 
                        onChange={e => setAddForm(f => ({ ...f, registerDate: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 border-b border-gray-200 pb-2">📞 İletişim Bilgileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon</label>
                      <input 
                        name="phone" 
                        value={addForm.phone} 
                        onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" 
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Adres</label>
                      <textarea 
                        name="address" 
                        value={addForm.address} 
                        onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} 
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none" 
                        rows={3}
                        placeholder="Tam adres bilgisi..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Üretici Ekle
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Producers List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">👥 Üretici Listesi</h3>
            <p className="text-sm text-slate-600 mb-4">Üreticiyi seçmek için kartın üzerine tıklayın veya "Seç" butonunu kullanın.</p>
            {producers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">👥</div>
                <p>Henüz üretici eklenmedi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {producers.map((p) => (
                  <div 
                    key={p.id} 
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 group"
                    onClick={() => setSelected(p)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">
                            {p.gender === 'Erkek' ? '👨' : p.gender === 'Kadın' ? '👩' : '👤'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700">
                            {p.firstName} {p.lastName}
                          </h3>
                          <p className="text-slate-600 text-sm">{p.gender || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-emerald-500 text-sm font-medium">👆 Tıklayın</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium" 
                          onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                        >
                          ✅ Seç
                        </button>
                        <button 
                          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteProducer(p.id); }}
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADIM 2: Deneme formu
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50">
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header Section - PDF Style */}
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
                <p className="text-sm text-slate-600">Trial Form Details</p>
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

        <form className="space-y-6" onSubmit={handleSave}>
          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              Kaydediliyor...
            </div>
          )}

          {/* Genel Bilgiler Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">📋 Genel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Çalışmak</label>
                <input 
                  name="genelCalismak" 
                  value={form.genelCalismak} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amaç</label>
                <input 
                  name="genelAmac" 
                  value={form.genelAmac} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ülke</label>
                <input 
                  name="ulke" 
                  value={form.ulke} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Konum</label>
                <input 
                  name="konum" 
                  value={form.konum} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                />
              </div>
            </div>
          </div>

          {/* Deneme Detayları Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">🧪 Deneme Detayları</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Türler</label>
                  <input 
                    name="turler" 
                    value={form.turler} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Çeşitlilik</label>
                  <textarea 
                    name="cesitlilik" 
                    value={form.cesitlilik} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tedaviler</label>
                  <input 
                    name="tedaviler" 
                    value={form.tedaviler} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tekrarlar</label>
                  <input 
                    name="tekrarlar" 
                    value={form.tekrarlar} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tedavi Başına Bitki Sayısı</label>
                  <input 
                    name="tedaviBitkiSayisi" 
                    value={form.tedaviBitkiSayisi} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mahsul Durumu</label>
                  <input 
                    name="mahsulDurumu" 
                    value={form.mahsulDurumu} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Evrim</label>
                <textarea 
                  name="evrim" 
                  value={form.evrim} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" 
                  rows={3} 
                  placeholder="Evrim bilgileri..." 
                />
              </div>
            </div>
          </div>

          {/* Görüntüler Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">📸 Görüntüler</h2>
            <div className="flex flex-col items-center">
              <label htmlFor="deneme-goruntu-input" className="inline-block cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                📷 Fotoğraf Seç
              </label>
              <input id="deneme-goruntu-input" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-sm text-gray-500 mt-2 text-center">Birden fazla fotoğraf seçebilirsiniz</p>
            </div>
            <div className="flex flex-row flex-wrap gap-4 mt-4">
              {form.goruntuler.map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={`görsel${i}`} 
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200" 
                  onClick={e => { e.stopPropagation(); setImageModalImages(form.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} 
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button 
              type="submit" 
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              💾 Kaydet
            </button>
          </div>
          {message && <div className="text-center text-emerald-600 mt-3">{message}</div>}
        </form>
        {/* Kayıtlı Deneme Formları Listesi */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-gray-200 pb-2">📊 Kayıtlı Deneme Formları</h2>
            {savedForms.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg">Henüz kayıt yok.</p>
                <p className="text-sm">İlk deneme formunuzu oluşturmak için yukarıdaki formu kullanın.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedForms.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" 
                    onClick={() => { setModalOpen(true); setModalData(item); }}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {item.producer?.firstName?.charAt(0)}{item.producer?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{item.producer?.firstName} {item.producer?.lastName}</div>
                            <div className="text-xs text-slate-600">Üretici</div>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-2 rounded-lg shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium" 
                            onClick={() => handleEdit(idx)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-lg shadow hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium" 
                            onClick={() => handleDelete(idx)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-slate-700">
                            <span className="font-semibold">Amaç:</span> {item.genelAmac?.substring(0, 50)}...
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-sm text-slate-700">
                            <span className="font-semibold">Mahsul:</span> {item.mahsulDurumu?.substring(0, 40)}...
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      {item.goruntuler?.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-semibold text-slate-700 mb-2">Görüntüler:</div>
                          <div className="flex flex-row flex-wrap gap-2">
                            {item.goruntuler.slice(0, 3).map((url: string, i: number) => (
                              <img 
                                key={i} 
                                src={url} 
                                alt={`görsel${i}`} 
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                              />
                            ))}
                            {item.goruntuler.length > 3 && (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                                +{item.goruntuler.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Detaylı Pop-up Modal */}
        {modalOpen && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
              <button className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-emerald-600 z-10" onClick={() => setModalOpen(false)}>&times;</button>
              
              {/* Header Section - PDF Style */}
              <div className="text-center mb-6 border-b-2 border-emerald-500 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Deneme Formu Detayı</h2>
                <p className="text-lg text-slate-600 mb-1">Trial Form Details</p>
                <p className="text-sm text-slate-500">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>

              {/* Content Sections */}
              <div className="space-y-6">
                {/* Üretici Bilgileri */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-gray-200 pb-2">👤 Üretici Bilgileri</h3>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Üretici Adı:</span> {modalData.producer?.firstName} {modalData.producer?.lastName}
                  </div>
                </div>

                {/* Genel Bilgiler */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-gray-200 pb-2">📋 Genel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Çalışmak:</span> {modalData.genelCalismak || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Amaç:</span> {modalData.genelAmac || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Ülke:</span> {modalData.ulke || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Konum:</span> {modalData.konum || 'Belirtilmemiş'}
                    </div>
                  </div>
                </div>

                {/* Deneme Detayları */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-gray-200 pb-2">🧪 Deneme Detayları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Türler:</span> {modalData.turler || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Çeşitlilik:</span> {modalData.cesitlilik || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Tedaviler:</span> {modalData.tedaviler || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Tekrarlar:</span> {modalData.tekrarlar || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Tedavi Başına Bitki Sayısı:</span> {modalData.tedaviBitkiSayisi || 'Belirtilmemiş'}
                    </div>
                  </div>
                </div>

                {/* Sonuçlar */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-gray-200 pb-2">📊 Sonuçlar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Mahsul Durumu:</span> {modalData.mahsulDurumu || 'Belirtilmemiş'}
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-slate-700">Evrim:</span> {modalData.evrim || 'Belirtilmemiş'}
                    </div>
                  </div>
                </div>

                {/* PDF Export Button */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <button
                    onClick={() => handleExportPDF(modalData)}
                    disabled={isExportingPDF}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
                  >
                    {isExportingPDF ? (
                      <>
                        <FaSpinner className="w-6 h-6 animate-spin" />
                        <span className="text-lg">PDF Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="w-6 h-6" />
                        <span className="text-lg">PDF İndir</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Görüntüler */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-gray-200 pb-2">📸 Görüntüler</h3>
                  <div className="flex flex-row flex-wrap gap-3">
                    {modalData.goruntuler?.length > 0 ? (
                      modalData.goruntuler.map((url: string, i: number) => (
                        <img 
                          key={i} 
                          src={url} 
                          alt={`görsel${i}`} 
                          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-white" 
                          onClick={e => { e.stopPropagation(); setImageModalImages(modalData.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} 
                        />
                      ))
                    ) : (
                      <div className="w-full text-center py-8">
                        <span className="text-slate-400 text-lg">Görsel yok</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Görsel Carousel Lightbox Modal */}
        {imageModalOpen && imageModalImages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setImageModalOpen(false)}>
            <div className="relative flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
              <button
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-2xl md:text-4xl text-white bg-black/40 rounded-full px-2 md:px-3 py-1 hover:bg-black/70 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={e => { e.stopPropagation(); setImageModalIndex((prev) => (prev - 1 + imageModalImages.length) % imageModalImages.length); }}
                disabled={imageModalImages.length < 2}
              >&#8592;</button>
              <img src={imageModalImages[imageModalIndex]} alt="Büyük görsel" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border-2 md:border-4 border-white" />
              <button
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-2xl md:text-4xl text-white bg-black/40 rounded-full px-2 md:px-3 py-1 hover:bg-black/70 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={e => { e.stopPropagation(); setImageModalIndex((prev) => (prev + 1) % imageModalImages.length); }}
                disabled={imageModalImages.length < 2}
              >&#8594;</button>
              <button className="absolute top-2 md:top-8 right-2 md:right-8 text-2xl md:text-4xl text-white bg-black/40 rounded-full px-2 md:px-3 py-1 hover:bg-black/70 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setImageModalOpen(false)}>&times;</button>
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
  { id: 'recete', name: 'Reçete', icon: '💊' },
  { id: 'deneme', name: 'Deneme', icon: '🧪' },
];

const sectionComponents: Record<string, ReactElement> = {
  'Üretici Listesi': <UreticiListesi />,
  'Üretim Alan Bilgisi': <UretimAlanBilgisi />,
  'Dikim Öncesi Dönem': <DikimOncesiDonem />,
  'Sera Kontrol': <SeraKontrol />,
  'Hasat Bilgisi': <HasatBilgisi />,
  'Rapor': <Rapor />,
  'Reçete': <RecipePage />,
  'Deneme': <DenemeComponent />,
};

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Üretici Listesi');
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (_firebaseUser) => {
      // Auth state monitoring can be added here if needed
    });
    return () => unsubscribe();
  }, [auth]);

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

  // Route kontrolü - eğer recipe route'undaysa Recipe component'ini göster
  const isRecipeRoute = location.pathname.startsWith('/admin/recipe');
  const isRecipesRoute = location.pathname === '/admin/recipes';
  const isRecipeCreateRoute = location.pathname.includes('/admin/recipe/create/');
  
  // Route'a göre activeSection'ı ayarla
  React.useEffect(() => {
    if (isRecipeRoute) {
      setActiveSection('Reçete');
    } else if (location.pathname === '/admin') {
      // Ana admin sayfasında varsayılan section'ı ayarla
      if (activeSection === 'Reçete') {
        setActiveSection('Üretici Listesi');
      }
    }
  }, [location.pathname, isRecipeRoute]);

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
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">AGROVİA</h1>
              <p className="text-sm text-emerald-600 font-medium">Admin Panel</p>
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
                  // Reçete için özel route yönlendirmesi
                  if (item.id === 'recete') {
                    navigate('/admin/recipe');
                  } else {
                    // Diğer sayfalar için ana admin sayfasına dön
                    navigate('/admin');
                  }
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${(activeSection === item.name || (item.id === 'recete' && isRecipeRoute))
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg transform scale-105 border-2 border-emerald-400' 
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-blue-100 hover:text-emerald-700 hover:shadow-md hover:transform hover:scale-102'
                  }
                  group relative overflow-hidden
                `}
              >
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 
                  ${activeSection === item.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  transition-opacity duration-300
                `}></div>
                <span className={`
                  text-xl flex-shrink-0 relative z-10
                  ${activeSection === item.name ? 'animate-pulse' : 'group-hover:animate-bounce'}
                `}>
                  {item.icon}
                </span>
                <span className="font-semibold text-left truncate relative z-10">
                  {item.name}
                </span>
                {(activeSection === item.name || (item.id === 'recete' && isRecipeRoute)) && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="text-lg">🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-gradient-to-r from-emerald-50 to-blue-50 shadow-lg border-b border-emerald-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-lg hover:bg-emerald-100 transition-colors text-emerald-600"
                  title="Ana Sayfaya Dön"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                
                <div>
                  <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{activeSection}</h2>
                  <p className="text-sm text-emerald-600 font-medium">Yönetim paneli</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setSettingsMenuOpen((open) => !open)}
                className="p-2 rounded-full hover:bg-emerald-100 transition-colors transform hover:scale-110"
                aria-label="Ayarlar"
                type="button"
              >
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          navigate('/blog-management');
                        }}
                      >
                        Blog Yönetimi
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
            {isRecipeCreateRoute ? (
              <RecipeCreate />
            ) : isRecipeRoute || isRecipesRoute ? (
              <div>
                <RecipePage />
              </div>
            ) : (
              sectionComponents[activeSection] || sectionComponents['Üretici Listesi']
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin; 