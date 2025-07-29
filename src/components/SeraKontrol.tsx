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
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'checklist'>('select-producer');
  const [checklist, setChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [originalChecklist, setOriginalChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);

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

  const handleChecklistUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>
  ) => {
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
      const newHistory = [
        ...history,
        { date: new Date().toISOString(), items: checklist }
      ];
      await saveChecklistData(dataKey, { ...seraKontrolConfig, items: checklist, history: newHistory });
      setOriginalChecklist(checklist);
      setHistory(newHistory);
      setSaveSuccess(true);
    } catch (err) {
      setError('Checklist kaydedilemedi');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCancel = () => {
    setChecklist(originalChecklist);
    setError(null);
    setSaveSuccess(false);
  };

  const handleDeleteHistory = async (idx: number) => {
    if (!selectedProducer) return;
    if (!window.confirm('Bu geçmiş kaydı silinsin mi?')) return;
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
    setSelectedHistoryIdx(null);
    try {
      await saveChecklistData(dataKey, { ...seraKontrolConfig, items: checklist, history: newHistory });
    } catch (err) {
      setError('Geçmiş kaydı silinemedi');
    }
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
    setChecklist(seraKontrolConfig.items);
    setError(null);
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('checklist');
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
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

  // Checklist Step
  if (currentStep === 'checklist' && selectedProducer) {
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
                    Sera Kontrol - {selectedProducer.firstName} {selectedProducer.lastName}
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer.tcNo} | Tel: {selectedProducer.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  👤 Üretici Değiştir
                </button>
                
                {/* Progress Steps - Mobile */}
                <div className="flex items-center text-sm">
                  <div className="flex items-center text-emerald-600">
                    <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="ml-2 hidden sm:inline">Üretici Seçildi</span>
                  </div>
                  <div className="flex-1 mx-3 h-0.5 bg-emerald-200 rounded"></div>
                  <div className="flex items-center text-emerald-600">
                    <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <span className="ml-2 hidden sm:inline">Kontrol</span>
                  </div>
                </div>
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
                  {selectedProducer.firstName} {selectedProducer.lastName} için sera kontrol durumu
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
                    Tebrikler! {selectedProducer.firstName} {selectedProducer.lastName} için tüm sera kontrolleri tamamlandı!
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
                  onClick={handleCancel}
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
                      <span>Kaydet</span>
                    </div>
                  )}
                </button>
              </div>

              {/* History Section */}
              {history.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">📋 Geçmiş Kayıtlar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {history.map((h, idx) => {
                      const completedCount = h.items.filter((item: any) => item.completed).length;
                      const totalCount = h.items.length;
                      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      
                      return (
                        <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => setSelectedHistoryIdx(idx)}
                              className={`text-sm font-medium transition-colors ${
                                selectedHistoryIdx === idx 
                                  ? 'text-emerald-600' 
                                  : 'text-slate-600 hover:text-slate-800'
                              }`}
                            >
                              {new Date(h.date).toLocaleDateString('tr-TR')}
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(idx)}
                              className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xs"
                              title="Kaydı Sil"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(h.date).toLocaleTimeString('tr-TR')}
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>İlerleme</span>
                              <span className="font-semibold">{percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-emerald-500 h-1 rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedHistoryIdx !== null && history[selectedHistoryIdx] && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="font-semibold text-slate-700 mb-4">
                        {new Date(history[selectedHistoryIdx].date).toLocaleString('tr-TR')} - Detaylar
                      </h3>
                      <div className="space-y-4">
                        {history[selectedHistoryIdx].items.map((item: any) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                item.completed ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}>
                                {item.completed && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </span>
                              <span className={`text-sm font-semibold ${
                                item.completed ? 'text-emerald-700' : 'text-gray-600'
                              }`}>
                                {item.label}
                              </span>
                            </div>
                            
                            {/* Detay bilgileri göster */}
                            {item.data && Object.keys(item.data).length > 0 && (
                              <div className="ml-6 space-y-2">
                                {Object.entries(item.data).map(([key, value]) => {
                                  // Pest control ve development stage için özel gösterim
                                  if (typeof value === 'object' && value !== null && 'selected' in value) {
                                    const selectedValue = value as { selected: boolean; photo?: string; note?: string };
                                    if (selectedValue.selected) {
                                      return (
                                        <div key={key} className="flex items-center space-x-2 text-sm text-emerald-600">
                                          <span>✓</span>
                                          <span>Seçildi</span>
                                          {selectedValue.photo && (
                                            <span className="text-blue-600">(Fotoğraf yüklendi)</span>
                                          )}
                                          {selectedValue.note && (
                                            <span className="text-gray-600">- {selectedValue.note}</span>
                                          )}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }
                                  
                                  // Boolean değerler için
                                  if (typeof value === 'boolean') {
                                    return (
                                      <div key={key} className="flex items-center space-x-2 text-sm">
                                        <span className={value ? 'text-emerald-600' : 'text-gray-400'}>
                                          {value ? '✓' : '✗'}
                                        </span>
                                        <span className={value ? 'text-emerald-700' : 'text-gray-500'}>
                                          {value ? 'Evet' : 'Hayır'}
                                        </span>
                                      </div>
                                    );
                                  }
                                  
                                  // String değerler için
                                  if (typeof value === 'string' && value.trim() !== '') {
                                    return (
                                      <div key={key} className="text-sm text-gray-600">
                                        <span className="font-medium">{key}:</span> {value}
                                      </div>
                                    );
                                  }
                                  
                                  // Number değerler için
                                  if (typeof value === 'number') {
                                    return (
                                      <div key={key} className="text-sm text-gray-600">
                                        <span className="font-medium">{key}:</span> {value}
                                      </div>
                                    );
                                  }
                                  
                                  // Array değerler için (çoklu fotoğraflar)
                                  if (Array.isArray(value) && value.length > 0) {
                                    return (
                                      <div key={key} className="text-sm text-gray-600">
                                        <span className="font-medium">{key}:</span> {value.length} fotoğraf yüklendi
                                      </div>
                                    );
                                  }
                                  
                                  return null;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default SeraKontrol; 