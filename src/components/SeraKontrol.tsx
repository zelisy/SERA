import React, { useState, useEffect, useCallback } from 'react';
import ChecklistItem from './ChecklistItem';
import UreticiListesi from './UreticiListesi';
import PlantControlStep from './PlantControlStep';
import { seraKontrolConfig } from '../data/seraKontrolConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData, saveSeraKontrolRecord, getSeraKontrolRecordsByUretimAlani, updateSeraKontrolRecord, deleteSeraKontrolRecord } from '../utils/firestoreUtils';
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



  // Removed unused loadSavedRecords function

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
    if (!selectedProducer || !selectedUretimAlani) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date();
      if (editingRecord && editingRecord.id) {
        // Mevcut kaydı güncelle
        await updateSeraKontrolRecord(editingRecord.id, {
          items: checklistData.items,
        });

        // Local state'i güncelle (tarihi koru)
        const locallyUpdated = savedRecords.map(record =>
          record.id === editingRecord.id
            ? { ...record, items: checklistData.items, updatedAt: currentDate.toISOString() }
            : record
        );
        setSavedRecords(locallyUpdated);
      } else {
        const newRecord = {
          producerId: selectedProducer.id,
          uretimAlaniId: selectedUretimAlani.id,
          items: checklistData.items,
          date: currentDate.toISOString(),
          dateFormatted: currentDate.toLocaleDateString('tr-TR'),
          timeFormatted: currentDate.toLocaleTimeString('tr-TR'),
          producerName: `${selectedProducer.firstName} ${selectedProducer.lastName}`
        };
        // Veritabanına yeni kayıt ekle
        const newId = await saveSeraKontrolRecord(newRecord);
        // Local state'e ekle
        setSavedRecords([...savedRecords, { ...newRecord, id: newId }]);
      }

      setEditingRecord(null);
      setSaveSuccess(true);
      setCurrentStep('list');
      
      // Sadece yeni kayıt oluştururken formu temizle, düzenleme sırasında temizleme
      if (!editingRecord) {
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
      }
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setError('Kayıt başarısız');
      console.error('Kayıt hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: any) => {
    console.log('handleEditRecord called with:', record);
    setEditingRecord(record);
    // Düzenleme sırasında kayıtlı verileri yükle
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
    if (!window || !window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteSeraKontrolRecord(recordId);
      setSavedRecords(prev => prev.filter(record => record.id !== recordId));
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

  // Removed unused getCategoryStats function

  // Removed unused getCategoryName function

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('select-area');
  };

  // Üretim alanı seçimi
  const handleUretimAlaniSelect = (area: any) => {
    setSelectedUretimAlani(area);
    setCurrentStep('list');
    setLoading(false);
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
    // Yeni kayıt oluştururken formu temizle
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

  // Kayıt listesi ve checklist ekranına girildiğinde mevcut kayıtları yükle
  useEffect(() => {
    if ((currentStep === 'checklist' || currentStep === 'list') && selectedUretimAlani) {
      setLoading(false);
      const loadRecords = async () => {
        try {
          const records = await getSeraKontrolRecordsByUretimAlani(selectedUretimAlani.id);
          setSavedRecords(records);
        } catch (err) {
          setError('Kayıtlı kayıtlar yüklenemedi');
          setSavedRecords([]);
        }
      };
      loadRecords();
    }
  }, [currentStep, selectedUretimAlani]);

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
          
          {/* Progress Steps */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-emerald-500 rounded"></div>
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
                <span className="ml-2">Sera Kontrol</span>
              </div>
            </div>
          </div>

          {/* Geri Dönüş Butonu */}
          <div className="mb-6">
            <button
              onClick={resetSelection}
              className="text-slate-600 hover:text-slate-800 transition-colors flex items-center"
            >
              ← Geri Dön
            </button>
          </div>

          {uretimAlanlari.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏭</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Üretim alanı bulunamadı</h3>
              <p className="text-gray-600 mb-4">Bu üreticiye ait üretim alanı yok.</p>
              <button
                onClick={resetSelection}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Başka Üretici Seç
              </button>
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
                      <div className="text-sm text-gray-600">Alan: {area.alanM2} m² | Parsel: {area.parsel} | Ada: {area.ada}</div>
                      <div className="text-xs text-gray-500">Dikim Tarihi: {area.dikimTarihi} | Sera Tipi: {area.seraType}</div>
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
  // Removed unused categoryStats variable

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Producer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🏠</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {editingRecord ? 'Sera Kontrol Kaydını Düzenle' : 'Yeni Sera Kontrol Kaydı'} - {selectedProducer?.firstName} {selectedProducer?.lastName}
                </h1>
                {!editingRecord && (
                  <p className="text-gray-500 text-sm mt-1">
                    Tarih: {new Date().toLocaleDateString('tr-TR')} - Saat: {new Date().toLocaleTimeString('tr-TR')}
                  </p>
                )}
                <p className="text-gray-600 text-sm">
                  TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setCurrentStep('list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                ← Listeye Dön
              </button>
            </div>
          </div>
          
          {/* Simple Progress */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Genel İlerleme</h2>
              <span className="text-2xl font-bold text-blue-600">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.completedItems}/{stats.totalItems} görev tamamlandı
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Simple Checklist */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Kontrol Listesi</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {checklistData.items.map((item) => {
              const isExpanded = expandedSections.has(item.id);
              
              return (
                <div key={item.id} className="hover:bg-gray-50 transition-colors">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleSection(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {item.completed && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.completed && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Tamamlandı
                        </span>
                      )}
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50">
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
        </div>

        {/* Completion Badge */}
        {stats.percentage === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-1">
              Tebrikler!
            </h2>
            <p className="text-green-700">
              {selectedProducer?.firstName} {selectedProducer?.lastName} için sera kontrol detaylı kontrolleri başarıyla tamamlandı!
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setCurrentStep('list')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Listeye Dön
            </button>
            <button
              onClick={handleSaveRecord}
              disabled={loading}
              className="px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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