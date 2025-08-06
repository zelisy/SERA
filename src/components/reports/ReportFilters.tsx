import React, { useState, useEffect } from 'react';
import { FaCalendar as Calendar, FaFilter as Filter, FaUsers as Users, FaArrowUp as TrendingUp, FaDownload as Download, FaCog, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import type { ReportFilters, ReportType } from '../../types/reports';
import type { Producer } from '../../types/producer';
import { getAllProducers } from '../../utils/firestoreUtils';
import { getDefaultFilters } from '../../utils/reportUtils';

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onGenerateReport: () => void;
  isLoading: boolean;
  isMobile?: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onGenerateReport,
  isLoading,
  isMobile = false
}) => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isMobile); // Mobilde kapalı başla
  const [loading, setLoading] = useState(true);
  const [producerSearchTerm, setProducerSearchTerm] = useState('');

  // Rapor türleri
  const reportTypes: { value: ReportType; label: string; icon: string }[] = [
    { value: 'production', label: 'Üretim Raporu', icon: '🌱' },
    { value: 'financial', label: 'Finansal Rapor', icon: '💰' },
    { value: 'greenhouse_control', label: 'Sera Kontrol', icon: '🏠' },
    { value: 'pre_planting', label: 'Dikim Öncesi', icon: '🌾' },
    { value: 'harvest', label: 'Hasat Raporu', icon: '🚜' },
    { value: 'comparison', label: 'Karşılaştırma', icon: '📊' }
  ];

  // Dönem seçenekleri
  const periodOptions = [
    { value: 'day', label: 'Günlük' },
    { value: 'week', label: 'Haftalık' },
    { value: 'month', label: 'Aylık' },
    { value: 'quarter', label: 'Çeyreklik' },
    { value: 'year', label: 'Yıllık' }
  ];





  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [producersData] = await Promise.all([
        getAllProducers()
      ]);
      setProducers(producersData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string | string[] | ReportType[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleProducerToggle = (producerId: string) => {
    const newProducers = filters.producers.includes(producerId)
      ? filters.producers.filter(id => id !== producerId)
      : [...filters.producers, producerId];
    
    handleFilterChange('producers', newProducers);
  };



  const handleReportTypeToggle = (reportType: ReportType) => {
    const newTypes = filters.reportTypes.includes(reportType)
      ? filters.reportTypes.filter(type => type !== reportType)
      : [...filters.reportTypes, reportType];
    
    handleFilterChange('reportTypes', newTypes);
  };



  const resetFilters = () => {
    onFiltersChange(getDefaultFilters());
  };

  const applyQuickFilter = (type: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => {
    const now = new Date();
    let startDate: string, endDate: string;

    switch (type) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'thisQuarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        break;
      }
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
    }

    onFiltersChange({
      ...filters,
      startDate,
      endDate
    });
  };

  // Filtered producers based on search term
  const filteredProducers = producers.filter(producer => {
    const fullName = `${producer.firstName} ${producer.lastName}`.toLowerCase();
    const searchTerm = producerSearchTerm.toLowerCase();
    return fullName.includes(searchTerm);
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${isMobile ? '' : ''}`}>
      {/* Header */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50`}>
        <div className={`flex items-center space-x-3 ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center`}>
            <Filter className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          <div>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-slate-800`}>
              {isMobile ? 'Filtreler' : 'Rapor Filtreleri'}
            </h3>
            {!isMobile && <p className="text-sm text-slate-600">Analiz parametrelerini ayarlayın</p>}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center space-x-2 ${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'} bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            <FaCog className="w-4 h-4" />
            <span>Gelişmiş</span>
            {isExpanded ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={resetFilters}
            className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'} text-slate-600 hover:text-slate-800 transition-colors`}
          >
            Sıfırla
          </button>
        </div>
      </div>

      <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
        {/* Tarih Aralığı */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-slate-700`}>Tarih Aralığı</label>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'}`}>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Başlangıç</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={`w-full ${isMobile ? 'px-2 py-2 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Bitiş</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={`w-full ${isMobile ? 'px-2 py-2 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
              />
            </div>
          </div>

          {/* Hızlı Tarih Seçimleri */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-600">Hızlı Seçim</label>
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-2 gap-2'}`}>
              <button
                onClick={() => applyQuickFilter('thisMonth')}
                className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-gray-100 hover:bg-emerald-100 rounded-lg transition-colors`}
              >
                Bu Ay
              </button>
              <button
                onClick={() => applyQuickFilter('lastMonth')}
                className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-gray-100 hover:bg-emerald-100 rounded-lg transition-colors`}
              >
                Geçen Ay
              </button>
              <button
                onClick={() => applyQuickFilter('thisQuarter')}
                className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-gray-100 hover:bg-emerald-100 rounded-lg transition-colors`}
              >
                Bu Çeyrek
              </button>
              <button
                onClick={() => applyQuickFilter('thisYear')}
                className={`${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-gray-100 hover:bg-emerald-100 rounded-lg transition-colors`}
              >
                Bu Yıl
              </button>
            </div>
          </div>
        </div>

        {/* Dönem Seçimi */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-slate-700`}>Dönem</label>
          </div>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className={`w-full ${isMobile ? 'px-2 py-2 text-sm' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Gelişmiş Filtreler */}
        {isExpanded && (
          <div className={`space-y-${isMobile ? '4' : '6'} border-t border-gray-100 ${isMobile ? 'pt-4' : 'pt-6'}`}>
            {/* Rapor Türleri */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-slate-700`}>Rapor Türleri</label>
              </div>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'}`}>
                {reportTypes.map(type => (
                  <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.reportTypes.includes(type.value)}
                      onChange={() => handleReportTypeToggle(type.value)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex items-center space-x-2">
                      <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{type.icon}</span>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-700`}>{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Üretici Seçimi */}
            {producers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-slate-700`}>Üreticiler</label>
                  <span className="text-xs text-slate-500">({filters.producers.length} seçili)</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Üretici ara..."
                    value={producerSearchTerm}
                    onChange={(e) => setProducerSearchTerm(e.target.value)}
                    className={`w-full ${isMobile ? 'pl-10 pr-3 py-2 text-sm' : 'pl-10 pr-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                </div>
                
                <div className={`max-h-${isMobile ? '32' : '40'} overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3`}>
                  <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={filters.producers.length === 0}
                      onChange={() => handleFilterChange('producers', [])}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-slate-700`}>Tüm Üreticiler</span>
                  </label>
                  
                  {filteredProducers.length > 0 ? (
                    filteredProducers.map(producer => (
                      <label key={producer.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={filters.producers.includes(producer.id)}
                          onChange={() => handleProducerToggle(producer.id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-700`}>
                          {producer.firstName} {producer.lastName}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                        {producerSearchTerm ? 'Arama kriterine uygun üretici bulunamadı' : 'Üretici bulunamadı'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>
        )}

        {/* Rapor Oluştur Butonu */}
        <div className={`border-t border-gray-100 ${isMobile ? 'pt-4' : 'pt-6'}`}>
          <button
            onClick={onGenerateReport}
            disabled={isLoading}
            className={`w-full ${isMobile ? 'py-3 text-sm' : 'py-4 text-base'} bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rapor Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{isMobile ? 'Rapor Oluştur' : 'Rapor Oluştur'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters; 