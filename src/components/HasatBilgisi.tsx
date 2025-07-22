import React, { useState } from 'react';

interface HarvestData {
  id: string;
  product: string;
  quantity: number;
  date: string;
  quality: 'A' | 'B' | 'C';
  price: number;
  buyer?: string;
}

const HasatBilgisi = () => {
  const [harvestData] = useState<HarvestData[]>([
    {
      id: '1',
      product: 'Domates',
      quantity: 1200,
      date: '2024-06-05',
      quality: 'A',
      price: 8.50,
      buyer: 'Migros'
    },
    {
      id: '2',
      product: 'Salatalık',
      quantity: 800,
      date: '2024-06-03',
      quality: 'A',
      price: 6.25,
      buyer: 'Carrefour'
    },
    {
      id: '3',
      product: 'Domates',
      quantity: 950,
      date: '2024-05-28',
      quality: 'B',
      price: 7.20,
      buyer: 'Şok Market'
    },
    {
      id: '4',
      product: 'Biber',
      quantity: 450,
      date: '2024-05-25',
      quality: 'A',
      price: 12.00,
      buyer: 'A101'
    },
    {
      id: '5',
      product: 'Salatalık',
      quantity: 650,
      date: '2024-05-20',
      quality: 'C',
      price: 4.80
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'quantity' | 'price'>('date');

  const getProductIcon = (product: string) => {
    const icons: Record<string, string> = {
      'Domates': '🍅',
      'Salatalık': '🥒',
      'Biber': '🌶️',
      'Patlıcan': '🍆'
    };
    return icons[product] || '🌱';
  };

  const getQualityColor = (quality: string) => {
    const colors = {
      'A': 'from-emerald-400 to-green-500',
      'B': 'from-yellow-400 to-orange-500',
      'C': 'from-orange-400 to-red-500'
    };
    return colors[quality as keyof typeof colors] || colors['C'];
  };

  const filteredData = harvestData
    .filter(item => filter === 'all' || item.product === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const avgPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

  const products = Array.from(new Set(harvestData.map(item => item.product)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hasat Bilgileri</h1>
          <p className="text-slate-600 mt-1">Sera ürün hasat kayıtları ve analizi</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">Tüm Ürünler</option>
            {products.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'quantity' | 'price')}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="date">Tarihe Göre</option>
            <option value="quantity">Miktara Göre</option>
            <option value="price">Fiyata Göre</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Toplam Miktar</h3>
              <p className="text-slate-600 text-sm">Bu ay hasadı</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalQuantity.toLocaleString()}</p>
          <p className="text-slate-600 text-sm">kg</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Toplam Gelir</h3>
              <p className="text-slate-600 text-sm">Bu ay ciro</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">₺{totalRevenue.toLocaleString()}</p>
          <p className="text-slate-600 text-sm">TL</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Ortalama Fiyat</h3>
              <p className="text-slate-600 text-sm">kg başına</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">₺{avgPrice.toFixed(2)}</p>
          <p className="text-slate-600 text-sm">TL/kg</p>
        </div>
      </div>

      {/* Harvest Records */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Hasat Kayıtları</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ürün</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Miktar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kalite</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Fiyat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Toplam</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Alıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProductIcon(item.product)}</span>
                      <span className="font-medium text-slate-800">{item.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{item.quantity.toLocaleString()}</span>
                    <span className="text-slate-600 text-sm ml-1">kg</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getQualityColor(item.quality)} text-white`}>
                      Kalite {item.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">₺{item.price.toFixed(2)}</span>
                    <span className="text-slate-600 text-sm">/kg</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">
                      ₺{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.buyer ? (
                      <span className="font-medium text-slate-800">{item.buyer}</span>
                    ) : (
                      <span className="text-slate-400 italic">Beklemede</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">
                      {new Date(item.date).toLocaleDateString('tr-TR')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Hasat kaydı bulunamadı</h3>
            <p className="text-slate-600">Seçili filtrelere uygun hasat kaydı bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HasatBilgisi; 