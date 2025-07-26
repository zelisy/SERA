import React from 'react';
import { FaArrowUp as TrendingUp, FaArrowDown as TrendingDown, FaMinus as Minus, FaDollarSign as DollarSign, FaBox as Package, FaChartBar as BarChart3, FaUsers as Users, FaBullseye as Target, FaLeaf, FaIndustry } from 'react-icons/fa';
import type { KPIMetrics, TrendAnalysis } from '../../types/reports';
import { formatCurrency, formatNumber, formatPercentage, formatWeight, formatArea } from '../../utils/reportUtils';

interface ReportSummaryProps {
  kpis: KPIMetrics;
  trends?: TrendAnalysis[];
  isLoading?: boolean;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ kpis, trends = [], isLoading = false }) => {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-400';
  };

  const kpiCards = [
    {
      title: 'Toplam Üretim',
      value: formatWeight(kpis.totalProduction),
      icon: Package,
      gradient: 'from-emerald-400 to-green-500',
      change: kpis.productionGrowth,
      subtitle: 'Bu dönem',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(kpis.totalRevenue),
      icon: DollarSign,
      gradient: 'from-blue-400 to-blue-500',
      change: kpis.revenueGrowth,
      subtitle: 'Net ciro',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Net Kâr',
      value: formatCurrency(kpis.netProfit),
      icon: TrendingUp,
      gradient: 'from-purple-400 to-purple-500',
      change: kpis.profitMargin,
      subtitle: 'Kâr marjı: ' + formatPercentage(kpis.profitMargin),
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Ortalama Fiyat',
      value: formatCurrency(kpis.averagePrice) + '/kg',
      icon: BarChart3,
      gradient: 'from-orange-400 to-red-500',
      change: 0,
      subtitle: 'Pazar fiyatı',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Verimlilik',
      value: formatPercentage(kpis.averageEfficiency),
      icon: Target,
      gradient: 'from-pink-400 to-rose-500',
      change: 0,
      subtitle: 'Ortalama',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Aktif Üretici',
      value: formatNumber(kpis.activeProducers),
      icon: Users,
      gradient: 'from-indigo-400 to-indigo-500',
      change: 0,
      subtitle: formatNumber(kpis.completedHarvests) + ' hasat',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ana Metrikler */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Temel Performans Göstergeleri</h3>
            <p className="text-slate-600 mt-1">Seçilen dönem için ana metrikler</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-gray-50 px-3 py-1 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Canlı Veri</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{card.title}</h4>
                      <p className="text-slate-600 text-sm">{card.subtitle}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                  
                  {card.change !== 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(card.change)}
                        <span className={`text-sm font-medium ${getTrendColor(card.change)}`}>
                          {card.change > 0 ? '+' : ''}{formatPercentage(card.change)}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs">önceki döneme göre</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detaylı Metrikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Üretim Detayları */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-emerald-50">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <FaLeaf className="w-5 h-5 mr-3 text-emerald-600" />
              Üretim Detayları
            </h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Toplam Üretim', value: formatWeight(kpis.totalProduction), icon: '📦' },
                { label: 'Ortalama Verim', value: `${formatNumber(kpis.yieldPerDecareAvg, 1)} kg/da`, icon: '🌾' },
                { label: 'Tamamlanan Hasat', value: `${formatNumber(kpis.completedHarvests)} adet`, icon: '🚜' },
                { label: 'Toplam Alan', value: formatArea(kpis.totalGreenhouseArea * 1000), icon: '🏞️' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finansal Detaylar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <DollarSign className="w-5 h-5 mr-3 text-blue-600" />
              Finansal Detaylar
            </h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { label: 'Toplam Gelir', value: formatCurrency(kpis.totalRevenue), color: 'text-emerald-600', icon: '💰' },
                { label: 'Toplam Maliyet', value: formatCurrency(kpis.totalCost), color: 'text-red-600', icon: '💸' },
                { label: 'Net Kâr', value: formatCurrency(kpis.netProfit), color: kpis.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600', icon: '💵' },
                { label: 'Kâr Marjı', value: formatPercentage(kpis.profitMargin), color: kpis.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600', icon: '📈' },
                { label: 'Ortalama Fiyat', value: `${formatCurrency(kpis.averagePrice)}/kg`, color: 'text-slate-800', icon: '🏷️' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </div>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analizleri */}
      {trends.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-purple-50">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-3 text-purple-600" />
              Trend Analizleri
            </h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((trend, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">{trend.metric}</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(trend.change)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-xl font-bold ${getTrendColor(trend.change)}`}>
                      {trend.change > 0 ? '+' : ''}{formatPercentage(trend.change)}
                    </p>
                    <p className="text-sm text-slate-600">{trend.direction}</p>
                    <p className="text-xs text-slate-500">{trend.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performans Göstergeleri */}
      <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-xl border border-emerald-200 overflow-hidden">
        <div className="p-6 border-b border-emerald-200 bg-white/50">
          <h4 className="text-lg font-semibold text-slate-800 flex items-center">
            <FaIndustry className="w-5 h-5 mr-3 text-slate-600" />
            Performans Skorları
          </h4>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Verimlilik Skoru */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - kpis.averageEfficiency / 100)}`}
                    className="text-emerald-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-800">{formatNumber(kpis.averageEfficiency)}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">Verimlilik</p>
              <p className="text-xs text-slate-500 mt-1">Sera ortalaması</p>
            </div>

            {/* Kârlılık Skoru */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.max(0, kpis.profitMargin) / 100)}`}
                    className="text-blue-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-800">{formatNumber(Math.max(0, kpis.profitMargin))}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">Kârlılık</p>
              <p className="text-xs text-slate-500 mt-1">Kâr marjı</p>
            </div>

            {/* Büyüme Skoru */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.max(0, Math.min(100, kpis.productionGrowth + 50)) / 100)}`}
                    className="text-purple-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-800">
                    {kpis.productionGrowth > 0 ? '+' : ''}{formatNumber(kpis.productionGrowth)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">Büyüme</p>
              <p className="text-xs text-slate-500 mt-1">Üretim artışı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary; 