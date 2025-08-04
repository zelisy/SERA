import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { getProducerById, getSeraKontrolRecords } from '../utils/firestoreUtils';
import { saveRecipe } from '../utils/recipeUtils';
import type { Producer } from '../types/producer';

interface Fertilization {
  date: string;
  time: string;
  water: string;
  duration: string;
  products: string;
}

interface TopFeeding {
  date: string;
  time: string;
  applications: string;
}

interface FormData {
  fertilizations: Fertilization[];
  topFeedings: TopFeeding[];
  selectedSeraKontrol: string;
  notes: string;
}

const RecipeCreatePage: React.FC = () => {
  const { producerId } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seraKontrolRecords, setSeraKontrolRecords] = useState<any[]>([]);
  const [selectedSeraKontrolData, setSelectedSeraKontrolData] = useState<any | null>(null);
  
  const { register, control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      fertilizations: [{ date: '', time: '', water: '', duration: '', products: '' }],
      topFeedings: [{ date: '', time: '', applications: '' }],
      selectedSeraKontrol: '',
      notes: '',
    },
  });

  const { fields: fertFields, append: addFert, remove: removeFert } = useFieldArray({ control, name: 'fertilizations' });
  const { fields: feedFields, append: addFeed, remove: removeFeed } = useFieldArray({ control, name: 'topFeedings' });

  const selectedSeraKontrol = watch('selectedSeraKontrol');

  // Üretici ve sera kontrol verilerini yükle
  useEffect(() => {
    const loadData = async () => {
      if (!producerId) {
        setError('Üretici ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [producerData, seraKontrolData] = await Promise.all([
          getProducerById(producerId),
          getSeraKontrolRecords(producerId)
        ]);
        
        if (producerData) {
          setProducer(producerData);
        } else {
          setError('Üretici bulunamadı');
        }
        
        setSeraKontrolRecords(seraKontrolData);
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu');
        console.error('Veri yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [producerId]);

  // Seçilen sera kontrol verilerini güncelle
  useEffect(() => {
    if (selectedSeraKontrol) {
      const selectedRecord = seraKontrolRecords.find(record => record.id === selectedSeraKontrol);
      setSelectedSeraKontrolData(selectedRecord || null);
    } else {
      setSelectedSeraKontrolData(null);
    }
  }, [selectedSeraKontrol, seraKontrolRecords]);

  const onSubmit = async (data: FormData) => {
    if (!producer) return;

    try {
      // Form verilerini reçete formatına dönüştür
      const recipeData = {
        producerId: producer.id,
        producerName: `${producer.firstName} ${producer.lastName}`,
        fertilization1: data.fertilizations[0] ? 
          `${data.fertilizations[0].date} ${data.fertilizations[0].time} - Su: ${data.fertilizations[0].water}ml, Süre: ${data.fertilizations[0].duration}dk, Ürünler: ${data.fertilizations[0].products}` : '',
        fertilization2: data.fertilizations[1] ? 
          `${data.fertilizations[1].date} ${data.fertilizations[1].time} - Su: ${data.fertilizations[1].water}ml, Süre: ${data.fertilizations[1].duration}dk, Ürünler: ${data.fertilizations[1].products}` : '',
        fertilization3: data.fertilizations[2] ? 
          `${data.fertilizations[2].date} ${data.fertilizations[2].time} - Su: ${data.fertilizations[2].water}ml, Süre: ${data.fertilizations[2].duration}dk, Ürünler: ${data.fertilizations[2].products}` : '',
        topFeeding: data.topFeedings.length > 0 ? 
          data.topFeedings.map(feed => `${feed.date} ${feed.time} - ${feed.applications}`).join('; ') : '',
        notes: data.notes,
        selectedSeraKontrolId: data.selectedSeraKontrol,
        selectedSeraKontrolData: selectedSeraKontrolData,
        weatherData: [
          {
            date: new Date().toISOString().split('T')[0],
            day: 'Bugün',
            icon: '☀️',
            minTemp: 24,
            maxTemp: 32,
            description: '24°C - 32°C'
          }
        ]
      };

      console.log('Reçete Kaydedildi:', recipeData);
      await saveRecipe(recipeData);
      
      navigate('/admin/recipes');
    } catch (error) {
      console.error('Reçete kaydetme hatası:', error);
      alert('Reçete kaydedilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Hata</h3>
          <p className="text-slate-600 mb-4">{error || 'Üretici bulunamadı'}</p>
          <button
            onClick={() => navigate('/admin/recipes')}
            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Yeni Reçete Oluştur</h1>
              <p className="text-slate-600">Üretici için detaylı reçete hazırlayın</p>
            </div>
            <button
              onClick={() => navigate('/admin/recipes')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              ← Geri Dön
            </button>
          </div>

          {/* Üretici Bilgisi */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
            <h2 className="font-semibold text-lg mb-3 text-emerald-800">👤 Üretici Bilgisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ad Soyad</p>
                <p className="font-semibold text-slate-800">{producer.firstName} {producer.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TC Kimlik No</p>
                <p className="font-semibold text-slate-800">{producer.tcNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-semibold text-slate-800">{producer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adres</p>
                <p className="font-semibold text-slate-800">{producer.address}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Gübreleme Programı */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">🌱 Gübreleme Programı</h2>
              <button
                type="button"
                onClick={() => addFert({ date: '', time: '', water: '', duration: '', products: '' })}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
              >
                + Yeni Gübreleme
              </button>
            </div>
            
            <div className="space-y-4">
              {fertFields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700">Gübreleme #{index + 1}</h3>
                    {fertFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFert(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Tarih
                      </label>
                      <input
                        {...register(`fertilizations.${index}.date`)}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 Saat
                      </label>
                      <input
                        {...register(`fertilizations.${index}.time`)}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💧 Su Miktarı (ml)
                      </label>
                      <input
                        {...register(`fertilizations.${index}.water`)}
                        type="number"
                        placeholder="Örn: 1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ⏱️ Süre (dk)
                      </label>
                      <input
                        {...register(`fertilizations.${index}.duration`)}
                        type="number"
                        placeholder="Örn: 30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🧪 Ürünler
                      </label>
                      <input
                        {...register(`fertilizations.${index}.products`)}
                        type="text"
                        placeholder="Gübre adları"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Üstten Besleme */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">🌿 Üstten Besleme</h2>
              <button
                type="button"
                onClick={() => addFeed({ date: '', time: '', applications: '' })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                + Yeni Uygulama
              </button>
            </div>
            
            <div className="space-y-4">
              {feedFields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700">Uygulama #{index + 1}</h3>
                    {feedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeed(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Tarih
                      </label>
                      <input
                        {...register(`topFeedings.${index}.date`)}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 Saat
                      </label>
                      <input
                        {...register(`topFeedings.${index}.time`)}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🧪 Uygulamalar
                      </label>
                      <input
                        {...register(`topFeedings.${index}.applications`)}
                        type="text"
                        placeholder="Uygulama detayları"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sera İçi Kontrol Seçimi */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">🏠 Sera İçi Kontrol Verileri</h2>
            
            {seraKontrolRecords.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Sera Kontrol Verisi Bulunamadı</h3>
                <p className="text-yellow-700 mb-4">
                  Bu üretici için henüz sera kontrol kaydı bulunmuyor. Önce sera kontrol sayfasından kayıt oluşturun.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/sera-kontrol')}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition-colors"
                >
                  Sera Kontrol Sayfasına Git
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📋 Sera Kontrol Kaydı Seçin
                  </label>
                  <select
                    {...register('selectedSeraKontrol')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">Sera kontrol kaydı seçin...</option>
                    {seraKontrolRecords.map((record) => (
                      <option key={record.id} value={record.id}>
                        {record.dateFormatted} - {record.timeFormatted} ({record.items.filter((item: any) => item.completed).length}/{record.items.length} tamamlandı)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seçilen sera kontrol verilerini göster */}
                {selectedSeraKontrolData && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-3">
                      📊 Seçilen Sera Kontrol Verileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedSeraKontrolData.items.map((item: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-purple-700 text-sm">{item.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.completed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.completed ? '✓ Tamamlandı' : '✗ Eksik'}
                            </span>
                          </div>
                          {item.data && Object.keys(item.data).length > 0 && (
                            <div className="text-xs text-gray-600">
                              {Object.entries(item.data).map(([key, value]) => (
                                <div key={key}>
                                  <strong>{key}:</strong> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danışman Notu */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📝 Danışman Notu</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Öneriler ve Notlar
              </label>
              <textarea
                {...register('notes')}
                placeholder="Üretici için öneriler, dikkat edilmesi gerekenler ve diğer notlarınızı buraya yazın..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/admin/recipes')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                ← İptal Et
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                💾 Reçeteyi Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreatePage;
