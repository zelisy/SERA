import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import UreticiListesi from './UreticiListesi';
import { dikimOncesiConfig } from '../data/dikimOncesiConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData } from '../utils/firestoreUtils';
import type { ChecklistSection } from '../types/checklist';
import type { Producer } from '../types/producer';

const DikimOncesiDonem: React.FC = () => {
  const [checklistData, setChecklistData] = useState<ChecklistSection>(dikimOncesiConfig);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'checklist'>('select-producer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProducer) {
      loadInitialData();
    }
  }, [selectedProducer]);

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

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('checklist');
  };

  const handleItemUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[]>
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

  const getCompletionStats = () => {
    const totalItems = checklistData.items.length;
    const completedItems = checklistData.items.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { totalItems, completedItems, percentage };
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setChecklistData(dikimOncesiConfig);
    setError(null);
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
                  Dikim Öncesi Dönem - {selectedProducer?.firstName} {selectedProducer?.lastName}
                </h1>
                <p className="text-slate-600">
                  TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
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
          /* Checklist Items */
          <div className="space-y-4">
            {checklistData.items.map(item => (
              <ChecklistItem
                key={item.id}
                item={item}
                onUpdate={handleItemUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DikimOncesiDonem; 