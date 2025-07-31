import React, { useState } from 'react';
import type { ReactElement } from 'react';
import UreticiListesi from '../components/UreticiListesi';
import UretimAlanBilgisi from '../components/UretimAlanBilgisi';
import DikimOncesiDonem from '../components/DikimOncesiDonem';
import SeraKontrol from '../components/SeraKontrol';
import HasatBilgisi from '../components/HasatBilgisi';
import Rapor from '../components/Rapor';
import Recipe from './Recipe';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { saveDenemeProducer, getAllDenemeProducers, deleteDenemeProducer, saveDenemeForm, getAllDenemeForms } from '../utils/firestoreUtils';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// ReçeteComponent tanımı:
const ReceteComponent: React.FC = () => {
  const [producers, setProducers] = React.useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [selectedProducer, setSelectedProducer] = React.useState<{id: string, firstName: string, lastName: string} | null>(null);
  const [form, setForm] = React.useState({
    hastaAdi: '',
    hastaSoyadi: '',
    hastaYasi: '',
    hastaTelefon: '',
    hastalikAdi: '',
    hastalikBelirtileri: '',
    tedaviYontemi: '',
    ilaclar: '',
    dozaj: '',
    kullanimSuresi: '',
    notlar: '',
    goruntuler: [] as string[],
    producerId: '',
    producerName: ''
  });
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [savedReceteler, setSavedReceteler] = React.useState<any[]>([]);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<any | null>(null);
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [imageModalIndex, setImageModalIndex] = React.useState<number>(0);
  const [imageModalImages, setImageModalImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Üreticileri Firestore'dan çek
    getAllDenemeProducers().then(setProducers).catch(() => setProducers([]));
    // Reçete verilerini Firestore'dan çek
    // getAllReceteler().then(setSavedReceteler).catch(() => setSavedReceteler([]));
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
    let newForm = { 
      ...form, 
      producer: selectedProducer, 
      goruntuler: imageUrls,
      producerId: selectedProducer?.id || '',
      producerName: selectedProducer ? `${selectedProducer.firstName} ${selectedProducer.lastName}` : ''
    };
    if (editIndex !== null) {
      // Düzenleme modunda güncelle
      const oldId = savedReceteler[editIndex]?.id;
      if (oldId) {
        // Firestore'dan sil
        // (Silme fonksiyonu eklenirse burada kullanılabilir)
      }
      await saveDenemeForm(newForm);
      setEditIndex(null);
    } else {
      await saveDenemeForm(newForm);
    }
    setMessage('Reçete kaydedildi');
    setForm({
      hastaAdi: '',
      hastaSoyadi: '',
      hastaYasi: '',
      hastaTelefon: '',
      hastalikAdi: '',
      hastalikBelirtileri: '',
      tedaviYontemi: '',
      ilaclar: '',
      dozaj: '',
      kullanimSuresi: '',
      notlar: '',
      goruntuler: [],
      producerId: '',
      producerName: ''
    });
    setImageFiles([]);
    setLoading(false);
  };

  const handleEdit = (idx: number) => {
    const item = savedReceteler[idx];
    setForm({
      hastaAdi: item.hastaAdi || '',
      hastaSoyadi: item.hastaSoyadi || '',
      hastaYasi: item.hastaYasi || '',
      hastaTelefon: item.hastaTelefon || '',
      hastalikAdi: item.hastalikAdi || '',
      hastalikBelirtileri: item.hastalikBelirtileri || '',
      tedaviYontemi: item.tedaviYontemi || '',
      ilaclar: item.ilaclar || '',
      dozaj: item.dozaj || '',
      kullanimSuresi: item.kullanimSuresi || '',
      notlar: item.notlar || '',
      goruntuler: item.goruntuler || [],
      producerId: item.producerId || '',
      producerName: item.producerName || ''
    });
    setEditIndex(idx);
  };

  const handleDelete = async (idx: number) => {
    const item = savedReceteler[idx];
    if (item.id) {
      await deleteDoc(doc(db, 'denemeForms', item.id));
    }
    setSavedReceteler(prev => prev.filter((_, i) => i !== idx));
  };

  // ADIM 1: Üretici seçimi
  if (!selectedProducer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Reçete Yönetimi
            </h1>
            <p className="text-slate-600 text-lg">
              Reçete oluşturmak için önce bir üretici seçin
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-purple-600">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2">Reçete Formu</span>
              </div>
            </div>
          </div>

          {/* Producer Selection */}
          <UreticiListesi
            selectionMode={true}
            onSelect={setSelectedProducer}
            selectedProducer={selectedProducer}
          />
        </div>
      </div>
    );
  }

  // ADIM 2: Reçete formu
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header with Producer Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💊</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                  Reçete - {selectedProducer.firstName} {selectedProducer.lastName}
                </h1>
                <p className="text-slate-600">
                  Hasta bilgileri ve tedavi reçetesi
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSelectedProducer(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                👤 Üretici Değiştir
              </button>
            </div>
          </div>
        </div>

        {/* Reçete Formu */}
        <form className="space-y-6 md:space-y-8" onSubmit={handleSave}>
          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              Kaydediliyor...
            </div>
          )}
          
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Hasta Bilgileri</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Hasta Adı</label>
                <input name="hastaAdi" value={form.hastaAdi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Hasta Soyadı</label>
                <input name="hastaSoyadi" value={form.hastaSoyadi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Yaş</label>
                <input name="hastaYasi" type="number" value={form.hastaYasi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" min="0" max="150" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Telefon</label>
                <input name="hastaTelefon" value={form.hastaTelefon} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Hastalık Bilgileri</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Hastalık Adı</label>
              <input name="hastalikAdi" value={form.hastalikAdi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Hastalık Belirtileri</label>
              <textarea name="hastalikBelirtileri" value={form.hastalikBelirtileri} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={3} />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Tedavi Bilgileri</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Tedavi Yöntemi</label>
                <input name="tedaviYontemi" value={form.tedaviYontemi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">İlaçlar</label>
                <input name="ilaclar" value={form.ilaclar} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Dozaj</label>
                <input name="dozaj" value={form.dozaj} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Kullanım Süresi</label>
                <input name="kullanimSuresi" value={form.kullanimSuresi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Notlar</label>
              <textarea name="notlar" value={form.notlar} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={3} placeholder="Ek notlar ve öneriler..." />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Görüntüler</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex flex-col items-center">
              <label htmlFor="recete-goruntu-input" className="inline-block cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base">
                📷 Fotoğraf Seç
              </label>
              <input id="recete-goruntu-input" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-gray-500 mt-2 text-center">Birden fazla fotoğraf seçebilirsiniz</p>
            </div>
            <div className="flex flex-row flex-wrap gap-2 md:gap-4 mt-3 md:mt-4">
              {form.goruntuler.map((url, i) => (
                <img key={i} src={url} alt={`görsel${i}`} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200" onClick={e => { e.stopPropagation(); setImageModalImages(form.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button type="submit" className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm md:text-base">
              💾 {editIndex !== null ? 'Güncelle' : 'Kaydet'}
            </button>
            {editIndex !== null && (
              <button 
                type="button" 
                onClick={() => {
                  setEditIndex(null);
                  setForm({
                    hastaAdi: '',
                    hastaSoyadi: '',
                    hastaYasi: '',
                    hastaTelefon: '',
                    hastalikAdi: '',
                    hastalikBelirtileri: '',
                    tedaviYontemi: '',
                    ilaclar: '',
                    dozaj: '',
                    kullanimSuresi: '',
                    notlar: '',
                    goruntuler: [],
                    producerId: '',
                    producerName: ''
                  });
                  setImageFiles([]);
                }}
                className="px-4 md:px-6 py-3 md:py-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                ❌ İptal
              </button>
            )}
          </div>
          {message && <div className="text-center text-purple-600 mt-3 text-sm md:text-base">{message}</div>}
        </form>

        {/* Kayıtlı Reçeteler Listesi */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Kayıtlı Reçeteler</h2>
          {savedReceteler.length === 0 && <div className="text-slate-500 text-center py-8">Henüz kayıt yok.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {savedReceteler.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow border p-3 md:p-4 cursor-pointer hover:bg-purple-50 transition-all duration-200 hover:shadow-lg" onClick={() => { setModalOpen(true); setModalData(item); }}>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-purple-700 text-sm md:text-base">{item.hastaAdi} {item.hastaSoyadi}</div>
                    <div className="flex gap-1 md:gap-2" onClick={e => e.stopPropagation()}>
                      <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs md:text-sm" onClick={() => handleEdit(idx)}>✏️</button>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg shadow hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xs md:text-sm" onClick={() => handleDelete(idx)}>🗑️</button>
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 space-y-1">
                    <div><span className="font-medium">Hastalık:</span> {item.hastalikAdi?.substring(0, 30)}...</div>
                    <div><span className="font-medium">Tedavi:</span> {item.tedaviYontemi?.substring(0, 30)}...</div>
                    <div><span className="font-medium">Üretici:</span> {item.producerName?.substring(0, 25)}...</div>
                  </div>
                  {item.goruntuler?.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-1 md:gap-2 mt-2">
                      {item.goruntuler.slice(0, 3).map((url: string, i: number) => (
                        <img key={i} src={url} alt={`görsel${i}`} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                      ))}
                      {item.goruntuler.length > 3 && (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                          +{item.goruntuler.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detaylı Pop-up Modal */}
        {modalOpen && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm md:max-w-2xl w-full p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
              <button className="absolute top-2 md:top-4 right-2 md:right-4 text-xl md:text-2xl text-gray-400 hover:text-purple-600 z-10" onClick={() => setModalOpen(false)}>&times;</button>
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 text-purple-700 pr-8">Reçete Detayı</h2>
              <div className="space-y-2 md:space-y-3 mb-4 text-sm md:text-base">
                <div><span className="font-semibold">Üretici:</span> {modalData.producerName}</div>
                <div><span className="font-semibold">Hasta Adı:</span> {modalData.hastaAdi} {modalData.hastaSoyadi}</div>
                <div><span className="font-semibold">Yaş:</span> {modalData.hastaYasi}</div>
                <div><span className="font-semibold">Telefon:</span> {modalData.hastaTelefon}</div>
                <div><span className="font-semibold">Hastalık:</span> {modalData.hastalikAdi}</div>
                <div><span className="font-semibold">Belirtiler:</span> {modalData.hastalikBelirtileri}</div>
                <div><span className="font-semibold">Tedavi Yöntemi:</span> {modalData.tedaviYontemi}</div>
                <div><span className="font-semibold">İlaçlar:</span> {modalData.ilaclar}</div>
                <div><span className="font-semibold">Dozaj:</span> {modalData.dozaj}</div>
                <div><span className="font-semibold">Kullanım Süresi:</span> {modalData.kullanimSuresi}</div>
                <div><span className="font-semibold">Notlar:</span> {modalData.notlar}</div>
              </div>
              <div>
                <div className="font-semibold mb-2 md:mb-3">Görüntüler:</div>
                <div className="flex flex-row flex-wrap gap-2 md:gap-3">
                  {modalData.goruntuler?.length > 0 ? (
                    modalData.goruntuler.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`görsel${i}`} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200" onClick={e => { e.stopPropagation(); setImageModalImages(modalData.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm md:text-base">Görsel yok</span>
                  )}
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
        <form className="space-y-6 md:space-y-8" onSubmit={handleSave}>
          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              Kaydediliyor...
            </div>
          )}
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Genel Bilgiler</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Genel Çalışmak</label>
                <input name="genelCalismak" value={form.genelCalismak} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Genel Amaç</label>
                <input name="genelAmac" value={form.genelAmac} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Ülke</label>
                <input name="ulke" value={form.ulke} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Konum</label>
                <input name="konum" value={form.konum} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Tür ve Çeşitlilik Bilgileri</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Türler</label>
              <input name="turler" value={form.turler} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Çeşitlilik</label>
              <textarea name="cesitlilik" value={form.cesitlilik} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={3} />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Tedavi ve Tekrar Bilgileri</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4 space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Tedaviler</label>
                <input name="tedaviler" value={form.tedaviler} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Tekrarlar</label>
                <input name="tekrarlar" value={form.tekrarlar} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Tedavi Bitki Sayısı</label>
                <input name="tedaviBitkiSayisi" value={form.tedaviBitkiSayisi} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Mahsul Durumu</label>
                <input name="mahsulDurumu" value={form.mahsulDurumu} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm md:text-base font-semibold mb-1 md:mb-2">Evrim</label>
              <textarea name="evrim" value={form.evrim} onChange={handleChange} className="w-full p-2 md:p-3 rounded-lg border text-sm md:text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={3} placeholder="Evrim bilgileri..." />
            </div>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Görüntüler</h2>
          <div className="bg-slate-50 rounded-xl shadow border p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex flex-col items-center">
              <label htmlFor="deneme-goruntu-input" className="inline-block cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm md:text-base">
                📷 Fotoğraf Seç
              </label>
              <input id="deneme-goruntu-input" type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-gray-500 mt-2 text-center">Birden fazla fotoğraf seçebilirsiniz</p>
            </div>
            <div className="flex flex-row flex-wrap gap-2 md:gap-4 mt-3 md:mt-4">
              {form.goruntuler.map((url, i) => (
                <img key={i} src={url} alt={`görsel${i}`} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200" onClick={e => { e.stopPropagation(); setImageModalImages(form.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button type="submit" className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm md:text-base">
              💾 Kaydet
            </button>
          </div>
          {message && <div className="text-center text-emerald-600 mt-3 text-sm md:text-base">{message}</div>}
        </form>
        {/* Kayıtlı Deneme Formları Listesi */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Kayıtlı Deneme Formları</h2>
          {savedForms.length === 0 && <div className="text-slate-500 text-center py-8">Henüz kayıt yok.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {savedForms.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow border p-3 md:p-4 cursor-pointer hover:bg-emerald-50 transition-all duration-200 hover:shadow-lg" onClick={() => { setModalOpen(true); setModalData(item); }}>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-emerald-700 text-sm md:text-base">{item.producer?.firstName} {item.producer?.lastName}</div>
                    <div className="flex gap-1 md:gap-2" onClick={e => e.stopPropagation()}>
                      <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs md:text-sm" onClick={() => handleEdit(idx)}>✏️</button>
                      <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg shadow hover:from-red-600 hover:to-pink-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xs md:text-sm" onClick={() => handleDelete(idx)}>🗑️</button>
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-slate-600 space-y-1">
                    <div><span className="font-medium">Amaç:</span> {item.genelAmac?.substring(0, 50)}...</div>
                    <div><span className="font-medium">Mahsul:</span> {item.mahsulDurumu?.substring(0, 40)}...</div>
                  </div>
                  {item.goruntuler?.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-1 md:gap-2 mt-2">
                      {item.goruntuler.slice(0, 3).map((url: string, i: number) => (
                        <img key={i} src={url} alt={`görsel${i}`} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                      ))}
                      {item.goruntuler.length > 3 && (
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                          +{item.goruntuler.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Detaylı Pop-up Modal */}
        {modalOpen && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm md:max-w-2xl w-full p-4 md:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
              <button className="absolute top-2 md:top-4 right-2 md:right-4 text-xl md:text-2xl text-gray-400 hover:text-emerald-600 z-10" onClick={() => setModalOpen(false)}>&times;</button>
              <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 text-emerald-700 pr-8">Deneme Formu Detayı</h2>
              <div className="space-y-2 md:space-y-3 mb-4 text-sm md:text-base">
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
                <div className="font-semibold mb-2 md:mb-3">Görüntüler:</div>
                <div className="flex flex-row flex-wrap gap-2 md:gap-3">
                  {modalData.goruntuler?.length > 0 ? (
                    modalData.goruntuler.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`görsel${i}`} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg shadow cursor-pointer hover:scale-105 transition-transform duration-200" onClick={e => { e.stopPropagation(); setImageModalImages(modalData.goruntuler); setImageModalIndex(i); setImageModalOpen(true); }} />
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm md:text-base">Görsel yok</span>
                  )}
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
  'Reçete': <Recipe />,
  'Deneme': <DenemeComponent />,
};

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Üretici Listesi');
  const navigate = useNavigate();
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
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${activeSection === item.name 
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
                {activeSection === item.name && (
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
              
              <div>
                <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{activeSection}</h2>
                <p className="text-sm text-emerald-600 font-medium">Yönetim paneli</p>
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
            {sectionComponents[activeSection]}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin; 