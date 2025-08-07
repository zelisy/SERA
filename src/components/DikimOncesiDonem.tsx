import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import UreticiListesi from './UreticiListesi';
import { dikimOncesiConfig } from '../data/dikimOncesiConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData } from '../utils/firestoreUtils';
import { getProducerProductionAreas } from '../utils/firestoreUtils';
import type { ChecklistSection } from '../types/checklist';
import type { Producer } from '../types/producer';


const DikimOncesiDonem: React.FC = () => {
  const [checklistData, setChecklistData] = useState<ChecklistSection>(dikimOncesiConfig);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [selectedProductionArea, setSelectedProductionArea] = useState<any | null>(null);
  const [productionAreas, setProductionAreas] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'select-production-area' | 'list' | 'checklist'>('select-producer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);


  useEffect(() => {
    if (selectedProducer && selectedProductionArea) {
      loadInitialData();
      loadSavedRecords();
    }
  }, [selectedProducer, selectedProductionArea]);

  const loadInitialData = async () => {
    if (!selectedProducer) return;
    
    try {
      setLoading(true);
      const dataKey = `dikim-oncesi-${selectedProducer.id}`;
      const savedData = await loadChecklistData(dataKey);
      
      if (savedData) {
        // Merge saved data with config to ensure new fields are included
        const mergedData = {
          ...dikimOncesiConfig,
          items: dikimOncesiConfig.items.map(configItem => {
            const savedItem = savedData.items.find(item => item.id === configItem.id);
            return savedItem ? { ...configItem, ...savedItem } : configItem;
          })
        };
        setChecklistData(mergedData);
      } else {
        // Save initial config if no saved data exists
        await saveChecklistData(dataKey, dikimOncesiConfig);
        setChecklistData(dikimOncesiConfig);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRecords = async () => {
    if (!selectedProducer) return;
    
    try {
      // Burada Firestore'dan kayıtlı kayıtları çekebilirsiniz
      // Şimdilik boş array olarak bırakıyorum
      setSavedRecords([]);
    } catch (err) {
      setError('Kayıtlı kayıtlar yüklenemedi');
    }
  };



  const handleProducerSelect = async (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('select-production-area');
    // Üreticiye ait üretim alanlarını Firebase'den çek
    try {
      const areas = await getProducerProductionAreas(producer.id);
      console.log('Firebase productionAreas:', areas);
      setProductionAreas(Array.isArray(areas) ? areas : []);
    } catch (err) {
      console.error('Alanlar çekilemedi:', err);
      setProductionAreas([]);
    }
  };

  // Üretim Alanı Seçimi
  const handleProductionAreaSelect = (area: any) => {
    setSelectedProductionArea(area);
    setCurrentStep('list');
  };

  const handleItemUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>
  ) => {
    if (!selectedProducer) return;

    try {
      // Update local state immediately for better UX
      setChecklistData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, completed, data: data || item.data }
            : item
        )
      }));

      // Update in Firebase with producer-specific key
      const dataKey = `dikim-oncesi-${selectedProducer.id}`;
      await updateChecklistItem(dataKey, itemId, completed, data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
      // Revert local state on error
      await loadInitialData();
    }
  };


  const handleSaveRecord = async () => {
    if (!selectedProducer || !selectedProductionArea) return;

    try {
      if (editingRecord) {
        // Düzenleme modunda - mevcut kaydı güncelle
        const updatedRecord = {
          ...editingRecord,
          checklistData: checklistData,
          completionStats: getCompletionStats(),
          date: new Date().toISOString(),
          productionArea: selectedProductionArea
        };
        setSavedRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
        setEditingRecord(null);
      } else {
        // Yeni kayıt oluştur
        const newRecord = {
          id: Date.now().toString(),
          producerId: selectedProducer.id,
          producerName: `${selectedProducer.firstName} ${selectedProducer.lastName}`,
          date: new Date().toISOString(),
          checklistData: checklistData,
          completionStats: getCompletionStats(),
          productionArea: selectedProductionArea
        };
        setSavedRecords(prev => [...prev, newRecord]);
      }

      // Burada Firestore'a kaydetme işlemi yapılabilir
      setShowForm(false);
      setCurrentStep('list');
      setChecklistData(dikimOncesiConfig); // Reset form
      setError(null);
    } catch (err) {
      setError('Kayıt başarısız');
    }
  };


  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setChecklistData(record.checklistData);
    setSelectedProductionArea(record.productionArea || null);
    setShowForm(true);
    setCurrentStep('checklist');
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      // Burada Firestore'dan silme işlemi yapılabilir
      setSavedRecords(prev => prev.filter(r => r.id !== recordId));
      setError(null);
    } catch (err) {
      setError('Silme işlemi başarısız');
    }
  };

  const getCompletionStats = () => {
    const totalItems = checklistData.items.length;
    const completedItems = checklistData.items.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { totalItems, completedItems, percentage };
  };


  const resetSelection = () => {
    setSelectedProducer(null);
    setSelectedProductionArea(null);
    setCurrentStep('select-producer');
    setChecklistData(dikimOncesiConfig);
    setError(null);
    setSavedRecords([]);
    setEditingRecord(null);
    setShowForm(false);
  };


  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Dikim Öncesi Dönem Kontrolü
            </h1>
            <p className="text-slate-600 text-lg">
              Kontrol işlemlerini başlatmak için önce bir üretici seçin
            </p>
          </div>
          {/* Progress Steps */}
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
                <span className="ml-2">Üretim Alanı Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2">Kontrol Listesi</span>
              </div>
            </div>
          </div>
          {/* Producer Selection */}
          <UreticiListesi 
            selectionMode={true}
            onSelect={handleProducerSelect}
            selectedProducer={selectedProducer}
          />
          {/* Geri Butonu (Varsa ana sayfaya veya üst menüye dönmek için) */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Production Area Selection Step

  if (currentStep === 'select-production-area') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Üretim Alanı Seçimi
            </h1>
            <p className="text-slate-600 text-lg">
              Lütfen kontrol yapılacak üretim alanını seçin
            </p>
          </div>
          {/* Geri Butonu */}
          <div className="mb-4 text-left">
            <button
              onClick={() => setCurrentStep('select-producer')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri
            </button>
          </div>
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2 font-medium">Üretim Alanı Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2">Kontrol Listesi</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            {productionAreas.length === 0 ? (
              <div className="col-span-2 text-center text-slate-600">Bu üreticiye ait üretim alanı bulunamadı.</div>
            ) : (
              productionAreas.map(area => (
                <button
                  key={area.id}
                  onClick={() => handleProductionAreaSelect(area)}
                  className={`px-6 py-4 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-emerald-50 font-semibold transition-colors shadow-lg text-left`}
                >
                  <div className="font-bold text-lg mb-1">{area.urunIsmi || 'Ürün Bilgisi Yok'}</div>
                  <div className="text-sm text-slate-700 mb-1">Seratype: {area.seraType || '-'} | Parsel: {area.parsel || '-'} </div>
                  <div className="text-xs text-slate-500">Ada: {area.ada || '-'} | Tip: {area.siraType || '-'} | Alan ID: {area.id}</div>
                </button>
              ))
            )}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={resetSelection}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Üretici Değiştir
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Records List Step
  if (currentStep === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header with Producer & Production Area Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">
                    {selectedProducer?.gender === 'Erkek' ? '👨' : selectedProducer?.gender === 'Kadın' ? '👩' : '👤'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    Dikim Öncesi Dönem - {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                  <p className="text-slate-600 mt-1">
                    <span className="font-semibold">Üretim Alanı:</span> {selectedProductionArea?.urunIsmi || selectedProductionArea?.id || '-'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingRecord(null);
                    setChecklistData(dikimOncesiConfig);
                    setCurrentStep('checklist');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
                >
                  + Yeni Kayıt Ekle
                </button>
                <button
                  onClick={() => setCurrentStep('select-production-area')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ← Geri
                </button>
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  👤 Üretici Değiştir
                </button>
              </div>
            </div>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          {/* Saved Records List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">📋 Kayıtlı Kontrol Kayıtları</h2>
            {savedRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz kayıt yok</h3>
                <p className="text-slate-600 mb-4">İlk kontrol kaydınızı oluşturmak için "Yeni Kayıt Ekle" butonuna tıklayın.</p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingRecord(null);
                    setChecklistData(dikimOncesiConfig);
                    setCurrentStep('checklist');
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  + İlk Kaydı Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecords.map((record) => {
                  const stats = record.completionStats;
                  return (
                    <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-slate-600">
                          {new Date(record.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>İlerleme</span>
                          <span className="font-semibold">{stats.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stats.percentage === 100 
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                                : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                            }`}
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>Tamamlanan: {stats.completedItems}/{stats.totalItems}</div>
                        <div>Saat: {new Date(record.date).toLocaleTimeString('tr-TR')}</div>
                        <div>Alan: {record.productionArea?.urunIsmi || record.productionArea?.id || '-'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Checklist Step (Form)
  if (showForm) {
    const stats = getCompletionStats();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header with Producer Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">
                    {selectedProducer?.gender === 'Erkek' ? '👨' : selectedProducer?.gender === 'Kadın' ? '👩' : '👤'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    {editingRecord ? 'Kontrol Kaydını Düzenle' : 'Yeni Kontrol Kaydı'} - {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setCurrentStep('list');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ← Listeye Dön
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  İlerleme: {stats.completedItems}/{stats.totalItems} görev tamamlandı
                </h3>
                <p className="text-slate-600 text-sm">
                  {selectedProducer?.firstName} {selectedProducer?.lastName} için kontrol durumu
                </p>
              </div>
              <div className="mt-4 lg:mt-0">
                <span className={`text-2xl lg:text-3xl font-bold ${
                  stats.percentage === 100 ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  %{stats.percentage}
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.percentage === 100 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                    : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            {stats.percentage === 100 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 text-xl">🎉</span>
                  <span className="text-emerald-800 font-medium">
                    Tebrikler! {selectedProducer?.firstName} {selectedProducer?.lastName} için tüm kontroller tamamlandı!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Kontrol listesi yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Checklist Items */}
              <div className="space-y-4">
                {checklistData.items.map(item => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onUpdate={handleItemUpdate}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setCurrentStep('list');
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
                >
                  ❌ İptal
                </button>
                <button
                  onClick={handleSaveRecord}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold hover:from-emerald-600 hover:to-blue-600 shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  💾 {editingRecord ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default DikimOncesiDonem; 