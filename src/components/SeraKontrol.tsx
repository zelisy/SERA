import { useState, useEffect } from 'react';
import UreticiListesi from './UreticiListesi';
import type { Producer } from '../types/producer';
import { seraKontrolConfig } from '../data/seraKontrolConfig';
import ChecklistItem from './ChecklistItem';
import type { ChecklistItem as ChecklistItemType } from '../types/checklist';
import { loadChecklistData, saveChecklistData, updateChecklistItem } from '../utils/firestoreUtils';

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
  ph: number;
  ec: number;
}

const SeraKontrol = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 24.9,
    humidity: 60,
    soilMoisture: 75,
    lightLevel: 850,
    ph: 6.5,
    ec: 1.2
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'checklist'>('select-producer');
  const [checklist, setChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [originalChecklist, setOriginalChecklist] = useState<ChecklistItemType[]>(seraKontrolConfig.items);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<any[]>([]); // Geçmiş değişiklikler için
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        humidity: Math.max(40, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
        soilMoisture: Math.max(30, Math.min(90, prev.soilMoisture + (Math.random() - 0.5) * 3)),
        lightLevel: Math.max(400, Math.min(1200, prev.lightLevel + (Math.random() - 0.5) * 50)),
        ph: Math.max(5.5, Math.min(7.5, prev.ph + (Math.random() - 0.5) * 0.1)),
        ec: Math.max(0.8, Math.min(2.0, prev.ec + (Math.random() - 0.5) * 0.05))
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducer, currentStep]);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setLastUpdate(new Date());
    }, 1000);
  };

     const getSensorStatus = (value: number, min: number, max: number) => {
     if (value < min) return { status: 'low', color: 'from-yellow-400 to-orange-500', statusIcon: '⚠️' };
     if (value > max) return { status: 'high', color: 'from-red-400 to-red-500', statusIcon: '🔴' };
     return { status: 'normal', color: 'from-emerald-400 to-green-500', statusIcon: '✅' };
   };

  const sensors = [
    {
      id: 'temperature',
      name: 'Sıcaklık',
      value: sensorData.temperature.toFixed(1),
      unit: '°C',
      icon: '🌡️',
      optimal: [18, 28],
      ...getSensorStatus(sensorData.temperature, 18, 28)
    },
    {
      id: 'humidity',
      name: 'Nem',
      value: sensorData.humidity.toFixed(0),
      unit: '%',
      icon: '💧',
      optimal: [50, 70],
      ...getSensorStatus(sensorData.humidity, 50, 70)
    },
    {
      id: 'soil',
      name: 'Toprak Nemi',
      value: sensorData.soilMoisture.toFixed(0),
      unit: '%',
      icon: '🌱',
      optimal: [60, 80],
      ...getSensorStatus(sensorData.soilMoisture, 60, 80)
    },
    {
      id: 'light',
      name: 'Işık Seviyesi',
      value: sensorData.lightLevel.toFixed(0),
      unit: 'lux',
      icon: '☀️',
      optimal: [600, 1000],
      ...getSensorStatus(sensorData.lightLevel, 600, 1000)
    },
    {
      id: 'ph',
      name: 'pH Değeri',
      value: sensorData.ph.toFixed(1),
      unit: '',
      icon: '⚗️',
      optimal: [6.0, 7.0],
      ...getSensorStatus(sensorData.ph, 6.0, 7.0)
    },
    {
      id: 'ec',
      name: 'EC Değeri',
      value: sensorData.ec.toFixed(1),
      unit: 'mS/cm',
      icon: '🔬',
      optimal: [1.0, 1.5],
      ...getSensorStatus(sensorData.ec, 1.0, 1.5)
    }
  ];

  const automationControls = [
    { id: 'irrigation', name: 'Sulama Sistemi', status: true, icon: '💧' },
    { id: 'ventilation', name: 'Havalandırma', status: false, icon: '🌪️' },
    { id: 'heating', name: 'Isıtma', status: false, icon: '🔥' },
    { id: 'lighting', name: 'LED Aydınlatma', status: true, icon: '💡' }
  ];

  const handleChecklistUpdate = async (itemId: string, completed: boolean, data?: Record<string, string | number | boolean | string[]>) => {
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
    setSaveSuccess(false);
    const dataKey = `sera-kontrol-${selectedProducer.id}`;
    try {
      // Geçmişe ekle
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

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Sera Kontrolü</h1>
              <p className="text-slate-600 mt-1">Sera kontrolü yapmak için önce bir üretici seçin</p>
            </div>
            <UreticiListesi
              selectionMode={true}
              onSelect={(producer) => {
                setSelectedProducer(producer);
                setCurrentStep('checklist');
              }}
              selectedProducer={selectedProducer}
            />
          </div>
        </div>
      </div>
    );
  }
  // Checklist Step
  if (currentStep === 'checklist' && selectedProducer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center space-x-4">
              <button
                onClick={() => setCurrentStep('select-producer')}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                ← Geri
              </button>
              <h1 className="text-2xl font-bold text-slate-800">
                {selectedProducer.firstName} {selectedProducer.lastName} - Sera Kontrolü
              </h1>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>
            )}
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4">Başarıyla kaydedildi!</div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="ml-4 text-slate-600">Checklist yükleniyor...</span>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {checklist.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onUpdate={handleChecklistUpdate}
                    />
                  ))}
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-semibold"
                    disabled={loading}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveAll}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold hover:from-emerald-600 hover:to-blue-600 shadow-lg"
                    disabled={loading}
                  >
                    Kaydet
                  </button>
                </div>
                {/* Geçmiş değişiklikler */}
                {history.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Geçmiş Kayıtlar</h2>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {history.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedHistoryIdx(idx)}
                            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${selectedHistoryIdx === idx ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100'}`}
                          >
                            {new Date(h.date).toLocaleString('tr-TR')}
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(idx)}
                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-200"
                            title="Kaydı Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                    {selectedHistoryIdx !== null && history[selectedHistoryIdx] && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        {(() => {
                          const h = history[selectedHistoryIdx];
                          const completedCount = h.items.filter((item: any) => item.completed).length;
                          const totalCount = h.items.length;
                          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                          return (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-slate-700">{new Date(h.date).toLocaleString('tr-TR')}</div>
                                <div className="text-sm text-emerald-700 font-bold">%{percent} tamamlandı</div>
                              </div>
                              <ul className="list-disc pl-6 text-slate-600 text-sm">
                                {h.items.map((item: any) => (
                                  <li key={item.id} className="mb-1">
                                    <span className="font-medium">{item.label}:</span> {item.completed ? '✔️ Tamamlandı' : '⏳ Bekliyor'}
                                    {item.data && (
                                      <ul className="ml-4 list-square text-xs text-gray-500">
                                        {Object.entries(item.data).map(([k, v]) => (
                                          <li key={k}>
                                            <span className="font-semibold">{k}:</span> {typeof v === 'boolean' ? (v ? '✔️' : '❌') : String(v)}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sera Kontrol Paneli</h1>
          <p className="text-slate-600 mt-1">
            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Güncelleniyor...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Yenile</span>
            </>
          )}
        </button>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
          >
                         <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                 <span className="text-2xl">{sensor.icon}</span>
                 <h3 className="font-semibold text-slate-800">{sensor.name}</h3>
               </div>
               <span className="text-lg">{sensor.statusIcon}</span>
             </div>

            <div className="space-y-3">
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-slate-800">
                  {sensor.value}
                </span>
                <span className="text-slate-600 font-medium pb-1">
                  {sensor.unit}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${sensor.color}`}></div>
                <span className="text-sm text-slate-600">
                  Optimal: {sensor.optimal[0]}-{sensor.optimal[1]} {sensor.unit}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${sensor.color} transition-all duration-500`}
                  style={{
                    width: `${Math.min(100, Math.max(0, 
                      ((parseFloat(sensor.value) - sensor.optimal[0]) / 
                       (sensor.optimal[1] - sensor.optimal[0])) * 100
                    ))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Automation Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Otomasyon Kontrolü</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {automationControls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{control.icon}</span>
                <span className="font-medium text-slate-800">{control.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${control.status ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
                <span className={`text-sm font-medium ${control.status ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {control.status ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Uyarılar</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-800 text-sm">Toprak nemi seviyesi optimal aralığın altında</span>
            <span className="text-yellow-600 text-xs ml-auto">2 dk önce</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-emerald-600">✅</span>
            <span className="text-emerald-800 text-sm">Sulama sistemi otomatik olarak devreye girdi</span>
            <span className="text-emerald-600 text-xs ml-auto">1 dk önce</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeraKontrol; 