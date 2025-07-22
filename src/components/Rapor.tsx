import React, { useState } from 'react';

const Rapor = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedChart, setSelectedChart] = useState('production');

  const performanceData = {
    totalProduction: 3500,
    totalRevenue: 28750,
    totalCost: 12500,
    profit: 16250,
    efficiency: 92,
    growthRate: 15.5
  };

  const monthlyData = [
    { month: 'Ocak', production: 2800, revenue: 23500, cost: 11200 },
    { month: 'Şubat', production: 3200, revenue: 26800, cost: 12100 },
    { month: 'Mart', production: 3500, revenue: 28750, cost: 12500 },
    { month: 'Nisan', production: 3100, revenue: 25900, cost: 11800 },
    { month: 'Mayıs', production: 3400, revenue: 28200, cost: 12300 },
    { month: 'Haziran', production: 3600, revenue: 29500, cost: 12700 }
  ];

  const alerts = [
    { type: 'success', message: 'Bu ay hedeflenen üretim miktarı %105 oranında gerçekleşti', time: '2 saat önce' },
    { type: 'warning', message: 'Sera 3\'te nem seviyesi optimal aralığın üstünde', time: '4 saat önce' },
    { type: 'info', message: 'Yeni hasat dönemi için planlama tamamlandı', time: '1 gün önce' }
  ];

  const topPerformers = [
    { name: 'Sera 1', production: 1200, efficiency: 98 },
    { name: 'Sera 2', production: 980, efficiency: 95 },
    { name: 'Sera 4', production: 850, efficiency: 88 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Raporlar ve Analiz</h1>
          <p className="text-slate-600 mt-1">Sera performans verileri ve istatistikler</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
          
          <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200">
            📊 Rapor İndir
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🌱</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Toplam Üretim</h3>
              <p className="text-slate-600 text-sm">Bu ay</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{performanceData.totalProduction.toLocaleString()}</p>
          <p className="text-slate-600 text-sm">kg</p>
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-emerald-600 text-sm">↗️ +{performanceData.growthRate}%</span>
            <span className="text-slate-500 text-xs">geçen aya göre</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Net Kâr</h3>
              <p className="text-slate-600 text-sm">Bu ay</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">₺{performanceData.profit.toLocaleString()}</p>
          <p className="text-slate-600 text-sm">TL</p>
          <div className="mt-2 text-xs text-slate-500">
            Gelir: ₺{performanceData.totalRevenue.toLocaleString()} - Gider: ₺{performanceData.totalCost.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Verimlilik</h3>
              <p className="text-slate-600 text-sm">Ortalama</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{performanceData.efficiency}%</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${performanceData.efficiency}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Aylık Performans</h3>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="px-3 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="production">Üretim</option>
              <option value="revenue">Gelir</option>
              <option value="cost">Maliyet</option>
            </select>
          </div>

          {/* Simple Bar Chart Visualization */}
          <div className="space-y-3">
            {monthlyData.slice(-6).map((data, index) => {
              const value = selectedChart === 'production' ? data.production : 
                           selectedChart === 'revenue' ? data.revenue : data.cost;
              const maxValue = Math.max(...monthlyData.map(d => 
                selectedChart === 'production' ? d.production : 
                selectedChart === 'revenue' ? d.revenue : d.cost
              ));
              const percentage = (value / maxValue) * 100;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-slate-600">{data.month}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-xs text-slate-800 font-medium text-right">
                    {selectedChart === 'production' ? `${value.toLocaleString()} kg` : 
                     `₺${value.toLocaleString()}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">En İyi Performans</h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{performer.name}</p>
                    <p className="text-xs text-slate-600">{performer.production} kg üretim</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{performer.efficiency}%</p>
                  <p className="text-xs text-slate-500">verimlilik</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Son Bildirimler</h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                alert.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <span className="text-lg">
                {alert.type === 'success' ? '✅' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <p className={`text-sm ${
                  alert.type === 'success' ? 'text-emerald-800' :
                  alert.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alert.message}
                </p>
                <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rapor; 