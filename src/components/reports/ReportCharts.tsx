import React, { useState } from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa';
import type { TimeSeriesData, ProducerPerformance, GreenhousePerformance, CropAnalysis, ChartType } from '../../types/reports';
import { formatCurrency, formatNumber, formatWeight, formatPercentage } from '../../utils/reportUtils';

interface ReportChartsProps {
  timeSeriesData: TimeSeriesData[];
  producerPerformances: ProducerPerformance[];
  greenhousePerformances: GreenhousePerformance[];
  cropAnalyses: CropAnalysis[];
  isLoading?: boolean;
}

const ReportCharts: React.FC<ReportChartsProps> = ({
  timeSeriesData,
  producerPerformances,
  greenhousePerformances,
  cropAnalyses,
  isLoading = false
}) => {
  const [selectedTimeSeriesMetric, setSelectedTimeSeriesMetric] = useState<'production' | 'revenue' | 'profit'>('production');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('bar');

  const chartTypes = [
    { value: 'bar' as ChartType, label: 'Çubuk Grafik', icon: FaChartBar },
    { value: 'line' as ChartType, label: 'Çizgi Grafik', icon: FaChartLine },
    { value: 'area' as ChartType, label: 'Alan Grafik', icon: FaChartArea },
    { value: 'pie' as ChartType, label: 'Pasta Grafik', icon: FaChartPie }
  ];

  const timeSeriesMetrics = [
    { value: 'production' as const, label: 'Üretim', color: 'emerald', unit: 'kg' },
    { value: 'revenue' as const, label: 'Gelir', color: 'blue', unit: 'TL' },
    { value: 'profit' as const, label: 'Kâr', color: 'purple', unit: 'TL' }
  ];

  // Zaman serisi verisi için maksimum değer hesaplama
  const getMaxValue = (metric: string) => {
    return Math.max(...timeSeriesData.map(d => d[metric as keyof TimeSeriesData] as number));
  };

  // Bar chart component
  const BarChart: React.FC<{ data: any[]; dataKey: string; color: string; maxValue: number }> = ({ 
    data, dataKey, color, maxValue 
  }) => (
    <div className="space-y-2">
      {data.map((item, index) => {
        const value = item[dataKey];
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-xs text-slate-600 truncate">
              {item.date || item.name || `Item ${index + 1}`}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
              <div
                className={`bg-gradient-to-r from-${color}-400 to-${color}-500 h-3 rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="w-24 text-xs text-slate-800 font-medium text-right">
              {typeof value === 'number' ? (
                dataKey.includes('revenue') || dataKey.includes('profit') || dataKey.includes('cost') ?
                formatCurrency(value) : 
                dataKey.includes('production') || dataKey.includes('weight') ?
                formatWeight(value) :
                formatNumber(value)
              ) : value}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Line chart simulation component
  const LineChart: React.FC<{ data: any[]; dataKey: string; color: string }> = ({ 
    data, dataKey, color 
  }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = Math.min(...data.map(d => d[dataKey]));
    const range = maxValue - minValue;
    
    return (
      <div className="relative h-48 bg-slate-50 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke={`rgb(var(--color-${color}-500))`}
            strokeWidth="3"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = range > 0 ? 160 - ((item[dataKey] - minValue) / range) * 160 : 80;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = range > 0 ? 160 - ((item[dataKey] - minValue) / range) * 160 : 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={`rgb(var(--color-${color}-500))`}
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-600 px-4">
          {data.slice(0, 5).map((item, index) => (
            <span key={index}>{item.date || `P${index + 1}`}</span>
          ))}
        </div>
      </div>
    );
  };

  // Pie chart simulation component
  const PieChart: React.FC<{ data: any[]; dataKey: string; nameKey: string }> = ({ 
    data, dataKey, nameKey 
  }) => {
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    let currentAngle = 0;
    
    const colors = ['emerald', 'blue', 'purple', 'orange', 'pink', 'indigo'];
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.slice(0, 6).map((item, index) => {
              const percentage = (item[dataKey] / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startRadians = (startAngle * Math.PI) / 180;
              const endRadians = (endAngle * Math.PI) / 180;
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const x1 = 100 + 80 * Math.cos(startRadians);
              const y1 = 100 + 80 * Math.sin(startRadians);
              const x2 = 100 + 80 * Math.cos(endRadians);
              const y2 = 100 + 80 * Math.sin(endRadians);
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={`rgb(var(--color-${colors[index % colors.length]}-500))`}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="ml-6 space-y-2">
          {data.slice(0, 6).map((item, index) => {
            const percentage = ((item[dataKey] / total) * 100);
            return (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded bg-${colors[index % colors.length]}-500`}
                ></div>
                <span className="text-sm text-slate-700">
                  {item[nameKey]} ({formatPercentage(percentage)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zaman Serisi Grafiği */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 lg:mb-0">Zaman Serisi Analizi</h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Metric Selector */}
            <select
              value={selectedTimeSeriesMetric}
              onChange={(e) => setSelectedTimeSeriesMetric(e.target.value as any)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            >
              {timeSeriesMetrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
            
            {/* Chart Type Selector */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              {chartTypes.slice(0, 3).map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedChartType(type.value)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      selectedChartType === type.value
                        ? 'bg-white shadow-sm text-emerald-600'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {timeSeriesData.length > 0 ? (
          <div>
            {selectedChartType === 'bar' && (
              <BarChart
                data={timeSeriesData}
                dataKey={selectedTimeSeriesMetric}
                color={timeSeriesMetrics.find(m => m.value === selectedTimeSeriesMetric)?.color || 'emerald'}
                maxValue={getMaxValue(selectedTimeSeriesMetric)}
              />
            )}
            
            {selectedChartType === 'line' && (
              <LineChart
                data={timeSeriesData}
                dataKey={selectedTimeSeriesMetric}
                color={timeSeriesMetrics.find(m => m.value === selectedTimeSeriesMetric)?.color || 'emerald'}
              />
            )}
            
            {selectedChartType === 'area' && (
              <LineChart
                data={timeSeriesData}
                dataKey={selectedTimeSeriesMetric}
                color={timeSeriesMetrics.find(m => m.value === selectedTimeSeriesMetric)?.color || 'emerald'}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FaChartLine className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Zaman serisi verisi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Üretici Performans Grafiği */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Üretici Performansı</h3>
        
        {producerPerformances.length > 0 ? (
          <BarChart
            data={producerPerformances.slice(0, 10).map(p => ({
              name: `${p.producer.firstName} ${p.producer.lastName}`,
              production: p.production,
              revenue: p.revenue,
              profit: p.profit
            }))}
            dataKey="production"
            color="emerald"
            maxValue={Math.max(...producerPerformances.map(p => p.production))}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FaChartBar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Üretici performans verisi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Ürün Dağılım Grafiği */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Ürün Bazlı Analiz</h3>
        
        {cropAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Üretim Dağılımı */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-4">Üretim Dağılımı</h4>
              <PieChart
                data={cropAnalyses}
                dataKey="totalProduction"
                nameKey="cropType"
              />
            </div>
            
            {/* Gelir Dağılımı */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-4">Gelir Dağılımı</h4>
              <PieChart
                data={cropAnalyses}
                dataKey="totalRevenue"
                nameKey="cropType"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FaChartPie className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Ürün analiz verisi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Sera Verimliliği */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Sera Verimliliği</h3>
        
        {greenhousePerformances.length > 0 ? (
          <BarChart
            data={greenhousePerformances.slice(0, 10).map(gh => ({
              name: `${gh.greenhouse.mahalle} - ${gh.greenhouse.urunIsmi}`,
              efficiency: gh.efficiency,
              yieldPerDecare: gh.yieldPerDecare,
              revenue: gh.revenue
            }))}
            dataKey="efficiency"
            color="blue"
            maxValue={Math.max(...greenhousePerformances.map(gh => gh.efficiency))}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FaChartArea className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Sera performans verisi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Verimlilik Karşılaştırması */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Verimlilik Karşılaştırması</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* En Yüksek Üretim */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-3">En Yüksek Üretim</h4>
            {producerPerformances.slice(0, 3).map((producer, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span className="text-sm text-emerald-700">
                  {producer.producer.firstName} {producer.producer.lastName}
                </span>
                <span className="font-semibold text-emerald-800">
                  {formatWeight(producer.production)}
                </span>
              </div>
            ))}
          </div>

          {/* En Yüksek Verimlilik */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">En Yüksek Verimlilik</h4>
            {greenhousePerformances
              .sort((a, b) => b.efficiency - a.efficiency)
              .slice(0, 3)
              .map((greenhouse, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-700 truncate">
                    {greenhouse.greenhouse.mahalle}
                  </span>
                  <span className="font-semibold text-blue-800">
                    {formatPercentage(greenhouse.efficiency)}
                  </span>
                </div>
              ))}
          </div>

          {/* En Karlı Ürünler */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3">En Karlı Ürünler</h4>
            {cropAnalyses
              .sort((a, b) => b.profitMargin - a.profitMargin)
              .slice(0, 3)
              .map((crop, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-700">
                    {crop.cropType}
                  </span>
                  <span className="font-semibold text-purple-800">
                    {formatPercentage(crop.profitMargin)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCharts; 