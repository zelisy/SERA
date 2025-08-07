import React, { useState, useEffect, useCallback } from 'react';
import ChecklistItem from './ChecklistItem';
import UreticiListesi from './UreticiListesi';
import PlantControlStep from './PlantControlStep';
import { seraKontrolConfig } from '../data/seraKontrolConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData } from '../utils/firestoreUtils';
import type { ChecklistSection } from '../types/checklist';
import type { Producer } from '../types/producer';

const SeraKontrol: React.FC = () => {
  const [checklistData, setChecklistData] = useState<ChecklistSection>(seraKontrolConfig);
  const [loading, setLoading] = useState(true);
  // Üretim alanları için state
  const [uretimAlanlari, setUretimAlanlari] = useState<any[]>([]);
  // Debug loading state changes
  useEffect(() => {
    console.log('Loading state changed to:', loading);
  }, [loading]);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [selectedUretimAlani, setSelectedUretimAlani] = useState<any | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'list' | 'select-area' | 'hasat-list' | 'hasat-form' | 'checklist' | 'plant-control'>('select-producer');
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Hasat kayıtları state
  const [hasatKayitlari, setHasatKayitlari] = useState<any[]>([]);
  const [hasatLoading, setHasatLoading] = useState(false);
  const [hasatError, setHasatError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProducer) {
      loadSavedRecords();
      loadUretimAlanlari();
      setCurrentStep('select-area');
    }
  }, [selectedProducer]);

  // Üretim alanlarını çek
  const loadUretimAlanlari = async () => {
    if (!selectedProducer) return;
    try {
      const { getUretimAlanlariByProducer } = await import('../utils/firestoreUtils');
      const alanlar = await getUretimAlanlariByProducer(selectedProducer.id);
      setUretimAlanlari(alanlar);
    } catch (err) {
      setUretimAlanlari([]);
    }
  };



  const loadSavedRecords = async () => {
    if (!selectedProducer) return;
    
    try {
      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      const savedData = await loadChecklistData(dataKey);
      if (savedData && savedData.history) {
        setSavedRecords(savedData.history);
      } else {
        setSavedRecords([]);
      }
    } catch (err) {
      setError('Kayıtlı kayıtlar yüklenemedi');
      setSavedRecords([]);
    }
  };

  const loadInitialData = useCallback(async () => {
    if (!selectedProducer) return;
    
    try {
      setLoading(true);
      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      const savedData = await loadChecklistData(dataKey);
      
      if (savedData) {
        const mergedData = {
          ...seraKontrolConfig,
          items: seraKontrolConfig.items.map(configItem => {
            const savedItem = savedData.items.find(item => item.id === configItem.id);
            return savedItem ? { ...configItem, ...savedItem } : configItem;
          })
        };
        setChecklistData(mergedData);
      } else {
        await saveChecklistData(dataKey, seraKontrolConfig);
        setChecklistData(seraKontrolConfig);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [selectedProducer]);

  const handleItemUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>
  ) => {
    if (!selectedProducer) return;
    
    // Skip checkbox update for plant control step - it's handled by the button
    if (itemId === 'kontrol-bitkileri-kontrolu') {
      return;
    }
    
    try {
      setChecklistData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, completed, data: data || item.data || {} }
            : item
        )
      }));

      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      await updateChecklistItem(dataKey, itemId, completed, data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
      // Only reload data if we're not editing a record
      if (!editingRecord) {
        await loadInitialData();
      }
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedProducer) return;
    
    setLoading(true);
    setError(null);
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    
    try {
      const currentDate = new Date();
      const newRecord = {
        id: Date.now().toString(),
        date: currentDate.toISOString(),
        dateFormatted: currentDate.toLocaleDateString('tr-TR'),
        timeFormatted: currentDate.toLocaleTimeString('tr-TR'),
        items: checklistData.items,
        producerId: selectedProducer.id,
        producerName: `${selectedProducer.firstName} ${selectedProducer.lastName}`
      };

      const updatedHistory = editingRecord 
        ? savedRecords.map(record => record.id === editingRecord.id ? newRecord : record)
        : [...savedRecords, newRecord];

      await saveChecklistData(dataKey, {
        ...seraKontrolConfig,
        items: checklistData.items,
        history: updatedHistory
      });

      setSavedRecords(updatedHistory);
      setEditingRecord(null);
      setSaveSuccess(true);
      setCurrentStep('list');
      
      // Formu tamamen temizle
      const cleanConfig = {
        ...seraKontrolConfig,
        items: seraKontrolConfig.items.map(item => ({
          ...item,
          completed: false,
          data: {}
        }))
      };
      setChecklistData(cleanConfig);
      setExpandedSections(new Set());
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError('Kayıt kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: any) => {
    console.log('handleEditRecord called with:', record);
    setEditingRecord(record);
    setChecklistData({
      ...seraKontrolConfig,
      items: record.items
    });
    setCurrentStep('checklist');
    setLoading(false); // Ensure loading is false when editing
    setError(null); // Clear any previous errors
    console.log('handleEditRecord completed, loading should be false');
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!selectedProducer || !window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const updatedHistory = savedRecords.filter(record => record.id !== recordId);
      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      
      await saveChecklistData(dataKey, {
        ...seraKontrolConfig,
        history: updatedHistory
      });
      
      setSavedRecords(updatedHistory);
    } catch (err) {
      setError('Kayıt silinemedi');
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getCompletionStats = () => {
    const totalItems = checklistData.items.length;
    const completedItems = checklistData.items.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { totalItems, completedItems, percentage };
  };

  const getCategoryStats = () => {
    const categories = {
      preparation: checklistData.items.slice(0, 4),
      analysis: checklistData.items.slice(4, 6),
      control: checklistData.items.slice(6, 9),
      documentation: checklistData.items.slice(9, 11)
    };

    return Object.entries(categories).map(([key, items]) => ({
      key,
      name: getCategoryName(key),
      completed: items.filter(item => item.completed).length,
      total: items.length,
      percentage: Math.round((items.filter(item => item.completed).length / items.length) * 100)
    }));
  };

  const getCategoryName = (key: string) => {
    const names = {
      preparation: 'Hazırlık',
      analysis: 'Analiz & Ölçüm',
      control: 'Kontrol & Mücadele',
      documentation: 'Belgelendirme'
    };
    return names[key as keyof typeof names] || key;
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('select-area');
  };

  // Üretim alanı seçimi
  const handleUretimAlaniSelect = (area: any) => {
    setSelectedUretimAlani(area);
    fetchHasatKayitlari(area.id);
    setCurrentStep('hasat-list');
  };

  // Seçilen üretim alanına ait hasat kayıtlarını çek
  const fetchHasatKayitlari = async (uretimAlaniId: string) => {
    setHasatLoading(true);
    setHasatError(null);
    try {
      const { getHasatBilgileriByUretimAlani } = await import('../utils/firestoreUtils');
      const kayitlar = await getHasatBilgileriByUretimAlani(uretimAlaniId);
      setHasatKayitlari(kayitlar);
    } catch (err) {
      setHasatError('Hasat kayıtları yüklenemedi');
      setHasatKayitlari([]);
    } finally {
      setHasatLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setChecklistData(seraKontrolConfig);
    setExpandedSections(new Set());
    setError(null);
    setSavedRecords([]);
    setEditingRecord(null);
  };

  const startNewRecord = () => {
    console.log('startNewRecord called');
    setEditingRecord(null);
    // Reset to completely clean config - no previous data
    const cleanConfig = {
      ...seraKontrolConfig,
      items: seraKontrolConfig.items.map(item => ({
        ...item,
        completed: false,
        data: {} // Boş obje kullan
      }))
    };
    setChecklistData(cleanConfig);
    setExpandedSections(new Set());
    setCurrentStep('checklist');
    // Clear any error messages and loading state
    setError(null);
    setLoading(false);
    console.log('startNewRecord completed, currentStep should be checklist');
  };

  const handlePlantControlComplete = async (data: { dekar: number; plants: any[] }) => {
    if (!selectedProducer) return;
    
    try {
      // Update the checklist item with plant control data
      const updatedItems = checklistData.items.map(item => {
        if (item.id === 'kontrol-bitkileri-kontrolu') {
          return {
            ...item,
            completed: true,
            data: {
              ...item.data,
              dekar: data.dekar,
              plants: data.plants
            }
          };
        }
        return item;
      });
      
      setChecklistData(prev => ({ ...prev, items: updatedItems }));
      
      // Save to Firestore
      const dataKey = `sera-kontrol-${selectedProducer.id}`;
      const plantControlItem = updatedItems.find(item => item.id === 'kontrol-bitkileri-kontrolu');
      if (plantControlItem) {
        await updateChecklistItem(dataKey, plantControlItem.id, true, plantControlItem.data);
      }
      
      setCurrentStep('checklist');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bitki kontrolü kaydedilemedi');
    }
  };

  const handlePlantControlBack = () => {
    setCurrentStep('checklist');
  };

  // useEffect for loading initial data when editing
  useEffect(() => {
    if (selectedProducer && currentStep === 'checklist' && editingRecord) {
      console.log('useEffect triggered for editing record, setting loading to false');
      // When editing, we don't need to load from Firestore since we already have the data
      // Just set loading to false to show the form
      setLoading(false);
    }
  }, [currentStep, editingRecord, selectedProducer?.id]);

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Sera Kontrol Sistemi</h1>
            <p className="text-slate-600 text-lg">Sera kontrol işlemlerini başlatmak için önce bir üretici seçin</p>
          </div>
          <UreticiListesi selectionMode={true} onSelect={handleProducerSelect} selectedProducer={selectedProducer} />
        </div>
      </div>
    );
  }

  // Üretim Alanı Seçim Step
  if (currentStep === 'select-area') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Üretim Alanı Seç</h2>
            <p className="text-slate-600 text-lg">Lütfen üreticiye ait bir üretim alanı seçin</p>
          </div>
          {uretimAlanlari.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏭</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Üretim alanı bulunamadı</h3>
              <p className="text-gray-600 mb-4">Bu üreticiye ait üretim alanı yok.</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 text-center text-lg font-semibold text-emerald-700">Üretim Alanı Listesi</div>
              <ul className="space-y-4">
                {uretimAlanlari.map((area) => (
                  <li key={area.id}>
                    <button
                      className={`w-full text-left border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedUretimAlani?.id === area.id ? 'bg-emerald-50 border-emerald-400' : 'bg-white'}`}
                      onClick={() => handleUretimAlaniSelect(area)}
                    >
                      <div className="font-bold text-lg text-emerald-700 mb-1">{area.urunIsmi} - {area.cesitIsmi}</div>
                      <div className="text-sm text-gray-600">Alan: {area.alanM2} m²</div>
                      <div className="text-xs text-gray-500">Dikim Tarihi: {area.dikimTarihi}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hasat Listesi Step
  if (currentStep === 'hasat-list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hasat Kayıtları</h2>
            <p className="text-slate-600 text-lg">Seçilen üretim alanına ait hasat kayıtları</p>
          </div>
          <div className="mb-4">
            <button onClick={() => setCurrentStep('select-area')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">← Üretim Alanı Değiştir</button>
            <button onClick={() => setCurrentStep('hasat-form')} className="ml-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600">+ Hasat Kaydı Ekle</button>
          </div>
          {hasatLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : hasatError ? (
            <div className="text-center py-8 text-red-600">{hasatError}</div>
          ) : hasatKayitlari.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz hasat kaydı yok</h3>
              <p className="text-gray-600 mb-4">İlk hasat kaydınızı oluşturmak için "Hasat Kaydı Ekle" butonuna tıklayın.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hasat Tarihi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sezon</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kasa Adeti</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kg</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Fiyat</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kazanç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hasatKayitlari.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">{new Date(record.dikimTarihi).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3">{record.donem}</td>
                      <td className="px-4 py-3">{record.kasaAdeti ? String(record.kasaAdeti) : ''}</td>
                      <td className="px-4 py-3">{(Number(record.tonajDa) * Number(record.kacDa) * 1000).toLocaleString()} kg</td>
                      <td className="px-4 py-3">₺{record.ortalamaFiyat ? String(record.ortalamaFiyat) : ''}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₺{record.kazanc ? Number(record.kazanc).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hasat Form Step
  if (currentStep === 'hasat-form') {
    // Hasat formu için state
    const [form, setForm] = useState({
      dikimTarihi: '',
      donem: '',
      kasaAdeti: '',
      tonajDa: '',
      kacDa: '',
      ortalamaFiyat: '',
      kazanc: ''
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form submit handler
    const handleHasatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setFormLoading(true);
      if (!selectedUretimAlani) {
        setFormError('Üretim alanı seçilmedi!');
        setFormLoading(false);
        return;
      }
      try {
        const { addHasatBilgisi } = await import('../utils/firestoreUtils');
        // Hesaplama
        const kg = Number(form.tonajDa) * Number(form.kacDa) * 1000;
        const kazanc = kg * Number(form.ortalamaFiyat);
        const newRecord = {
          ...form,
          id: Date.now().toString(),
          dikimTarihi: form.dikimTarihi,
          uretimAlaniId: selectedUretimAlani.id,
          kg,
          kazanc,
        };
        await addHasatBilgisi(selectedUretimAlani.id, newRecord);
        setFormLoading(false);
        // Kayıt sonrası listeyi güncelle
        await fetchHasatKayitlari(selectedUretimAlani.id);
        setCurrentStep('hasat-list');
      } catch (err) {
        setFormError('Kayıt eklenemedi');
        setFormLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hasat Kaydı Ekle</h2>
            <p className="text-slate-600 text-lg">Seçilen üretim alanına yeni hasat kaydı ekleyin</p>
          </div>
          <form className="max-w-xl mx-auto space-y-4" onSubmit={handleHasatSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hasat Tarihi</label>
              <input type="date" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.dikimTarihi} onChange={e => setForm(f => ({ ...f, dikimTarihi: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sezon/Dönem</label>
              <input type="text" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.donem} onChange={e => setForm(f => ({ ...f, donem: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kasa Adeti</label>
              <input type="number" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.kasaAdeti} onChange={e => setForm(f => ({ ...f, kasaAdeti: e.target.value }))} required min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tonaj (da başına)</label>
              <input type="number" step="0.01" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.tonajDa} onChange={e => setForm(f => ({ ...f, tonajDa: e.target.value }))} required min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kaç Da</label>
              <input type="number" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.kacDa} onChange={e => setForm(f => ({ ...f, kacDa: e.target.value }))} required min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ortalama Fiyat (₺/kg)</label>
              <input type="number" step="0.01" className="mt-1 block w-full border rounded-xl px-3 py-2" value={form.ortalamaFiyat} onChange={e => setForm(f => ({ ...f, ortalamaFiyat: e.target.value }))} required min={0} />
            </div>
            {formError && <div className="text-red-600 text-center">{formError}</div>}
            <div className="flex gap-4 justify-center mt-6">
              <button type="button" onClick={() => setCurrentStep('hasat-list')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">← Kayıt Listesine Dön</button>
              <button type="submit" disabled={formLoading} className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50">
                {formLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Records List Step
  if (currentStep === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Producer Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🏠</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                    Sera Kontrol - {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-gray-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startNewRecord}
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

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center">
                <span className="text-emerald-600 mr-2">✅</span>
                <span className="text-emerald-700">Kayıt başarıyla kaydedildi!</span>
              </div>
            )}
          </div>

          {/* Saved Records List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📋 Kayıtlı Sera Kontrol Kayıtları</h2>
            
            {savedRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz kayıt yok</h3>
                <p className="text-gray-600 mb-4">İlk sera kontrol kaydınızı oluşturmak için "Yeni Kayıt Ekle" butonuna tıklayın.</p>
                <button
                  onClick={startNewRecord}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  + İlk Kaydı Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecords.map((record) => {
                  const completedCount = record.items.filter((item: any) => item.completed).length;
                  const totalCount = record.items.length;
                  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  
                  return (
                    <div key={record.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          {record.dateFormatted || new Date(record.date).toLocaleDateString('tr-TR')}
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
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Tamamlanan: {completedCount}/{totalCount}</div>
                        <div>Saat: {record.timeFormatted || new Date(record.date).toLocaleTimeString('tr-TR')}</div>
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

  const stats = getCompletionStats();
  const categoryStats = getCategoryStats();

  // Plant Control Step
  if (currentStep === 'plant-control') {
    // Get existing plant control data if editing
    const plantControlItem = checklistData.items.find(item => item.id === 'kontrol-bitkileri-kontrolu');
    const initialPlantData = plantControlItem?.data?.dekar && plantControlItem?.data?.plants 
      ? { 
          dekar: Number(plantControlItem.data.dekar), 
          plants: plantControlItem.data.plants as any[] 
        }
      : undefined;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mb-4 flex justify-start">
            <button
              onClick={handlePlantControlBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri Dön
            </button>
          </div>
          <PlantControlStep
            onComplete={handlePlantControlComplete}
            onBack={handlePlantControlBack}
            initialData={initialPlantData}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('Loading state is true, showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-green-200 rounded-lg w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Producer Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏠</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                  {editingRecord ? 'Sera Kontrol Kaydını Düzenle' : 'Yeni Sera Kontrol Kaydı'} - {selectedProducer?.firstName} {selectedProducer?.lastName}
                </h1>
                {!editingRecord && (
                  <p className="text-gray-600 text-sm mt-1">
                    Tarih: {new Date().toLocaleDateString('tr-TR')} - Saat: {new Date().toLocaleTimeString('tr-TR')}
                  </p>
                )}
                <p className="text-gray-600">
                  TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentStep('list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                ← Listeye Dön
              </button>
            </div>
          </div>
          
          {/* Main Progress */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Genel İlerleme</h2>
                <p className="text-green-100">
                  {stats.completedItems}/{stats.totalItems} görev tamamlandı
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold">{stats.percentage}%</div>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryStats.map((category) => (
              <div key={category.key} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {category.name}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {category.completed}/{category.total}
                </div>
                <div className="text-xs text-gray-500">
                  %{category.percentage}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Checklist Sections */}
        <div className="grid gap-6">
          {checklistData.items.map((item, index) => {
            const isExpanded = expandedSections.has(item.id);
            const categoryIndex = Math.floor(index / 3);
            const categoryColors = [
              'from-blue-500 to-purple-500',
              'from-green-500 to-teal-500', 
              'from-orange-500 to-red-500',
              'from-purple-500 to-pink-500'
            ];
            
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div 
                  className={`bg-gradient-to-r ${categoryColors[categoryIndex % categoryColors.length]} p-4 md:p-6 cursor-pointer`}
                  onClick={() => toggleSection(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${item.completed ? 'bg-white' : 'bg-transparent'}`}>
                        {item.completed && <span className="text-green-500 text-sm">✓</span>}
                      </div>
                      <h3 className="text-white font-semibold text-lg">
                        {item.label}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.completed && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                          Tamamlandı
                        </span>
                      )}
                      <button className="text-white">
                        <svg 
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-6">
                    <ChecklistItem
                      item={item}
                      onUpdate={handleItemUpdate}
                      onPlantControlClick={() => setCurrentStep('plant-control')}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Badge */}
        {stats.percentage === 100 && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 text-center text-white shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Tebrikler!
            </h2>
            <p className="text-lg opacity-90">
              {selectedProducer?.firstName} {selectedProducer?.lastName} için sera kontrol detaylı kontrolleri başarıyla tamamlandı!
            </p>
          </div>
        )}

        {/* Save Button at Bottom */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('list')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Listeye Dön
            </button>
            <button
              onClick={handleSaveRecord}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>💾</span>
                  <span>{editingRecord ? 'Güncelle' : 'Kaydet'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeraKontrol;