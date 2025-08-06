import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { getProducerById, getSeraKontrolRecords } from '../utils/firestoreUtils';
import { saveRecipe } from '../utils/recipeUtils';
import { fetchWeatherData } from '../utils/weatherUtils';
import type { Producer } from '../types/producer';
import type { ChecklistItem } from '../types/checklist';
import type { WeatherData } from '../utils/weatherUtils';

interface Fertilization {
  date: string;
  time: string;
  water: string;
  duration: string;
  products: string[];
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
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [lastLocation, setLastLocation] = useState<{lat: number, lon: number} | null>(null);
  const [productCounts, setProductCounts] = useState<{[key: number]: number}>({0: 1});

  // Ürün ekleme fonksiyonu
  const addProduct = (fertIndex: number) => {
    const currentCount = productCounts[fertIndex] || 1;
    setProductCounts(prev => ({
      ...prev,
      [fertIndex]: currentCount + 1
    }));
    
    // Form state'ini de güncelle
    const currentProducts = watch(`fertilizations.${fertIndex}.products`) || [''];
    const newProducts = [...currentProducts, ''];
    setValue(`fertilizations.${fertIndex}.products`, newProducts);
  };

  // Ürün kaldırma fonksiyonu
  const removeProduct = (fertIndex: number, productIndex: number) => {
    const currentCount = productCounts[fertIndex] || 1;
    if (currentCount > 1) {
      setProductCounts(prev => ({
        ...prev,
        [fertIndex]: currentCount - 1
      }));
      
      // Form'dan da kaldır
      const currentProducts = watch(`fertilizations.${fertIndex}.products`) || [];
      const newProducts = currentProducts.filter((_, i) => i !== productIndex);
      setValue(`fertilizations.${fertIndex}.products`, newProducts);
    }
  };
  
  // Koordinatları şehir adına çeviren fonksiyon
  const getCityNameFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Önce OpenWeather API ile deneyelim
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      
      if (response.ok) {
        const locationData = await response.json();
        if (locationData.length > 0) {
          // En uygun sonucu bul (şehir + ilçe kombinasyonu)
          let bestLocation = locationData[0];
          
          // Şehir ve ilçe bilgisi olan bir sonuç ara
          for (const location of locationData) {
            if (location.name && location.state && location.name !== location.state) {
              bestLocation = location;
              break;
            }
          }
          
          const cityName = bestLocation.name || 'Bilinmeyen Şehir';
          const stateName = bestLocation.state || '';
          const countryName = bestLocation.country || '';
          
          let locationString = `📍 ${cityName}`;
          if (stateName && stateName !== cityName) {
            locationString += `, ${stateName}`;
          }
          if (countryName) {
            locationString += `, ${countryName}`;
          }
          
          return locationString;
        }
      }
      
      // OpenWeather API başarısız olursa Nominatim API'yi dene
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        const address = nominatimData.address;
        
