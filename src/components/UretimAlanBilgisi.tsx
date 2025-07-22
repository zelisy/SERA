import React, { useState } from 'react';

interface ProductionArea {
  id: string;
  name: string;
  area: number;
  plantType: string;
  status: 'active' | 'inactive' | 'maintenance';
  plantingDate: string;
  expectedHarvest: string;
  currentYield?: number;
  efficiency: number;
}

const UretimAlanBilgisi = () => {
  const [productionAreas] = useState<ProductionArea[]>([
    {
      id: '1',
      name: 'Sera 1',
      area: 500,
      plantType: 'Domates',
      status: 'active',
      plantingDate: '2024-03-15',
      expectedHarvest: '2024-06-15',
      currentYield: 1200,
      efficiency: 95
    },
    {
      id: '2',
      name: 'Sera 2',
      area: 300,
      plantType: 'Salatalık',
      status: 'active',
      plantingDate: '2024-04-01',
      expectedHarvest: '2024-07-01',
      currentYield: 800,
      efficiency: 88
    },
    {
      id: '3',
      name: 'Sera 3',
      area: 400,
      plantType: 'Biber',
      status: 'maintenance',
      plantingDate: '2024-02-20',
      expectedHarvest: '2024-05-20',
      efficiency: 0
    },
    {
      id: '4',
      name: 'Sera 4',
      area: 600,
      plantType: 'Patlıcan',
      status: 'inactive',
      plantingDate: '',
      expectedHarvest: '',
      efficiency: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'from-emerald-400 to-green-500',
      'inactive': 'from-gray-400 to-gray-500',
      'maintenance': 'from-yellow-400 to-orange-500'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      'active': 'Aktif',
      'inactive': 'Pasif',
      'maintenance': 'Bakım'
    };
    return texts[status as keyof typeof texts];
  };

  const getPlantIcon = (plantType: string) => {
    const icons: Record<string, string> = {
      'Domates': '🍅',
      'Salatalık': '🥒',
      'Biber': '🌶️',
      'Patlıcan': '🍆'
    };
    return icons[plantType] || '🌱';
  };

  const totalArea = productionAreas.reduce((sum, area) => sum + area.area, 0);
  const activeAreas = productionAreas.filter(area => area.status === 'active');
  const totalYield = activeAreas.reduce((sum, area) => sum + (area.currentYield || 0), 0);
  const avgEfficiency = activeAreas.length > 0 
    ? activeAreas.reduce((sum, area) => sum + area.efficiency, 0) / activeAreas.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Üretim Alan Bilgileri</h1>
        <p className="text-slate-600 mt-1">Sera alanları ve üretim durumu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏭</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Toplam Alan</h3>
              <p className="text-slate-600 text-sm">m²</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalArea.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Aktif Sera</h3>
              <p className="text-slate-600 text-sm">adet</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{activeAreas.length}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Toplam Üretim</h3>
              <p className="text-slate-600 text-sm">kg</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalYield.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Ortalama Verim</h3>
              <p className="text-slate-600 text-sm">%</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{avgEfficiency.toFixed(1)}</p>
        </div>
      </div>

      {/* Production Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {productionAreas.map((area) => (
          <div
            key={area.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getPlantIcon(area.plantType)}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{area.name}</h3>
                  <p className="text-slate-600">{area.plantType}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(area.status)} text-white`}>
                {getStatusText(area.status)}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-slate-600 text-sm">Alan</p>
                <p className="font-semibold text-slate-800">{area.area} m²</p>
              </div>
              <div>
                <p className="text-slate-600 text-sm">Verimlilik</p>
                <p className="font-semibold text-slate-800">{area.efficiency}%</p>
              </div>
            </div>

            {area.status === 'active' && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">Dikim Tarihi</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(area.plantingDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Tahmini Hasat</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(area.expectedHarvest).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {area.currentYield && (
                  <div className="mb-4">
                    <p className="text-slate-600 text-sm mb-2">Mevcut Üretim</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, area.efficiency)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-emerald-600">{area.currentYield} kg</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {area.status === 'maintenance' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-yellow-800 text-sm font-medium">Bakım Devam Ediyor</span>
                </div>
              </div>
            )}

            {area.status === 'inactive' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">⏸️</span>
                  <span className="text-gray-800 text-sm font-medium">Sera Kullanılmıyor</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UretimAlanBilgisi; 