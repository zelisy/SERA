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
      
      // Redirect to the recipes page with the specific producer selected
      navigate(`/admin/recipes?producerId=${producer.id}`);
    } catch (error) {
      console.error('Reçete kaydetme hatası:', error);
      alert('Reçete kaydedilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !producer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Hata</h3>
          <p className="text-slate-600 mb-6">{error || 'Üretici bulunamadı'}</p>
          <button
            onClick={() => navigate('/admin/recipes')}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Yeni Reçete</h1>
            <p className="text-slate-600 text-sm">Üretici için reçete oluşturun</p>
          </div>
          <button
            onClick={() => navigate('/admin/recipes')}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Üretici Bilgisi */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="font-medium text-slate-900 mb-4">Üretici Bilgisi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Ad Soyad</span>
              <p className="font-medium text-slate-900">{producer.firstName} {producer.lastName}</p>
            </div>
            <div>
              <span className="text-slate-500">TC Kimlik No</span>
              <p className="font-medium text-slate-900">{producer.tcNo}</p>
            </div>
            <div>
              <span className="text-slate-500">Telefon</span>
              <p className="font-medium text-slate-900">{producer.phone}</p>
            </div>
            <div>
              <span className="text-slate-500">Adres</span>
              <p className="font-medium text-slate-900">{producer.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Gübreleme Programı */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-slate-900">Gübreleme Programı</h2>
              <button
                type="button"
                onClick={() => addFert({ date: '', time: '', water: '', duration: '', products: '' })}
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm"
              >
                + Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {fertFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Gübreleme {index + 1}</span>
                    {fertFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFert(index)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tarih</label>
                      <input
                        {...register(`fertilizations.${index}.date`)}
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Saat</label>
                      <input
                        {...register(`fertilizations.${index}.time`)}
                        type="time"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Su (ml)</label>
                      <input
                        {...register(`fertilizations.${index}.water`)}
                        type="number"
                        placeholder="1000"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Süre (dk)</label>
                      <input
                        {...register(`fertilizations.${index}.duration`)}
                        type="number"
                        placeholder="30"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ürünler</label>
                      <input
                        {...register(`fertilizations.${index}.products`)}
                        type="text"
                        placeholder="Gübre adları"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Üstten Besleme */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-slate-900">Üstten Besleme</h2>
              <button
                type="button"
                onClick={() => addFeed({ date: '', time: '', applications: '' })}
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm"
              >
                + Ekle
              </button>
            </div>
            
            <div className="space-y-4">
              {feedFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Uygulama {index + 1}</span>
                    {feedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeed(index)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tarih</label>
                      <input
                        {...register(`topFeedings.${index}.date`)}
                        type="date"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Saat</label>
                      <input
                        {...register(`topFeedings.${index}.time`)}
                        type="time"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Uygulamalar</label>
                      <input
                        {...register(`topFeedings.${index}.applications`)}
                        type="text"
                        placeholder="Uygulama detayları"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sera İçi Kontrol Seçimi */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="font-medium text-slate-900 mb-6">Sera İçi Kontrol Verileri</h2>
            
            {seraKontrolRecords.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl mb-3">⚠️</div>
                <h3 className="text-sm font-medium text-slate-800 mb-2">Sera Kontrol Verisi Bulunamadı</h3>
                <p className="text-slate-600 mb-4 text-sm">
                  Bu üretici için henüz sera kontrol kaydı bulunmuyor.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/admin/sera-kontrol')}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Sera Kontrol Sayfasına Git
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sera Kontrol Kaydı Seçin
                  </label>
                  <select
                    {...register('selectedSeraKontrol')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
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
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h3 className="font-medium text-slate-800 mb-3 text-sm">
                      Seçilen Sera Kontrol Verileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedSeraKontrolData.items.map((item: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-700 text-xs">{item.label}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.completed 
                                ? 'bg-slate-100 text-slate-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {item.completed ? 'Tamamlandı' : 'Eksik'}
                            </span>
                          </div>
                          {item.data && Object.keys(item.data).length > 0 && (
                            <div className="text-xs text-slate-600">
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
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="font-medium text-slate-900 mb-4">Danışman Notu</h2>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Öneriler ve Notlar
              </label>
              <textarea
                {...register('notes')}
                placeholder="Üretici için öneriler, dikkat edilmesi gerekenler ve diğer notlarınızı buraya yazın..."
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/recipes')}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              Reçeteyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreatePage;
