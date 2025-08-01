import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import type { Producer } from '../types/producer';

interface UreticiListesiProps {
  selectionMode?: boolean;
  onSelect?: (producer: Producer) => void;
  selectedProducer?: Producer | null;
}

const UreticiListesi: React.FC<UreticiListesiProps> = ({ 
  selectionMode = false, 
  onSelect, 
  selectedProducer 
}) => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'firstName' | 'registerDate'>('firstName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [newProducer, setNewProducer] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    address: '',
    gender: '',
    experienceYear: '',
    registerDate: '',
    birthDate: '' // yeni alan
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'producers'), orderBy(sortKey, sortDir));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducers(
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producer))
      );
      setLoading(false);
    }, () => {
      setError('Veriler alınamadı.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sortKey, sortDir]);

  const handleAdd = async () => {
    if (!newProducer.firstName || !newProducer.lastName || !newProducer.tcNo || !newProducer.phone || !newProducer.address || !newProducer.gender || !newProducer.experienceYear || !newProducer.registerDate || !newProducer.birthDate) return;
    try {
      await addDoc(collection(db, 'producers'), newProducer);
      setNewProducer({ firstName: '', lastName: '', tcNo: '', phone: '', address: '', gender: '', experienceYear: '', registerDate: '', birthDate: '' });
      setShowAdd(false);
    } catch {
      setError('Ekleme başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu üreticiyi silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'producers', id));
    } catch {
      setError('Silme başarısız.');
    }
  };

  const handleEdit = (producer: Producer) => {
    setEditingProducer(producer);
    setNewProducer({
      firstName: producer.firstName,
      lastName: producer.lastName,
      tcNo: producer.tcNo,
      phone: producer.phone,
      address: producer.address,
      gender: producer.gender,
      experienceYear: producer.experienceYear,
      registerDate: producer.registerDate,
      birthDate: producer.birthDate || ''
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!editingProducer || !newProducer.firstName || !newProducer.lastName || !newProducer.tcNo || !newProducer.phone || !newProducer.address || !newProducer.gender || !newProducer.experienceYear || !newProducer.registerDate || !newProducer.birthDate) return;
    try {
      await updateDoc(doc(db, 'producers', editingProducer.id), newProducer);
      setNewProducer({ firstName: '', lastName: '', tcNo: '', phone: '', address: '', gender: '', experienceYear: '', registerDate: '', birthDate: '' });
      setShowEdit(false);
      setEditingProducer(null);
    } catch {
      setError('Güncelleme başarısız.');
    }
  };

  const filtered = producers.filter(u =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.tcNo.includes(search)
  );

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'Erkek': return '👨';
      case 'Kadın': return '👩';
      default: return '👤';
    }
  };



  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {selectionMode ? 'Üretici Seçin' : 'Üretici Listesi'}
          </h1>
          <p className="text-slate-600 mt-1">
            {selectionMode ? 'İşlem yapmak için bir üretici seçin' : 'Kayıtlı üreticiler ve bilgileri'}
          </p>
          {/* Toplam üretici sayısı */}
          {!selectionMode && (
            <p className="text-emerald-700 font-semibold mt-2">Toplam Üretici: {producers.length}</p>
          )}
        </div>
        
        {!selectionMode && (
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 lg:mt-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="mr-2">👤</span>
            Üretici Ekle
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ad, soyad, telefon veya TC ile ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={sortKey} 
              onChange={e => setSortKey(e.target.value as 'firstName' | 'registerDate')}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="firstName">İsme Göre</option>
              <option value="registerDate">Kayıt Tarihine Göre</option>
            </select>
            
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {sortDir === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>

            {/* View Mode Toggle - Hide on mobile, show cards by default */}
            <div className="hidden lg:flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-3 transition-colors ${viewMode === 'table' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-gray-50'}`}
              >
                📋 Tablo
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-3 transition-colors ${viewMode === 'cards' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-gray-50'}`}
              >
                📱 Kart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Producer Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Yeni Üretici Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Ad"
              value={newProducer.firstName}
              onChange={e => setNewProducer({ ...newProducer, firstName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Soyad"
              value={newProducer.lastName}
              onChange={e => setNewProducer({ ...newProducer, lastName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="TC Kimlik No"
              value={newProducer.tcNo}
              onChange={e => setNewProducer({ ...newProducer, tcNo: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              maxLength={11}
            />
            <input
              type="text"
              placeholder="Telefon"
              value={newProducer.phone}
              onChange={e => setNewProducer({ ...newProducer, phone: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Adres"
              value={newProducer.address}
              onChange={e => setNewProducer({ ...newProducer, address: e.target.value })}
              className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <select
              value={newProducer.gender}
              onChange={e => setNewProducer({ ...newProducer, gender: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Cinsiyet Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="Diğer">Diğer</option>
            </select>
            <input
              type="number"
              placeholder="Meslekte Yıl"
              value={newProducer.experienceYear}
              onChange={e => setNewProducer({ ...newProducer, experienceYear: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              min={0}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sisteme Kayıt Tarihi
              </label>
              <input
                type="date"
                value={newProducer.registerDate}
                onChange={e => setNewProducer({ ...newProducer, registerDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doğum Tarihi
              </label>
              <input
                type="date"
                value={newProducer.birthDate || ''}
                onChange={e => setNewProducer({ ...newProducer, birthDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleAdd}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            >
              💾 Kaydet
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            >
              ❌ İptal
            </button>
          </div>
        </div>
      )}

      {/* Edit Producer Form */}
      {showEdit && editingProducer && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Üretici Düzenle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Ad"
              value={newProducer.firstName}
              onChange={e => setNewProducer({ ...newProducer, firstName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Soyad"
              value={newProducer.lastName}
              onChange={e => setNewProducer({ ...newProducer, lastName: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="TC Kimlik No"
              value={newProducer.tcNo}
              onChange={e => setNewProducer({ ...newProducer, tcNo: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              maxLength={11}
            />
            <input
              type="text"
              placeholder="Telefon"
              value={newProducer.phone}
              onChange={e => setNewProducer({ ...newProducer, phone: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Adres"
              value={newProducer.address}
              onChange={e => setNewProducer({ ...newProducer, address: e.target.value })}
              className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            <select
              value={newProducer.gender}
              onChange={e => setNewProducer({ ...newProducer, gender: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Cinsiyet Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="Diğer">Diğer</option>
            </select>
            <input
              type="number"
              placeholder="Meslekte Yıl"
              value={newProducer.experienceYear}
              onChange={e => setNewProducer({ ...newProducer, experienceYear: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              min={0}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sisteme Kayıt Tarihi
              </label>
              <input
                type="date"
                value={newProducer.registerDate}
                onChange={e => setNewProducer({ ...newProducer, registerDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doğum Tarihi
              </label>
              <input
                type="date"
                value={newProducer.birthDate || ''}
                onChange={e => setNewProducer({ ...newProducer, birthDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            >
              ✅ Güncelle
            </button>
            <button
              onClick={() => setShowEdit(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            >
              ❌ İptal
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Üreticiler yükleniyor...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Always Cards, Desktop: Table or Cards based on viewMode */}
          <div className="lg:hidden">
            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map(producer => (
                <div
                  key={producer.id}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    selectionMode ? 'cursor-pointer' : ''
                  } ${
                    selectedProducer?.id === producer.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                  }`}
                  onClick={() => selectionMode && onSelect && onSelect(producer)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">{getGenderIcon(producer.gender)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {producer.firstName} {producer.lastName}
                        </h3>
                        <p className="text-slate-600 text-sm">TC: {producer.tcNo}</p>
                      </div>
                    </div>
                    {!selectionMode && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(producer);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(producer.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">📱</span>
                      <span className="text-slate-700 font-medium">{producer.phone}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">📍</span>
                      <span className="text-slate-700 text-sm leading-relaxed">{producer.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-slate-500 text-xs">Deneyim</p>
                        <p className="font-bold text-slate-800">{producer.experienceYear} yıl</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 text-xs">Kayıt Tarihi</p>
                        <p className="font-bold text-slate-800">
                          {new Date(producer.registerDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectionMode && selectedProducer?.id === producer.id && (
                    <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-600">✅</span>
                        <span className="text-emerald-800 font-medium text-sm">Seçildi</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            {viewMode === 'cards' ? (
              /* Desktop Cards View */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(producer => (
                  <div
                    key={producer.id}
                    className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      selectionMode ? 'cursor-pointer' : ''
                    } ${
                      selectedProducer?.id === producer.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                    }`}
                    onClick={() => selectionMode && onSelect && onSelect(producer)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xl">{getGenderIcon(producer.gender)}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {producer.firstName} {producer.lastName}
                          </h3>
                          <p className="text-slate-600 text-sm">TC: {producer.tcNo}</p>
                        </div>
                      </div>
                      {!selectionMode && (
                        <button
                          onClick={() => handleEdit(producer)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500">📱</span>
                        <span className="text-slate-700 font-medium">{producer.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">📍</span>
                        <span className="text-slate-700 text-sm leading-relaxed">{producer.address}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-slate-500 text-xs">Deneyim</p>
                          <p className="font-bold text-slate-800">{producer.experienceYear} yıl</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500 text-xs">Kayıt Tarihi</p>
                          <p className="font-bold text-slate-800">
                            {new Date(producer.registerDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectionMode && selectedProducer?.id === producer.id && (
                      <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-600">✅</span>
                          <span className="text-emerald-800 font-medium text-sm">Seçildi</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ad Soyad</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">TC</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Telefon</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Adres</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cinsiyet</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Deneyim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kayıt Tarihi</th>
                        {!selectionMode && <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">İşlem</th>}
                        {selectionMode && <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Seç</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map(producer => (
                        <tr 
                          key={producer.id} 
                          className={`hover:bg-slate-50 transition-colors ${
                            selectedProducer?.id === producer.id ? 'bg-emerald-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getGenderIcon(producer.gender)}</span>
                              <span className="font-medium text-slate-800">
                                {producer.firstName} {producer.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{producer.tcNo}</td>
                          <td className="px-6 py-4 text-slate-600">{producer.phone}</td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{producer.address}</td>
                          <td className="px-6 py-4 text-slate-600">{producer.gender}</td>
                          <td className="px-6 py-4 text-slate-600">{producer.experienceYear} yıl</td>
                          <td className="px-6 py-4 text-slate-600">
                            {new Date(producer.registerDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {selectionMode ? (
                              <button
                                onClick={() => onSelect && onSelect(producer)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  selectedProducer?.id === producer.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {selectedProducer?.id === producer.id ? '✅ Seçildi' : 'Seç'}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(producer)}
                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Düzenle"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(producer.id)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Sil"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <span className="text-6xl mb-4 block">👥</span>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Üretici bulunamadı</h3>
                <p className="text-slate-600">Arama kriterlerinize uygun üretici bulunmuyor.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UreticiListesi; 