import { useState } from 'react';
import { FaChartLine, FaTable, FaFilePdf, FaFilter, FaSync, FaTimes } from 'react-icons/fa';
import type { ReportFilters as ReportFiltersType, ReportData } from '../types/reports';
import { getDefaultFilters, generateReportData } from '../utils/reportUtils';

// Components
import React from 'react';
const ReportFiltersComponent = React.lazy(() => import('./reports/ReportFilters'));
import ReportSummary from './reports/ReportSummary';
import ReportCharts from './reports/ReportCharts';
import ReportTable from './reports/ReportTable';
import ReportPDFExport from './reports/ReportPDFExport';

const Rapor = () => {
  const [filters, setFilters] = useState<ReportFiltersType>(getDefaultFilters());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'summary' | 'charts' | 'table' | 'export'>('summary');
  const [error, setError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Rapor oluşturma
  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await generateReportData(filters);
      setReportData(data);
      
      // Mobilde rapor oluşturulduktan sonra filtreleri kapat
      if (window.innerWidth < 768) {
        setIsFiltersOpen(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rapor oluşturulurken bir hata oluştu';
      setError(errorMessage);
      setReportData(null); // Hata durumunda mevcut rapor verisini temizle
      console.error('Rapor oluşturma hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Hata türüne göre icon ve stil belirle
  const getErrorDisplayConfig = (errorMessage: string) => {
    if (errorMessage.includes('hiç veri bulunamadı') || errorMessage.includes('sistemde hiç veri')) {
      return {
        icon: '📭',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        title: 'Veri Bulunamadı',
        suggestions: [
          'Önce üretici bilgilerini ekleyin',
          'Sera alanlarını tanımlayın', 
          'Hasat verilerini girin'
        ]
      };
    } else if (errorMessage.includes('tarih aralığında') || errorMessage.includes('dönemde')) {
      return {
        icon: '📅',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-800',
        textColor: 'text-orange-700',
        title: 'Seçilen Dönemde Veri Yok',
        suggestions: [
          'Farklı bir tarih aralığı seçin',
          'Tüm üreticileri dahil edin',
          'Filtreleri sıfırlayın'
        ]
      };
    } else if (errorMessage.includes('filtrelere uygun') || errorMessage.includes('seçilen')) {
      return {
        icon: '🔍',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        title: 'Filtre Sonucu Bulunamadı',
        suggestions: [
          'Filtre seçimlerinizi gözden geçirin',
          'Daha geniş tarih aralığı seçin',
          'Tüm üreticileri dahil edin'
        ]
      };
    } else {
      return {
        icon: '⚠️',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        title: 'Hata Oluştu',
        suggestions: [
          'Sayfayı yenileyip tekrar deneyin',
          'İnternet bağlantınızı kontrol edin',
          'Sorun devam ederse yöneticiye başvurun'
        ]
      };
    }
  };

  // Navigasyon seçenekleri
  const viewOptions = [
    { key: 'summary', label: 'Özet', icon: FaChartLine, description: 'KPI\'lar ve temel metrikler', mobileLabel: 'Özet' },
    { key: 'charts', label: 'Grafikler', icon: FaChartLine, description: 'Görsel analizler ve trendler', mobileLabel: 'Grafik' },
    { key: 'table', label: 'Detaylı Veri', icon: FaTable, description: 'Tablo halinde detaylı veriler', mobileLabel: 'Tablo' },
    { key: 'export', label: 'PDF İndir', icon: FaFilePdf, description: 'Raporu PDF olarak kaydet', mobileLabel: 'PDF' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFiltersOpen(false)} />
          <div className="relative bg-white h-full w-full max-w-sm overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <React.Suspense fallback={<div>Loading filters...</div>}>
                <ReportFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onGenerateReport={handleGenerateReport}
                  isLoading={isLoading}
                  isMobile={true}
                />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Geri Gitme Butonu */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Geri Dön</span>
          </button>
        </div>
        
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Raporlar</h1>
              <p className="text-sm text-slate-600">Sera performans analizi</p>
            </div>
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FaFilter className="w-4 h-4" />
              <span>Filtreler</span>
            </button>
          </div>

          {/* Mobile Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {reportData && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border">
                <FaSync className="w-3 h-3" />
                <span>Son güncelleme: {new Date(reportData.generatedAt).toLocaleString('tr-TR')}</span>
              </div>
            )}
            
            {reportData && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Rapor hazır</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
            <div className="mb-6 xl:mb-0">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Raporlar ve Analiz</h1>
              <p className="text-slate-600">Sera performans verileri ve detaylı istatistikler</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {reportData && (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border">
                  <FaSync className="w-4 h-4" />
                  <span>Son güncelleme: {new Date(reportData.generatedAt).toLocaleString('tr-TR')}</span>
                </div>
              )}
              
              {reportData && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Rapor hazır</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            {(() => {
              const config = getErrorDisplayConfig(error);
              return (
                <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 lg:p-6`}>
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
                      <span className="text-lg lg:text-2xl">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base lg:text-lg font-semibold ${config.titleColor} mb-2`}>{config.title}</h3>
                      <p className={`${config.textColor} mb-4 text-sm lg:text-base leading-relaxed`}>{error}</p>
                      
                      {config.suggestions && (
                        <div className="space-y-2">
                          <p className={`text-xs lg:text-sm font-medium ${config.titleColor}`}>Öneriler:</p>
                          <ul className="space-y-1">
                            {config.suggestions.map((suggestion, index) => (
                              <li key={index} className={`flex items-center text-xs lg:text-sm ${config.textColor}`}>
                                <span className="w-1.5 h-1.5 bg-current rounded-full mr-2 flex-shrink-0"></span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-4 flex flex-col sm:flex-row gap-2 lg:gap-3">
                        <button
                          onClick={handleGenerateReport}
                          disabled={isLoading}
                          className={`inline-flex items-center justify-center px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${config.iconColor} ${config.iconBg} hover:opacity-80 disabled:opacity-50`}
                        >
                          <FaSync className="w-4 h-4 mr-2" />
                          Tekrar Dene
                        </button>
                        
                        <button
                          onClick={() => {
                            setFilters(getDefaultFilters());
                            setError(null);
                            setReportData(null);
                          }}
                          className="inline-flex items-center justify-center px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FaFilter className="w-4 h-4 mr-2" />
                          Filtreleri Sıfırla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-6">
              <React.Suspense fallback={<div>Loading filters...</div>}>
                <ReportFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onGenerateReport={handleGenerateReport}
                  isLoading={isLoading}
                  isMobile={false}
                />
              </React.Suspense>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Mobile Navigation */}
            {reportData && (
              <div className="lg:hidden">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-slate-800 mb-3">Rapor Görünümü</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {viewOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.key}
                          onClick={() => setCurrentView(option.key as 'summary' | 'charts' | 'table' | 'export')}
                          className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-200 ${
                            currentView === option.key
                              ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-600'
                              : 'bg-gray-50 border-2 border-transparent text-slate-600 hover:bg-gray-100'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-xs font-medium">{option.mobileLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            {reportData && (
              <div className="hidden lg:block">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Rapor Görünümü</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {viewOptions.find(opt => opt.key === currentView)?.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 rounded-lg p-1">
                        {viewOptions.map(option => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.key}
                              onClick={() => setCurrentView(option.key as 'summary' | 'charts' | 'table' | 'export')}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                                currentView === option.key
                                  ? 'bg-white shadow-sm text-emerald-600 font-medium border border-emerald-200'
                                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                              <span className="hidden xl:inline text-sm">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content States */}
            {!reportData && !isLoading ? (
              /* Welcome State */
              <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-xl border border-emerald-200 p-6 lg:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-4xl lg:text-6xl mb-4 lg:mb-6">📊</div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3">Rapor Oluşturmaya Başlayın</h3>
                  <p className="text-slate-600 mb-6 text-sm lg:text-base leading-relaxed">
                    Filtreleri kullanarak özelleştirilmiş raporlar oluşturun ve verilerinizi analiz edin.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs lg:text-sm text-slate-500 bg-white/50 rounded-lg px-4 py-2">
                    <FaFilter className="w-4 h-4" />
                    <span className="lg:hidden">Filtreler butonuna dokunun</span>
                    <span className="hidden lg:inline">Filtreleri ayarlayın ve "Rapor Oluştur" butonuna tıklayın</span>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              /* Loading State */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full mb-6">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3">Rapor Oluşturuluyor...</h3>
                  <p className="text-slate-600 text-sm lg:text-base">Veriler analiz ediliyor, lütfen bekleyin</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ) : reportData ? (
              /* Report Content */
              <div className="space-y-6">
                {currentView === 'summary' && (
                  <ReportSummary 
                    kpis={reportData.kpis} 
                    trends={reportData.trends}
                  />
                )}
                
                {currentView === 'charts' && (
                  <ReportCharts 
                    timeSeriesData={reportData.timeSeriesData}
                    producerPerformances={reportData.producerPerformances}
                    greenhousePerformances={reportData.greenhousePerformances}
                    cropAnalyses={reportData.cropAnalyses}
                  />
                )}
                
                {currentView === 'table' && (
                  <ReportTable 
                    producerPerformances={reportData.producerPerformances}
                    greenhousePerformances={reportData.greenhousePerformances}
                    cropAnalyses={reportData.cropAnalyses}
                  />
                )}
                
                {currentView === 'export' && (
                  <ReportPDFExport 
                    reportData={reportData}
                    isGenerating={false}
                    onExportPDF={handleGenerateReport}
                  />
                )}
              </div>
            ) : null}

            {/* Quick Stats - Sadece rapor varken göster */}
            {reportData && currentView !== 'export' && (
              <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-xl p-4 lg:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base lg:text-lg font-semibold">🎯 Hızlı İstatistikler</h4>
                  <div className="text-xs opacity-75 bg-white/20 px-2 py-1 rounded">
                    Rapor ID: {reportData.reportId.split('_')[1]}
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-xl lg:text-2xl font-bold">{reportData.producerPerformances.length}</div>
                    <div className="text-xs lg:text-sm opacity-90">Aktif Üretici</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-xl lg:text-2xl font-bold">{reportData.greenhousePerformances.length}</div>
                    <div className="text-xs lg:text-sm opacity-90">Sera</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-xl lg:text-2xl font-bold">{reportData.cropAnalyses.length}</div>
                    <div className="text-xs lg:text-sm opacity-90">Ürün Türü</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-xl lg:text-2xl font-bold">{reportData.kpis.completedHarvests}</div>
                    <div className="text-xs lg:text-sm opacity-90">Tamamlanan Hasat</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rapor; 