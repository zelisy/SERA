import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Producer } from '../types/producer';
import type { FertilizationApplication, TopFeedingApplication, Product, GreenhouseControls, WeatherForecast, ConsultantNote } from '../types/recipe';

const RecipeCreate: React.FC = () => {
  const { producerId } = useParams<{ producerId: string }>();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Fertilization applications state
  const [fertilizationApplications, setFertilizationApplications] = useState<FertilizationApplication[]>([
    {
      id: '1',
      time: '8.30',
      date: '',
      waterAmount: '600',
      duration: '25',
      products: [{ name: '', quantity: '' }]
    },
    {
      id: '2',
      time: '8.30',
      date: '',
      waterAmount: '600',
      duration: '25',
      products: [{ name: '', quantity: '' }]
    },
    {
      id: '3',
      time: '8.30',
      date: '',
      waterAmount: '700',
      duration: '30',
      products: [{ name: '', quantity: '' }]
    }
  ]);

  // Top feeding applications state
  const [topFeedingApplications, setTopFeedingApplications] = useState<TopFeedingApplication[]>([
    {
      id: '1',
      time: '7.30',
      date: '',
      products: [{ name: '', quantity: '' }]
    },
    {
      id: '2',
      time: '7.30',
      date: '',
      products: [{ name: '', quantity: '' }]
    },
    {
      id: '3',
      time: '7.30',
      date: '',
      products: [{ name: '', quantity: '' }]
    }
  ]);

  // Greenhouse controls state
  const [greenhouseControls, setGreenhouseControls] = useState<GreenhouseControls>({
    temperature: '35',
    humidity: '55',
    waterEC: '1.8',
    waterPH: '6.5',
    rootProblem: false,
    vegetativeProblem: false,
    generativeProblem: false,
    averageBrix: '7',
    averageChlorophyll: '42',
    averageLight: '30000'
  });

  // Weather forecast state
  const [weatherForecast] = useState<WeatherForecast[]>([
    { day: 'Bugün', icon: '☀️', minTemp: '24°', maxTemp: '32°' },
    { day: 'Sal', icon: '☀️', minTemp: '24°', maxTemp: '31°' },
    { day: 'Çar', icon: '⛅', minTemp: '24°', maxTemp: '30°' },
    { day: 'Per', icon: '☀️', minTemp: '24°', maxTemp: '31°' },
    { day: 'Cum', icon: '☀️', minTemp: '24°', maxTemp: '31°' },
    { day: 'Cmt', icon: '☀️', minTemp: '25°', maxTemp: '33°' },
    { day: 'Paz', icon: '☀️', minTemp: '27°', maxTemp: '34°' },
    { day: 'Pzt', icon: '☀️', minTemp: '25°', maxTemp: '34°' },
    { day: 'Sal', icon: '☀️', minTemp: '26°', maxTemp: '35°' },
    { day: 'Çar', icon: '☀️', minTemp: '26°', maxTemp: '37°' }
  ]);

  // Consultant notes state
  const [consultantNotes] = useState<ConsultantNote[]>([
    { id: '1', note: '5 mavi tuzak asılsın' },
    { id: '2', note: '10 sarı tuzak asılsın' },
    { id: '3', note: 'Damlamalar 5-10 cm arası açılsın' },
    { id: '4', note: 'İçerideki nem %45 ten aşığıya düşerse araları nemlendirelim' },
    { id: '5', note: 'Sıcaklık derecesi 37°C yüksek olursa sulamayı 100 ml artıralım' },
    { id: '6', note: 'Toplama yapılsın' },
    { id: '7', note: 'Seradaki otlar temizlensin' }
  ]);

  useEffect(() => {
    // Update current date and time every minute
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    // Mock producer data
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

    return () => clearInterval(interval);
  }, [producerId]);

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

  const handleFertilizationChange = (index: number, field: keyof FertilizationApplication, value: string) => {
    const updated = [...fertilizationApplications];
    if (field === 'time' || field === 'date' || field === 'waterAmount' || field === 'duration') {
      (updated[index] as any)[field] = value;
    }
    setFertilizationApplications(updated);
  };

  const handleFertilizationProductChange = (appIndex: number, productIndex: number, field: keyof Product, value: string) => {
    const updated = [...fertilizationApplications];
    (updated[appIndex].products[productIndex] as any)[field] = value;
    setFertilizationApplications(updated);
  };

  const addFertilizationProduct = (appIndex: number) => {
    const updated = [...fertilizationApplications];
    updated[appIndex].products.push({ name: '', quantity: '' });
    setFertilizationApplications(updated);
  };

  const removeFertilizationProduct = (appIndex: number, productIndex: number) => {
    const updated = [...fertilizationApplications];
    updated[appIndex].products.splice(productIndex, 1);
    setFertilizationApplications(updated);
  };

  const handleTopFeedingChange = (index: number, field: keyof TopFeedingApplication, value: string) => {
    const updated = [...topFeedingApplications];
    if (field === 'time' || field === 'date') {
      (updated[index] as any)[field] = value;
    }
    setTopFeedingApplications(updated);
  };

  const handleTopFeedingProductChange = (appIndex: number, productIndex: number, field: keyof Product, value: string) => {
    const updated = [...topFeedingApplications];
    (updated[appIndex].products[productIndex] as any)[field] = value;
    setTopFeedingApplications(updated);
  };

  const addTopFeedingProduct = (appIndex: number) => {
    const updated = [...topFeedingApplications];
    updated[appIndex].products.push({ name: '', quantity: '' });
    setTopFeedingApplications(updated);
  };

  const removeTopFeedingProduct = (appIndex: number, productIndex: number) => {
    const updated = [...topFeedingApplications];
    updated[appIndex].products.splice(productIndex, 1);
    setTopFeedingApplications(updated);
  };

  const handleGreenhouseControlChange = (field: keyof GreenhouseControls, value: string | boolean) => {
    setGreenhouseControls(prev => ({
      ...prev,
      [field]: value
    }));
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-6xl font-bold text-green-600">Agrovia</div>
          
          <div className="text-right">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">Üretici Bilgisi</h3>
                <div className="space-y-1 text-sm">
                  <div>Ad Soyad: {producer.firstName} {producer.lastName}</div>
                  <div>Tc: {producer.tcNo}</div>
                  <div>Tel: {producer.phone}</div>
                  <div>Adres: {producer.address}</div>
                  <div>Dekar: 7.5 da</div>
                </div>
              </div>
              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <div>Saat: {timeString}</div>
                  <div>Tarih: {dateString}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gübreleme Programı */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-2">Gübreleme Programı</h2>
            <p className="text-center text-gray-600 mb-4">1 Dönüme / Dekara</p>
            
            <div className="space-y-4">
              {fertilizationApplications.map((app, appIndex) => (
                <div key={app.id} className="bg-green-500 rounded-lg p-4">
                  <div className="text-lg font-semibold mb-3">{appIndex + 1}.su</div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Saat:</span>
                        <input
                          type="text"
                          value={app.time}
                          onChange={(e) => handleFertilizationChange(appIndex, 'time', e.target.value)}
                          className="w-20 text-center border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Tarih:</span>
                        <input
                          type="date"
                          value={app.date}
                          onChange={(e) => handleFertilizationChange(appIndex, 'date', e.target.value)}
                          className="w-32 text-center border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Su:</span>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={app.waterAmount}
                            onChange={(e) => handleFertilizationChange(appIndex, 'waterAmount', e.target.value)}
                            className="w-16 text-center border rounded px-2 py-1"
                          />
                          <span className="ml-1">ml</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>dk:</span>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={app.duration}
                            onChange={(e) => handleFertilizationChange(appIndex, 'duration', e.target.value)}
                            className="w-16 text-center border rounded px-2 py-1"
                          />
                          <span className="ml-1">dk</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-semibold mb-2">Ürünler:</div>
                      <div className="space-y-2">
                        {app.products.map((product, productIndex) => (
                          <div key={productIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Ürün adı"
                              value={product.name}
                              onChange={(e) => handleFertilizationProductChange(appIndex, productIndex, 'name', e.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Miktar"
                              value={product.quantity}
                              onChange={(e) => handleFertilizationProductChange(appIndex, productIndex, 'quantity', e.target.value)}
                              className="w-20 border rounded px-2 py-1 text-sm"
                            />
                            {app.products.length > 1 && (
                              <button
                                onClick={() => removeFertilizationProduct(appIndex, productIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addFertilizationProduct(appIndex)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          + Ürün Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Üsten Besleme */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-2">Üsten Besleme</h2>
            <p className="text-center text-gray-600 mb-4">100 lt suya</p>
            
            <div className="space-y-4">
              {topFeedingApplications.map((app, appIndex) => (
                <div key={app.id} className="bg-green-500 rounded-lg p-4">
                  <div className="text-lg font-semibold mb-3">{appIndex + 1}.Uygulama</div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Saat:</span>
                        <input
                          type="text"
                          value={app.time}
                          onChange={(e) => handleTopFeedingChange(appIndex, 'time', e.target.value)}
                          className="w-20 text-center border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Tarih:</span>
                        <input
                          type="date"
                          value={app.date}
                          onChange={(e) => handleTopFeedingChange(appIndex, 'date', e.target.value)}
                          className="w-32 text-center border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-semibold mb-2">Ürünler:</div>
                      <div className="space-y-2">
                        {app.products.map((product, productIndex) => (
                          <div key={productIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Ürün adı"
                              value={product.name}
                              onChange={(e) => handleTopFeedingProductChange(appIndex, productIndex, 'name', e.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Miktar"
                              value={product.quantity}
                              onChange={(e) => handleTopFeedingProductChange(appIndex, productIndex, 'quantity', e.target.value)}
                              className="w-20 border rounded px-2 py-1 text-sm"
                            />
                            {app.products.length > 1 && (
                              <button
                                onClick={() => removeTopFeedingProduct(appIndex, productIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addTopFeedingProduct(appIndex)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          + Ürün Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sera İçi Kontroller */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-4">Sera İçi Kontroller</h2>
            
            <div className="space-y-4">
              {/* Parameters */}
              <div className="bg-green-500 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sera Isısı:</span>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={greenhouseControls.temperature}
                        onChange={(e) => handleGreenhouseControlChange('temperature', e.target.value)}
                        className="w-16 text-center border rounded px-2 py-1"
                      />
                      <span className="ml-1">°C</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Sera Nemi:</span>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={greenhouseControls.humidity}
                        onChange={(e) => handleGreenhouseControlChange('humidity', e.target.value)}
                        className="w-16 text-center border rounded px-2 py-1"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Su EC:</span>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={greenhouseControls.waterEC}
                        onChange={(e) => handleGreenhouseControlChange('waterEC', e.target.value)}
                        className="w-20 text-center border rounded px-2 py-1"
                      />
                      <span className="ml-1">dS/m</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Su pH:</span>
                    <input
                      type="text"
                      value={greenhouseControls.waterPH}
                      onChange={(e) => handleGreenhouseControlChange('waterPH', e.target.value)}
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Kökte problem yok:</span>
                    <span>{greenhouseControls.rootProblem ? '✗' : '✓'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vejetatif aksamda problem yok:</span>
                    <span>{greenhouseControls.vegetativeProblem ? '✗' : '✓'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generatif aksamda problem yok:</span>
                    <span>{greenhouseControls.generativeProblem ? '✗' : '✓'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ortalama Brix değeri:</span>
                    <input
                      type="text"
                      value={greenhouseControls.averageBrix}
                      onChange={(e) => handleGreenhouseControlChange('averageBrix', e.target.value)}
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Ortalama klorofil değeri:</span>
                    <input
                      type="text"
                      value={greenhouseControls.averageChlorophyll}
                      onChange={(e) => handleGreenhouseControlChange('averageChlorophyll', e.target.value)}
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Ortalama ışık değerleri:</span>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={greenhouseControls.averageLight}
                        onChange={(e) => handleGreenhouseControlChange('averageLight', e.target.value)}
                        className="w-24 text-center border rounded px-2 py-1"
                      />
                      <span className="ml-1">lux</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultant Notes */}
              <div className="bg-green-500 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Danışman Notu:</h3>
                <ul className="space-y-1 text-sm">
                  {consultantNotes.map((note) => (
                    <li key={note.id} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{note.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hava Durumu */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-2">Hava Durumu</h2>
            <p className="text-center text-gray-600 mb-4">10 GÜNLÜK TAHMIN</p>
            
            <div className="bg-green-500 rounded-lg p-4">
              <div className="space-y-3">
                {weatherForecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-12 text-sm">{day.day}</span>
                      <span className="text-lg">{day.icon}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{day.minTemp}</span>
                      <div className="w-16 h-1 bg-gray-300 rounded-full">
                        <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
                      </div>
                      <span className="text-sm">{day.maxTemp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate('/recipe')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Geri Dön
          </button>
          <button
            onClick={() => {
              // Save recipe logic here
              console.log('Recipe saved:', {
                fertilizationApplications,
                topFeedingApplications,
                greenhouseControls
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Reçeteyi Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCreate; 