        if (address) {
          const city = address.city || address.town || address.village || address.county || '';
          const district = address.suburb || address.district || address.neighbourhood || '';
          const state = address.state || '';
          const country = address.country || '';
          
          let locationString = '📍 ';
          if (city) {
            locationString += city;
          }
          if (district && district !== city) {
            locationString += `, ${district}`;
          }
          if (state && state !== city && state !== district) {
            locationString += `, ${state}`;
          }
          if (country) {
            locationString += `, ${country}`;
          }
          
          if (locationString === '📍 ') {
            return `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          return locationString;
        }
      }
      
      // Her iki API de başarısız olursa koordinatları göster
      return `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.log('Konum adı alınamadı, koordinat kullanılıyor');
      return `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };
  
  const { register, control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      fertilizations: [{ date: '', time: '', water: '', duration: '', products: [''] }],
      topFeedings: [{ date: '', time: '', applications: '' }],
      selectedSeraKontrol: '',
      notes: '',
    },
  });

  const { fields: fertFields, append: addFert, remove: removeFert } = useFieldArray({ control, name: 'fertilizations' });
  const { fields: feedFields, append: addFeed, remove: removeFeed } = useFieldArray({ control, name: 'topFeedings' });

  const selectedSeraKontrol = watch('selectedSeraKontrol');

  // Üretici, sera kontrol ve hava durumu verilerini yükle
  useEffect(() => {
    const loadData = async () => {
      if (!producerId) {
        setError('Üretici ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setWeatherLoading(true);
        
        const [producerData, seraKontrolData, weatherDataResult] = await Promise.all([
          getProducerById(producerId),
          getSeraKontrolRecords(producerId),
          fetchWeatherData()
        ]);
        
        console.log('Weather data result:', weatherDataResult);
        
        if (producerData) {
          setProducer(producerData);
        } else {
          setError('Üretici bulunamadı');
        }
        
        setSeraKontrolRecords(seraKontrolData);
        setWeatherData(weatherDataResult);
        
        // Kullanıcı konumunu belirle
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const currentLocation = { lat: latitude, lon: longitude };
              
              // Konum değişip değişmediğini kontrol et
              const locationChanged = !lastLocation || 
                Math.abs(lastLocation.lat - latitude) > 0.01 || 
                Math.abs(lastLocation.lon - longitude) > 0.01;
              
              if (locationChanged) {
                console.log('Konum değişikliği tespit edildi, hava durumu güncelleniyor...');
                setLastLocation(currentLocation);
                setLocationLoading(true);
                
                try {
                  // Koordinatları şehir adına çevir
                  const locationString = await getCityNameFromCoordinates(latitude, longitude);
                  setUserLocation(locationString);
                  
                  // Yeni konum için hava durumu verilerini güncelle
                  setWeatherLoading(true);
                  const newWeatherData = await fetchWeatherData();
                  setWeatherData(newWeatherData);
                  setWeatherLoading(false);
                  
                          } catch (error) {
            console.log('Konum adı alınamadı, koordinat kullanılıyor');
            setUserLocation(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setLocationLoading(false);
          }
              }
            },
            () => {
              setUserLocation('📍 İstanbul, Türkiye (Varsayılan)');
              setLocationLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        } else {
          setUserLocation('📍 İstanbul, Türkiye (Varsayılan)');
          setLocationLoading(false);
        }
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu');
        console.error('Veri yükleme hatası:', err);
      } finally {
        setLoading(false);
        setWeatherLoading(false);
      }
    };

    loadData();
  }, [producerId]);

  // Sürekli konum takibi
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { lat: latitude, lon: longitude };
        
        // Konum değişip değişmediğini kontrol et (1km tolerans)
        const locationChanged = !lastLocation || 
          Math.abs(lastLocation.lat - latitude) > 0.01 || 
          Math.abs(lastLocation.lon - longitude) > 0.01;
        
        if (locationChanged) {
          console.log('Konum değişikliği tespit edildi, hava durumu güncelleniyor...');
          setLastLocation(currentLocation);
          setLocationLoading(true);
          
          try {
            // Koordinatları şehir adına çevir
            const locationString = await getCityNameFromCoordinates(latitude, longitude);
            setUserLocation(locationString);
            
            // Yeni konum için hava durumu verilerini güncelle
            setWeatherLoading(true);
            const newWeatherData = await fetchWeatherData();
            setWeatherData(newWeatherData);
            setWeatherLoading(false);
            
          } catch (error) {
            console.log('Konum adı alınamadı, koordinat kullanılıyor');
            setUserLocation(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } finally {
            setLocationLoading(false);
          }
        }
      },
      (error) => {
        console.log('Konum takibi hatası:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [lastLocation]);

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
      // Tuzak ve zararlı verilerini çıkar
      let tuzakBilgileri = '';
      let zararlıBilgileri = '';

      if (selectedSeraKontrolData) {
        // Tuzak bilgilerini çıkar
        const tuzakItem = selectedSeraKontrolData.items.find((item: ChecklistItem) => item.id === 'sera-kulturel-genel-kontrol');
        if (tuzakItem && tuzakItem.data) {
          const tuzaklar = [];
          if (tuzakItem.data['5-adet-mavi']) tuzaklar.push('5 adet mavi tuzak');
          if (tuzakItem.data['5-adet-sari']) tuzaklar.push('5 adet sarı tuzak');
          if (tuzakItem.data['10-adet-mavi']) tuzaklar.push('10 adet mavi tuzak');
          if (tuzakItem.data['10-adet-sari']) tuzaklar.push('10 adet sarı tuzak');
          if (tuzakItem.data['15-adet-mavi']) tuzaklar.push('15 adet mavi tuzak');
          if (tuzakItem.data['15-adet-sari']) tuzaklar.push('15 adet sarı tuzak');
          
          if (tuzaklar.length > 0) {
            tuzakBilgileri = `Eklenen Tuzaklar: ${tuzaklar.join(', ')}`;
          }
        }

        // Zararlı bilgilerini çıkar
        const zararlıItem = selectedSeraKontrolData.items.find((item: ChecklistItem) => item.id === 'zararli-kontrol');
        if (zararlıItem && zararlıItem.data) {
          const zararlilar = [];
          if (zararlıItem.data.insektisit) zararlilar.push('İnsektisit');
          if (zararlıItem.data.beyaz_sinek) zararlilar.push('Beyaz sinek');
          if (zararlıItem.data.thrips) zararlilar.push('Thrips');
          if (zararlıItem.data.yesil_kurt_tuta) zararlilar.push('Yeşil kurt / Tuta');
          if (zararlıItem.data.yaprak_biti) zararlilar.push('Yaprak biti');
          if (zararlıItem.data.unlu_biti) zararlilar.push('Unlu biti');
          if (zararlıItem.data.biber_gal_sinegi) zararlilar.push('Biber gal sineği');
          if (zararlıItem.data.akarisit) zararlilar.push('Akarisit');
          if (zararlıItem.data.kirmizi_orumcek) zararlilar.push('Kırmızı örümcek');
          if (zararlıItem.data.sari_cay_akar) zararlilar.push('Sarı çay akar');
          if (zararlıItem.data.fungusit) zararlilar.push('Fungusit');
          if (zararlıItem.data.kulleme) zararlilar.push('Külleme');
          if (zararlıItem.data.pas) zararlilar.push('Pas');
          if (zararlıItem.data.virus) zararlilar.push('Virüs');
          if (zararlıItem.data.bakteri) zararlilar.push('Bakteri');
          
          if (zararlilar.length > 0) {
            zararlıBilgileri = `Tespit Edilen Zararlılar: ${zararlilar.join(', ')}`;
          }
        }
      }

      // Form verilerini reçete formatına dönüştür
      const recipeData = {
        producerId: producer.id,
        producerName: `${producer.firstName} ${producer.lastName}`,
        fertilization1: data.fertilizations[0] ? 
          `${data.fertilizations[0].date} ${data.fertilizations[0].time} - Su: ${data.fertilizations[0].water}ml, Süre: ${data.fertilizations[0].duration}dk, Ürünler: ${(data.fertilizations[0].products || []).filter(p => p && p.trim()).join(', ')}` : '',
        fertilization2: data.fertilizations[1] ? 
          `${data.fertilizations[1].date} ${data.fertilizations[1].time} - Su: ${data.fertilizations[1].water}ml, Süre: ${data.fertilizations[1].duration}dk, Ürünler: ${(data.fertilizations[1].products || []).filter(p => p && p.trim()).join(', ')}` : '',
        fertilization3: data.fertilizations[2] ? 
          `${data.fertilizations[2].date} ${data.fertilizations[2].time} - Su: ${data.fertilizations[2].water}ml, Süre: ${data.fertilizations[2].duration}dk, Ürünler: ${(data.fertilizations[2].products || []).filter(p => p && p.trim()).join(', ')}` : '',
        topFeeding: data.topFeedings.length > 0 ? 
          data.topFeedings.map(feed => `${feed.date} ${feed.time} - ${feed.applications}`).join('; ') : '',
        notes: data.notes,
        selectedSeraKontrolId: data.selectedSeraKontrol,
        selectedSeraKontrolData: selectedSeraKontrolData,
        tuzakBilgileri: tuzakBilgileri,
        zararlıBilgileri: zararlıBilgileri,
        weatherData: weatherData
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">✨ Yeni Reçete Oluştur</h1>
            <p className="text-slate-600 text-lg">Seçilen üretici için detaylı reçete hazırlayın</p>
          </div>
          <button
            onClick={() => navigate('/admin/recipes')}
            className="text-slate-600 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Üretici Bilgisi */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-8 border border-slate-200 text-white">
          <h2 className="font-bold text-white mb-6 text-xl flex items-center">
            <span className="mr-3">👨‍🌾</span>
            Üretici Bilgisi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <span className="text-white/80 text-xs font-medium">Ad Soyad</span>
              <p className="font-bold text-white text-lg">{producer.firstName} {producer.lastName}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <span className="text-white/80 text-xs font-medium">TC Kimlik No</span>
              <p className="font-bold text-white text-lg">{producer.tcNo}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <span className="text-white/80 text-xs font-medium">Telefon</span>
              <p className="font-bold text-white text-lg">{producer.phone}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm md:col-span-2">
              <span className="text-white/80 text-xs font-medium">Adres</span>
              <p className="font-bold text-white text-lg">{producer.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Gübreleme Programı */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-xl flex items-center">
                <span className="mr-3">🌱</span>
                Gübreleme Programı
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newIndex = fertFields.length;
                  addFert({ date: '', time: '', water: '', duration: '', products: [''] });
                  setProductCounts(prev => ({
                    ...prev,
                    [newIndex]: 1
                  }));
                }}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
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
                        onClick={() => {
                          removeFert(index);
                          // productCounts state'inden de kaldır
                          setProductCounts(prev => {
                            const newCounts = { ...prev };
                            delete newCounts[index];
                            // Diğer indeksleri yeniden düzenle
                            const reorderedCounts: {[key: number]: number} = {};
                            Object.keys(newCounts).forEach((key, newIndex) => {
                              reorderedCounts[newIndex] = newCounts[parseInt(key)];
                            });
                            return reorderedCounts;
                          });
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  </div>

                  {/* Ürünler Bölümü */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-medium text-slate-700">Ürünler</label>
                      <button
                        type="button"
                        onClick={() => addProduct(index)}
                        className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ürün Ekle
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {Array.from({ length: productCounts[index] || 1 }, (_, productIndex) => (
                        <div key={productIndex} className="flex items-center space-x-2">
                          <input
                            {...register(`fertilizations.${index}.products.${productIndex}`)}
                            type="text"
                            placeholder={`Ürün ${productIndex + 1} (örn: NPK, Demir, Çinko)`}
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors"
                          />
                          {productIndex > 0 && (
                            <button
                              type="button"
                              onClick={() => removeProduct(index, productIndex)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Ürünü Kaldır"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <p className="text-xs text-slate-500">
                        Birden fazla ürün eklemek için "Ürün Ekle" butonunu kullanın
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Üstten Besleme */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-xl flex items-center">
                <span className="mr-3">💧</span>
                Üstten Besleme
              </h2>
              <button
                type="button"
                onClick={() => addFeed({ date: '', time: '', applications: '' })}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
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
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-xl mb-6 flex items-center">
              <span className="mr-3">🔍</span>
              Sera İçi Kontrol Verileri
            </h2>
            
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
                        {record.dateFormatted} - {record.timeFormatted} ({record.items.filter((item: ChecklistItem) => item.completed).length}/{record.items.length} tamamlandı)
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
                      {selectedSeraKontrolData.items
                        .filter((item: ChecklistItem) => {
                          // Sadece belirtilen alanları göster
                          const allowedItems = [
                            'iklim-kontrolu', // sera ısısı, sera nemi, ort ışık değerleri
                            'bos-su-ec-ph', // su EC, su pH
                            'kontrol-bitkileri-kontrolu', // kökte problem, vejetatif aksamda problem, generatif aksamda problem, ortalama brix değeri, ort klorofil değeri
                            'zararli-kontrol', // zararlı türleri
                            'sera-kulturel-genel-kontrol' // tuzak bilgileri
                          ];
                          return allowedItems.includes(item.id);
                        })
                        .map((item: ChecklistItem, index: number) => {
                          // Her item için sadece belirtilen alanları göster
                          let filteredData: Record<string, string> = {};
                          
                          if (item.data && Object.keys(item.data).length > 0) {
                            if (item.id === 'iklim-kontrolu') {
                              // Sera ısısı, sera nemi, ort ışık değerleri
                              filteredData = {
                                'Sera Isısı': item.data?.isi ? `${String(item.data.isi)}°C` : 'Belirtilmemiş',
                                'Sera Nemi': item.data?.nem ? `${String(item.data.nem)}%` : 'Belirtilmemiş',
                                'Ort Işık Değeri': item.data?.isik ? `${String(item.data.isik)} lux` : 'Belirtilmemiş'
                              };
                            } else if (item.id === 'bos-su-ec-ph') {
                              // Su EC, su pH
                              filteredData = {
                                'Su EC': item.data?.['ec-degeri'] ? `${String(item.data['ec-degeri'])}` : 'Belirtilmemiş',
                                'Su pH': item.data?.['ph-degeri'] ? `${String(item.data['ph-degeri'])}` : 'Belirtilmemiş'
                              };
                            } else if (item.id === 'kontrol-bitkileri-kontrolu') {
                              // Kökte problem, vejetatif aksamda problem, generatif aksamda problem, ortalama brix değeri, ort klorofil değeri
                              filteredData = {
                                'Kökte Problem': item.data?.['kok-problemi'] ? String(item.data['kok-problemi']) : 'Belirtilmemiş',
                                'Vejetatif Aksamda Problem': item.data?.['vejetatif-kontrol-problemi'] ? String(item.data['vejetatif-kontrol-problemi']) : 'Belirtilmemiş',
                                'Generatif Aksamda Problem': item.data?.['generatif-kontrol-problemi'] ? String(item.data['generatif-kontrol-problemi']) : 'Belirtilmemiş',
                                'Ortalama Brix Değeri': item.data?.['brix-degeri'] ? `${String(item.data['brix-degeri'])}` : 'Belirtilmemiş',
                                'Ort Klorofil Değeri': item.data?.['klorofil-degeri'] ? `${String(item.data['klorofil-degeri'])}` : 'Belirtilmemiş'
                              };
                            } else if (item.id === 'zararli-kontrol') {
                              // Zararlı türleri
                              const zararlilar = [];
                              if (item.data?.insektisit) zararlilar.push('İnsektisit');
                              if (item.data?.beyaz_sinek) zararlilar.push('Beyaz sinek');
                              if (item.data?.thrips) zararlilar.push('Thrips');
                              if (item.data?.yesil_kurt_tuta) zararlilar.push('Yeşil kurt / Tuta');
                              if (item.data?.yaprak_biti) zararlilar.push('Yaprak biti');
                              if (item.data?.unlu_biti) zararlilar.push('Unlu biti');
                              if (item.data?.biber_gal_sinegi) zararlilar.push('Biber gal sineği');
                              if (item.data?.akarisit) zararlilar.push('Akarisit');
                              if (item.data?.kirmizi_orumcek) zararlilar.push('Kırmızı örümcek');
                              if (item.data?.sari_cay_akar) zararlilar.push('Sarı çay akar');
                              if (item.data?.fungusit) zararlilar.push('Fungusit');
                              if (item.data?.kulleme) zararlilar.push('Külleme');
                              if (item.data?.pas) zararlilar.push('Pas');
                              if (item.data?.virus) zararlilar.push('Virüs');
                              if (item.data?.bakteri) zararlilar.push('Bakteri');
                              
                              filteredData = {
                                'Tespit Edilen Zararlılar': zararlilar.length > 0 ? zararlilar.join(', ') : 'Zararlı tespit edilmedi'
                              };
                            } else if (item.id === 'sera-kulturel-genel-kontrol') {
                              // Tuzak bilgileri
                              const tuzaklar = [];
                              if (item.data?.['5-adet-mavi']) tuzaklar.push('5 adet mavi tuzak');
                              if (item.data?.['5-adet-sari']) tuzaklar.push('5 adet sarı tuzak');
                              if (item.data?.['10-adet-mavi']) tuzaklar.push('10 adet mavi tuzak');
                              if (item.data?.['10-adet-sari']) tuzaklar.push('10 adet sarı tuzak');
                              if (item.data?.['15-adet-mavi']) tuzaklar.push('15 adet mavi tuzak');
                              if (item.data?.['15-adet-sari']) tuzaklar.push('15 adet sarı tuzak');
                              
                              filteredData = {
                                'Eklenen Tuzaklar': tuzaklar.length > 0 ? tuzaklar.join(', ') : 'Tuzak eklenmedi'
                              };
                            }
                          }

                          // Sadece değeri olan alanları göster
                          const validData = Object.entries(filteredData).filter(([, value]) => 
                            value && value !== 'Belirtilmemiş'
                          );

                          if (validData.length === 0) return null;

                          return (
                            <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-700 text-xs">
                                  {item.id === 'iklim-kontrolu' ? 'İklim Kontrolü' :
                                   item.id === 'bos-su-ec-ph' ? 'Su Analizi' :
                                   item.id === 'kontrol-bitkileri-kontrolu' ? 'Bitki Kontrolü' :
                                   item.id === 'zararli-kontrol' ? 'Zararlı Kontrolü' :
                                   item.id === 'sera-kulturel-genel-kontrol' ? 'Kültürel Kontrol' : item.label}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.completed 
                                    ? 'bg-slate-100 text-slate-700' 
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                  {item.completed ? 'Tamamlandı' : 'Eksik'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 space-y-1">
                                {validData.map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hava Durumu Bölümü */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-xl mb-4 flex items-center">
              <span className="mr-3">🌤️</span>
              Canlı Konum Hava Durumu
            </h2>
            
            <div className="mb-4">
              {locationLoading ? (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                  <p className="text-sm text-slate-600">Konum belirleniyor...</p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mb-2">
                  <p className="text-sm font-medium text-slate-800">{userLocation}</p>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Canlı Konum
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500">10 günlük hava durumu tahmini</p>
            </div>

            {weatherLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-600 text-sm">Hava durumu verileri yükleniyor...</p>
              </div>
            ) : weatherData.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {weatherData.slice(0, 5).map((weather, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="text-xs font-medium text-slate-600 mb-1">{weather.day}</div>
                      <div className="text-lg mb-1">{weather.icon}</div>
                      <div className="text-xs font-bold text-slate-800">{weather.minTemp}°</div>
                      <div className="text-xs text-slate-600">{weather.maxTemp}°</div>
                      <div className="text-xs text-slate-500 mt-1 truncate" title={weather.description}>
                        {weather.description}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {weatherData.slice(5, 10).map((weather, index) => (
                    <div key={index + 5} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="text-xs font-medium text-slate-600 mb-1">{weather.day}</div>
                      <div className="text-lg mb-1">{weather.icon}</div>
                      <div className="text-xs font-bold text-slate-800">{weather.minTemp}°</div>
                      <div className="text-xs text-slate-600">{weather.maxTemp}°</div>
                      <div className="text-xs text-slate-500 mt-1 truncate" title={weather.description}>
                        {weather.description}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <strong>Not:</strong> Bu hava durumu verileri reçete PDF'inde de görünecektir.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">🌤️</div>
                <p className="text-slate-600 text-sm">Hava durumu verileri yüklenemedi</p>
                <p className="text-xs text-slate-500 mt-2">API anahtarı veya internet bağlantısı kontrol edin</p>
                <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
                  <p>Debug: weatherData.length = {weatherData.length}</p>
                  <p>Debug: weatherLoading = {weatherLoading.toString()}</p>
                </div>
              </div>
            )}
            
            {/* Manuel Güncelleme Butonu */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={async () => {
                  if (navigator.geolocation) {
                    setLocationLoading(true);
                    setWeatherLoading(true);
                    
                    try {
                      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0
                        });
                      });
                      
                      const { latitude, longitude } = position.coords;
                      const locationString = await getCityNameFromCoordinates(latitude, longitude);
                      setUserLocation(locationString);
                      
                      // Yeni konum için hava durumu verilerini güncelle
                      const newWeatherData = await fetchWeatherData();
                      setWeatherData(newWeatherData);
                      
                    } catch (error) {
                      console.log('Manuel güncelleme hatası:', error);
                    } finally {
                      setLocationLoading(false);
                      setWeatherLoading(false);
                    }
                  }
                }}
                disabled={locationLoading || weatherLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
              >
                {locationLoading || weatherLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Hava Durumunu Güncelle</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danışman Notu */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-xl mb-4 flex items-center">
              <span className="mr-3">📝</span>
              Danışman Notu
            </h2>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/recipes')}
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-base font-medium"
            >
              ❌ İptal
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors text-base font-medium shadow-lg hover:shadow-xl"
            >
              💾 Reçeteyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreatePage;
