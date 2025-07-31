import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Producer } from '../types/producer';
import { fetchWeatherData, type WeatherData } from '../utils/weatherUtils';
import { saveRecipe } from '../utils/recipeUtils';

const RecipeCreate: React.FC = () => {
  const { producerId } = useParams<{ producerId: string }>();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Form data states
  const [fertilization1, setFertilization1] = useState('');
  const [fertilization2, setFertilization2] = useState('');
  const [fertilization3, setFertilization3] = useState('');
  const [topFeeding, setTopFeeding] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Update current date and time every minute
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    // Mock producer data - gerçek uygulamada Firebase'den gelecek
    const mockProducer: Producer = {
      id: '1',
      firstName: 'Veli',
      lastName: 'Koruz',
      tcNo: '28609066164',
      phone: '05377383743',
      address: 'Kapaklı Mah.',
      gender: 'Erkek',
      experienceYear: '5',
      registerDate: '2023-01-15'
    };
    setProducer(mockProducer);

    // Hava durumu verilerini çek
    loadWeatherData();

    return () => clearInterval(interval);
  }, [producerId]);

  const loadWeatherData = async () => {
    try {
      setWeatherLoading(true);
      const data = await fetchWeatherData();
      setWeatherData(data);
    } catch (error) {
      console.error('Hava durumu verisi alınamadı:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    const timeString = date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const dateString = date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return { timeString, dateString };
  };

  const handleSaveRecipe = async () => {
    if (!producer) return;
    
    try {
      // Reçete verilerini hazırla
      const recipeData = {
        producerId: producer.id,
        producerName: `${producer.firstName} ${producer.lastName}`,
        fertilization1,
        fertilization2,
        fertilization3,
        topFeeding,
        notes,
        weatherData
      };
      
      // Firebase'e kaydet
      await saveRecipe(recipeData);
      
      alert('Reçete başarıyla kaydedildi!');
      navigate('/admin/recipe'); // Reçete listesine geri dön
    } catch (error) {
      console.error('Reçete kaydetme hatası:', error);
      alert('Reçete kaydedilirken bir hata oluştu!');
    }
  };

  const { timeString, dateString } = formatDateTime(currentDateTime);

  if (!producer) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Sayfa Başlığı */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Reçete Oluştur</h1>
          <p className="text-lg text-gray-600">Üretici için detaylı reçete bilgilerini girin</p>
        </div>

        {/* 4 Ana Bölüm - Grid Layout */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          
          {/* 🟩 1. BÖLÜM (Sol Üst): Üretici Bilgileri */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
              Üretici Bilgileri
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {producer.firstName.charAt(0)}{producer.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {producer.firstName} {producer.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">TC: {producer.tcNo}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Telefon:</span>
                  <span className="text-sm font-medium">{producer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adres:</span>
                  <span className="text-sm font-medium">{producer.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deneyim:</span>
                  <span className="text-sm font-medium">{producer.experienceYear} yıl</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tarih:</span>
                  <span className="text-sm font-medium">{dateString}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saat:</span>
                  <span className="text-sm font-medium">{timeString}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🟩 2. BÖLÜM (Sağ Üst): Gübreleme Programı */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
              Gübreleme Programı
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Gübreleme <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fertilization1}
                  onChange={(e) => setFertilization1(e.target.value)}
                  placeholder="1. gübreleme detaylarını yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Gübreleme <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={fertilization2}
                  onChange={(e) => setFertilization2(e.target.value)}
                  placeholder="2. gübreleme detaylarını yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Gübreleme <span className="text-gray-500">(Opsiyonel)</span>
                </label>
                <textarea
                  value={fertilization3}
                  onChange={(e) => setFertilization3(e.target.value)}
                  placeholder="3. gübreleme detaylarını yazın (opsiyonel)..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* 🟩 3. BÖLÜM (Sol Alt): Üstten Besleme */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
              Üstten Besleme
            </h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <span className="text-lg font-semibold text-orange-600">100 ml</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Üstten Besleme Detayları
                </label>
                <textarea
                  value={topFeeding}
                  onChange={(e) => setTopFeeding(e.target.value)}
                  placeholder="Üstten besleme detaylarını buraya yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={8}
                />
              </div>
            </div>
          </div>

          {/* 🟩 4. BÖLÜM (Sağ Alt): Notlar ve Hava Durumu */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
              Notlar ve Hava Durumu
            </h2>
            <div className="space-y-4">
              {/* Notlar Kısmı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ek notlarınızı buraya yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              {/* Hava Durumu Kısmı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hava Durumu
                </label>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] border border-gray-200">
                  {weatherLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Hava durumu yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-center mb-3">
                        <h3 className="font-semibold text-gray-700 text-sm">10 Günlük Tahmin</h3>
                      </div>
                      
                      {weatherData.slice(0, 3).map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-700 w-8">{day.day}</span>
                            <span className="text-sm">{day.icon}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-blue-600">{day.minTemp}°</span>
                            <span className="text-xs font-medium text-red-600">{day.maxTemp}°</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center mt-2">
                        <button
                          onClick={loadWeatherData}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          ↻ Yenile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="flex justify-center space-x-4">
          <button
                          onClick={() => navigate('/admin/recipe')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </button>
          <button
            onClick={handleSaveRecipe}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Reçeteyi Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreate; 