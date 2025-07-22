import React, { useState, useEffect } from 'react';

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
  const [lastUpdate, setLastUpdate] = useState(new Date());

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