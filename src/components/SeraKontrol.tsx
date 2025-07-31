import { useState, useEffect } from 'react';
import UreticiListesi from './UreticiListesi';
import ChecklistItem from './ChecklistItem';
import MobileHelpText from './MobileHelpText';
import type { Producer } from '../types/producer';
import { seraKontrolConfig } from '../data/seraKontrolConfig';
import type { ChecklistItem as ChecklistItemType } from '../types/checklist';
import { loadChecklistData, saveChecklistData, updateChecklistItem } from '../utils/firestoreUtils';

const SeraKontrol = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'list' | 'checklist'>('select-producer');
  const [checklist, setChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [originalChecklist, setOriginalChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Checklist yüklemesi (üretici seçilince)
  useEffect(() => {
    const loadData = async () => {
      if (!selectedProducer) return;
      setLoading(true);
      setError(null);
      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      try {
        const savedData = await loadChecklistData(dataKey);
        if (savedData) {
          setChecklist(
            seraKontrolConfig.items.map(configItem => {
              const savedItem = savedData.items.find(item => item.id === configItem.id);
              return savedItem ? { ...configItem, ...savedItem } : configItem;
            })
          );
          setOriginalChecklist(
            seraKontrolConfig.items.map(configItem => {
              const savedItem = savedData.items.find(item => item.id === configItem.id);
              return savedItem ? { ...configItem, ...savedItem } : configItem;
            })
          );
          setHistory(savedData.history || []);
        } else {
          await saveChecklistData(dataKey, { ...seraKontrolConfig });
          setChecklist(seraKontrolConfig.items);
          setOriginalChecklist(seraKontrolConfig.items);
          setHistory([]);
        }
      } catch (err) {
        setError('Checklist verisi yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    if (selectedProducer && currentStep === 'checklist') {
      loadData();
    }
  }, [selectedProducer, currentStep]);

  // Kayıtlı kayıtları yükle
  useEffect(() => {
    if (selectedProducer) {
      loadSavedRecords();
    }
  }, [selectedProducer]);

  const loadSavedRecords = async () => {
    if (!selectedProducer) return;
    
    try {
      // Burada Firestore'dan kayıtlı kayıtları çekebilirsiniz
      // Şimdilik history'yi kullanıyoruz
      setSavedRecords(history);
    } catch (err) {
      setError('Kayıtlı kayıtlar yüklenemedi');
    }
  };

  const handleChecklistUpdate = async (
    itemId: string,
    completed: boolean,
    data?: Record<string | number, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>
  ): Promise<void> => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, completed, data } : item
    ));
    if (!selectedProducer) return;
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    try {
      await updateChecklistItem(dataKey, itemId, completed, data);
      setError(null);
    } catch (err) {
      setError('Checklist kaydedilemedi');
    }
  };

  const handleSaveAll = async () => {
    if (!selectedProducer) return;
    setLoading(true);
    setError(null);
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    try {
      if (editingRecord) {
        // Düzenleme modunda - mevcut kaydı güncelle
        const updatedHistory = history.map(record => {
          if (record.date === editingRecord.date) {
            return { ...record, items: checklist, date: new Date().toISOString() };
          }
          return record;
        });
        
        await saveChecklistData(dataKey, { ...seraKontrolConfig, items: checklist, history: updatedHistory });
        setHistory(updatedHistory);
        setSavedRecords(updatedHistory);
        setEditingRecord(null);
      } else {
        // Yeni kayıt oluştur
        const newHistory = [
          ...history,
          { date: new Date().toISOString(), items: checklist }
        ];
        await saveChecklistData(dataKey, { ...seraKontrolConfig, items: checklist, history: newHistory });
        setHistory(newHistory);
        setSavedRecords(newHistory);
      }
      
      setOriginalChecklist(checklist);
      setSaveSuccess(true);
      setShowForm(false);
      setCurrentStep('list');
      // Formu tamamen temizle
      const cleanChecklist = seraKontrolConfig.items.map(item => ({
        ...item,
        completed: false,
        data: {}
      }));
      setChecklist(cleanChecklist);
    } catch (err) {
      setError('Checklist kaydedilemedi');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCancel = () => {
    if (editingRecord) {
      // Düzenleme modunda ise orijinal veriyi geri yükle
      setChecklist(originalChecklist);
    } else {
      // Yeni kayıt modunda ise formu temizle
      const cleanChecklist = seraKontrolConfig.items.map(item => ({
        ...item,
        completed: false,
        data: {}
      }));
      setChecklist(cleanChecklist);
    }
    setError(null);
    setSaveSuccess(false);
  };

  const handleDeleteHistory = async (idx: number) => {
    if (!selectedProducer) return;
    if (!window.confirm('Bu geçmiş kaydı silinsin mi?')) return;
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
    setSavedRecords(newHistory);
    try {
      await saveChecklistData(dataKey, { ...seraKontrolConfig, items: checklist, history: newHistory });
    } catch (err) {
      setError('Geçmiş kaydı silinemedi');
    }
  };

  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setChecklist(record.items);
    setShowForm(true);
    setCurrentStep('checklist');
  };

  const getCompletionStats = () => {
    const totalItems = checklist.length;
    const completedItems = checklist.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { totalItems, completedItems, percentage };
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    // Formu tamamen temizle
    const cleanChecklist = seraKontrolConfig.items.map(item => ({
      ...item,
      completed: false,
      data: {}
    }));
    setChecklist(cleanChecklist);
    setError(null);
    setSavedRecords([]);
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('list');
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Geri Gitme Butonu */}
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Geri Dön</span>
            </button>
          </div>
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Sera Kontrol Sistemi
            </h1>
            <p className="text-slate-600 text-lg">
              Sera kontrol işlemlerini başlatmak için önce bir üretici seçin
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
        </div>
      </div>
    );
  }

  // Records List Step
  if (currentStep === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Geri Gitme Butonu */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('select-producer')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Üretici Seçimine Dön</span>
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
          
          {/* Header with Producer Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🏠</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    Sera Kontrol - {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingRecord(null);
                    // Tamamen temiz bir checklist oluştur
                    const cleanChecklist = seraKontrolConfig.items.map(item => ({
                      ...item,
                      completed: false,
                      data: {}
                    }));
                    setChecklist(cleanChecklist);
                    setCurrentStep('checklist');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
                >
                  + Yeni Kayıt Ekle
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
            <h2 className="text-xl font-bold text-slate-800 mb-6">📋 Kayıtlı Sera Kontrol Kayıtları</h2>
            
            {savedRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz kayıt yok</h3>
                <p className="text-slate-600 mb-4">İlk sera kontrol kaydınızı oluşturmak için "Yeni Kayıt Ekle" butonuna tıklayın.</p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingRecord(null);
                    // Tamamen temiz bir checklist oluştur
                    const cleanChecklist = seraKontrolConfig.items.map(item => ({
                      ...item,
                      completed: false,
                      data: {}
                    }));
                    setChecklist(cleanChecklist);
                    setCurrentStep('checklist');
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  + İlk Kaydı Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecords.map((record, idx) => {
                  const completedCount = record.items.filter((item: any) => item.completed).length;
                  const totalCount = record.items.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
                            onClick={() => handleDeleteHistory(idx)}
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
                          <span className="font-semibold">{percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              percent === 100 
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                                : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>Tamamlanan: {completedCount}/{totalCount}</div>
                        <div>Saat: {new Date(record.date).toLocaleTimeString('tr-TR')}</div>
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
                  <span className="text-white text-xl">🏠</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    {editingRecord ? 'Sera Kontrol Kaydını Düzenle' : 'Yeni Sera Kontrol Kaydı'} - {selectedProducer?.firstName} {selectedProducer?.lastName}
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
                  {selectedProducer?.firstName} {selectedProducer?.lastName} için sera kontrol durumu
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
                    Tebrikler! {selectedProducer?.firstName} {selectedProducer?.lastName} için tüm sera kontrolleri tamamlandı!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600">✅</span>
                <span className="text-emerald-700">Başarıyla kaydedildi!</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Sera kontrol listesi yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Help Text */}
              <MobileHelpText className="mb-4" />
              
              {/* Checklist Items */}
              <div className="space-y-4">
                {checklist.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onUpdate={handleChecklistUpdate}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    handleCancel();
                    setCurrentStep('list');
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold transition-colors"
                  disabled={loading}
                >
                  ❌ İptal
                </button>
                <button
                  onClick={handleSaveAll}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold hover:from-emerald-600 hover:to-blue-600 shadow-lg transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Kaydediliyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>💾</span>
                      <span>{editingRecord ? 'Güncelle' : 'Kaydet'}</span>
                    </div>
                  )}
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

export default SeraKontrol; 