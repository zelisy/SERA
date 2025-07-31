import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEye, FaDownload, FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ProducerPerformance, GreenhousePerformance, CropAnalysis } from '../../types/reports';
import { formatCurrency, formatNumber, formatWeight, formatPercentage, formatArea } from '../../utils/reportUtils';

interface ReportTableProps {
  producerPerformances: ProducerPerformance[];
  greenhousePerformances: GreenhousePerformance[];
  cropAnalyses: CropAnalysis[];
  isLoading?: boolean;
}

type SortField = string;
type SortDirection = 'asc' | 'desc';
type TableView = 'producers' | 'greenhouses' | 'crops';

const ReportTable: React.FC<ReportTableProps> = ({
  producerPerformances,
  greenhousePerformances,
  cropAnalyses,
  isLoading = false
}) => {
  const [currentView, setCurrentView] = useState<TableView>('producers');
  const [sortField, setSortField] = useState<SortField>('production');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;

  // Sıralama fonksiyonu
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Üretici tablosu
  const producerColumns = [
    { key: 'name', label: 'Üretici', sortable: true },
    { key: 'production', label: 'Üretim', sortable: true },
    { key: 'revenue', label: 'Gelir', sortable: true },
    { key: 'profit', label: 'Kâr', sortable: true },
    { key: 'efficiency', label: 'Verimlilik', sortable: true },
    { key: 'greenhouseCount', label: 'Sera Sayısı', sortable: true },
    { key: 'averageYield', label: 'Ort. Verim', sortable: true },
    { key: 'profitMargin', label: 'Kâr Marjı', sortable: true }
  ];

  // Sera tablosu
  const greenhouseColumns = [
    { key: 'location', label: 'Lokasyon', sortable: true },
    { key: 'producer', label: 'Üretici', sortable: true },
    { key: 'crop', label: 'Ürün', sortable: true },
    { key: 'area', label: 'Alan', sortable: true },
    { key: 'production', label: 'Üretim', sortable: true },
    { key: 'revenue', label: 'Gelir', sortable: true },
    { key: 'yieldPerDecare', label: 'Verim/Da', sortable: true },
    { key: 'efficiency', label: 'Verimlilik', sortable: true },
    { key: 'harvestCount', label: 'Hasat Sayısı', sortable: true }
  ];

  // Ürün tablosu
  const cropColumns = [
    { key: 'cropType', label: 'Ürün Türü', sortable: true },
    { key: 'variety', label: 'Çeşit', sortable: true },
    { key: 'totalProduction', label: 'Toplam Üretim', sortable: true },
    { key: 'totalRevenue', label: 'Toplam Gelir', sortable: true },
    { key: 'averagePrice', label: 'Ort. Fiyat', sortable: true },
    { key: 'averageYield', label: 'Ort. Verim', sortable: true },
    { key: 'marketShare', label: 'Pazar Payı', sortable: true },
    { key: 'profitMargin', label: 'Kâr Marjı', sortable: true },
    { key: 'producerCount', label: 'Üretici Sayısı', sortable: true }
  ];

  // Filtrelenmiş ve sıralanmış veriler
  const filteredAndSortedData = useMemo(() => {
    let data: any[] = [];
    
    switch (currentView) {
      case 'producers':
        data = producerPerformances.map(p => ({
          id: p.producer.id,
          name: `${p.producer.firstName} ${p.producer.lastName}`,
          production: p.production,
          revenue: p.revenue,
          profit: p.profit,
          efficiency: p.efficiency,
          greenhouseCount: p.greenhouseCount,
          averageYield: p.averageYield,
          profitMargin: p.profitMargin,
          raw: p
        }));
        break;
      case 'greenhouses':
        data = greenhousePerformances.map(gh => ({
          id: gh.greenhouse.id,
          location: gh.greenhouse.mahalle,
          producer: `${gh.producer.firstName} ${gh.producer.lastName}`,
          crop: gh.greenhouse.urunIsmi,
          area: gh.greenhouse.alanM2,
          production: gh.production,
          revenue: gh.revenue,
          yieldPerDecare: gh.yieldPerDecare,
          efficiency: gh.efficiency,
          harvestCount: gh.harvestCount,
          raw: gh
        }));
        break;
      case 'crops':
        data = cropAnalyses.map(crop => ({
          id: crop.cropType + crop.variety,
          cropType: crop.cropType,
          variety: crop.variety,
          totalProduction: crop.totalProduction,
          totalRevenue: crop.totalRevenue,
          averagePrice: crop.averagePrice,
          averageYield: crop.averageYield,
          marketShare: crop.marketShare,
          profitMargin: crop.profitMargin,
          producerCount: crop.producerCount,
          raw: crop
        }));
        break;
    }

    // Arama filtresi
    if (searchTerm) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sıralama
    data.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return data;
  }, [currentView, producerPerformances, greenhousePerformances, cropAnalyses, searchTerm, sortField, sortDirection]);

  // Sayfalama
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Sıralama icon'u
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="text-emerald-600" /> : 
      <FaSortDown className="text-emerald-600" />;
  };

  // Değer formatlayıcı
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-';
    
    switch (key) {
      case 'production':
      case 'totalProduction':
        return formatWeight(value);
      case 'revenue':
      case 'totalRevenue':
      case 'profit':
      case 'averagePrice':
        return formatCurrency(value);
      case 'efficiency':
      case 'profitMargin':
      case 'marketShare':
        return formatPercentage(value);
      case 'area':
        return formatArea(value);
      case 'averageYield':
      case 'yieldPerDecare':
        return `${formatNumber(value, 1)} kg/da`;
      case 'greenhouseCount':
      case 'harvestCount':
      case 'producerCount':
        return formatNumber(value);
      default:
        return typeof value === 'number' ? formatNumber(value) : String(value);
    }
  };

  // Seçim işlemleri
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === currentData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentData.map(item => item.id)));
    }
  };

  // PDF Export Function
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Check if there's data to export
      if (filteredAndSortedData.length === 0) {
        alert('Dışa aktarılacak veri bulunamadı. Lütfen önce rapor oluşturun veya filtreleri kontrol edin.');
        return;
      }
      
      // Get current table data
      const currentColumns = getCurrentColumns();
      const dataToExport = filteredAndSortedData;
      
      // Create PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '210mm';
      pdfContent.style.padding = '20mm';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.fontSize = '10px';
      pdfContent.style.color = '#333';
      pdfContent.style.background = 'white';
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '0';

      const getViewTitle = () => {
        switch (currentView) {
          case 'producers': return 'Üretici Performans Analizi';
          case 'greenhouses': return 'Sera Performans Analizi';
          case 'crops': return 'Ürün Bazlı Analiz';
          default: return 'Detaylı Analiz Tablosu';
        }
      };

      pdfContent.innerHTML = `
        <style>
          .pdf-container { max-width: 170mm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 15px; }
          .title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
          .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
          .date { font-size: 10px; color: #9ca3af; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 7px; table-layout: fixed; }
          .table th, .table td { border: 1px solid #d1d5db; padding: 3px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; }
          .table th { background: #f3f4f6; font-weight: bold; }
          .table tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          .summary { margin-bottom: 15px; font-size: 10px; }
          .summary-item { margin-bottom: 5px; }
          .table-container { overflow-x: auto; }
        </style>
        
        <div class="pdf-container">
          <div class="header">
            <div class="title">${getViewTitle()}</div>
            <div class="subtitle">Detaylı Analiz Tablosu</div>
            <div class="date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
          </div>

          <div class="summary">
            <div class="summary-item"><strong>Toplam Kayıt:</strong> ${dataToExport.length}</div>
            <div class="summary-item"><strong>Görünüm:</strong> ${getViewTitle()}</div>
            <div class="summary-item"><strong>Sıralama:</strong> ${currentColumns.find(col => col.key === sortField)?.label || sortField} (${sortDirection === 'asc' ? 'Artan' : 'Azalan'})</div>
            ${searchTerm ? `<div class="summary-item"><strong>Arama:</strong> "${searchTerm}"</div>` : ''}
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  ${currentColumns.map(col => `<th>${col.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${dataToExport.map(item => `
                  <tr>
                    ${currentColumns.map(col => `<td>${formatValue(col.key, item[col.key])}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</div>
            <div>Sera Yönetim Sistemi - Detaylı Analiz Tablosu</div>
          </div>
        </div>
      `;

      // Add to document temporarily
      document.body.appendChild(pdfContent);

      // Convert to canvas
      const canvas = await html2canvas(pdfContent, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const filename = `sera-detayli-analiz-${currentView}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      // Show success message
      const successMessage = `PDF başarıyla oluşturuldu: ${filename}`;
      console.log(successMessage);
      
      // You can add a toast notification here if you have a notification system
      // For now, we'll just show an alert
      setTimeout(() => {
        alert(successMessage);
      }, 100);

    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCurrentColumns = () => {
    switch (currentView) {
      case 'producers': return producerColumns;
      case 'greenhouses': return greenhouseColumns;
      case 'crops': return cropColumns;
      default: return producerColumns;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Detaylı Analiz Tablosu</h3>
          <p className="text-sm text-slate-600">Mevcut görünümdeki tüm verileri PDF formatında dışa aktarın</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* View Selector */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {[
              { key: 'producers', label: 'Üreticiler' },
              { key: 'greenhouses', label: 'Seralar' },
              { key: 'crops', label: 'Ürünler' }
            ].map(view => (
              <button
                key={view.key}
                onClick={() => {
                  setCurrentView(view.key as TableView);
                  setCurrentPage(1);
                  setSelectedItems(new Set());
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentView === view.key
                    ? 'bg-white shadow-sm text-emerald-600 font-medium'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <div className="flex flex-col items-end">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || filteredAndSortedData.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isExporting ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>PDF Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <FaDownload className="w-4 h-4" />
                  <span>Dışa Aktar</span>
                </>
              )}
            </button>
            {filteredAndSortedData.length > 0 && (
              <span className="text-xs text-slate-500 mt-1">
                {filteredAndSortedData.length} kayıt dışa aktarılacak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Arama yapın..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <span>Toplam: {filteredAndSortedData.length} kayıt</span>
          {selectedItems.size > 0 && (
            <span className="text-emerald-600">{selectedItems.size} seçili</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedItems.size === currentData.length && currentData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              {getCurrentColumns().map(column => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 font-semibold text-slate-700 ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-50' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="text-left py-3 px-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </td>
                {getCurrentColumns().map(column => (
                  <td key={column.key} className="py-3 px-4 text-slate-800">
                    {formatValue(column.key, item[column.key])}
                  </td>
                ))}
                <td className="py-3 px-4">
                  <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                    <FaEye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600">
            {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} / {filteredAndSortedData.length} kayıt gösteriliyor
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Önceki
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-md transition-colors ${
                    currentPage === page
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {currentData.length === 0 && !isLoading && (
        <div className="text-center py-12 text-slate-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">Veri bulunamadı</p>
          <p className="text-sm">
            {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin.' : 'Bu kategori için henüz veri bulunmuyor.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportTable; 