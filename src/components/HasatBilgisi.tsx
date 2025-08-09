import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UreticiListesi from './UreticiListesi';
import { uploadToCloudinaryDirect } from '../utils/tempCloudinaryUtils';
import OptimizedImage from './OptimizedImage';
import {
  saveHasatBilgisi,
  updateHasatBilgisi,
  getHasatBilgileriByProducer,
  deleteHasatBilgisi,
  getProducerById,
  getUretimAlanlariByProducer
} from '../utils/firestoreUtils';
import type { HasatBilgisi } from '../types/checklist';
import type { Producer } from '../types/producer';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

const HasatBilgisiComponent = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'select-area' | 'list' | 'form'>('select-producer');
  const [hasatKayitlari, setHasatKayitlari] = useState<HasatBilgisi[]>([]);
  const [editingHasat, setEditingHasat] = useState<HasatBilgisi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  // Yeni: Üretici bilgilerini cache'leyecek state
  const [producerMap, setProducerMap] = useState<Record<string, Producer>>({});
  // Filtreleme state'leri
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [filteredRecords, setFilteredRecords] = useState<HasatBilgisi[]>([]);
  // Üretim alanları için state
  const [uretimAlanlari, setUretimAlanlari] = useState<any[]>([]);
  const [selectedUretimAlani, setSelectedUretimAlani] = useState<any | null>(null);

  // Validation Schema
    const validationSchema = Yup.object({
      donem: Yup.string(),
      cesit: Yup.string(),
      dikimTarihi: Yup.date(),
      tonajDa: Yup.number(),
      ciroDa: Yup.number(),
      ortalamaFiyat: Yup.number(),
      kacDa: Yup.number(),
      kasaAdeti: Yup.number(),
      kasaFiyati: Yup.number(),
      teknikEkipNotu: Yup.string(),
      ciftciNotu: Yup.string()
    });

  const getInitialValues = () => ({
    donem: editingHasat?.donem || '',
    cesit: editingHasat?.cesit || '',
    dikimTarihi: editingHasat?.dikimTarihi || '',
    tonajDa: editingHasat?.tonajDa || 0,
    ciroDa: editingHasat?.ciroDa || 0,
    ortalamaFiyat: editingHasat?.ortalamaFiyat || 0,
    kacDa: editingHasat?.kacDa || 0,
    kasaAdeti: editingHasat?.kasaAdeti || 0,
    kasaFiyati: editingHasat?.kasaFiyati || 0,
    halFisiUrl: editingHasat?.halFisiUrl || '',
    teknikEkipNotu: editingHasat?.teknikEkipNotu || '',
    ciftciNotu: editingHasat?.ciftciNotu || ''
  });

  // Load hasat kayıtları when producer is selected
  useEffect(() => {
    if (selectedProducer) {
      loadHasatKayitlari();
      loadUretimAlanlari();
    }
  }, [selectedProducer]);

  // Üretim alanlarını çek
  const loadUretimAlanlari = async () => {
    if (!selectedProducer) return;
    try {
      const alanlar = await getUretimAlanlariByProducer(selectedProducer.id);
      setUretimAlanlari(alanlar);
    } catch (err) {
      setUretimAlanlari([]);
    }
  };

  // Hasat kayıtları yüklendiğinde üretici bilgilerini getir
  useEffect(() => {
    const fetchProducers = async () => {
      const uniqueProducerIds = Array.from(new Set(hasatKayitlari.map(r => r.producerId)));
      const newMap: Record<string, Producer> = { ...producerMap };
      for (const id of uniqueProducerIds) {
        if (!newMap[id]) {
          const producer = await getProducerById(id);
          if (producer) newMap[id] = producer;
        }
      }
      setProducerMap(newMap);
    };
    if (hasatKayitlari.length > 0) {
      fetchProducers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasatKayitlari]);

  const loadHasatKayitlari = async () => {
    if (!selectedProducer || !selectedUretimAlani) return;
    
    setLoading(true);
    try {
      const kayitlar = await getHasatBilgileriByProducer(selectedProducer.id);
      // Üretim alanına göre filtrele
      const filteredKayitlar = kayitlar.filter(kayit => !kayit.uretimAlaniId || kayit.uretimAlaniId === selectedUretimAlani.id);
      setHasatKayitlari(filteredKayitlar);
      setFilteredRecords(filteredKayitlar); // Başlangıçta tüm kayıtları göster
    } catch (err) {
      setError('Hasat kayıtları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonu - otomatik çalışır
  const applyFilters = () => {
    let filtered = hasatKayitlari;
    
    if (selectedSeason) {
      filtered = filtered.filter(record => record.donem === selectedSeason);
    }
    
    setFilteredRecords(filtered);
  };

  // Filtreler değiştiğinde otomatik uygula
  useEffect(() => {
    applyFilters();
  }, [selectedSeason, hasatKayitlari]);

  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedSeason('');
    setFilteredRecords(hasatKayitlari);
  };

  // Benzersiz sezon listesini al
  const getUniqueSeasons = () => {
    return Array.from(new Set(hasatKayitlari.map(record => record.donem))).sort();
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('select-area');
  };

  const handleUretimAlaniSelect = (area: any) => {
    setSelectedUretimAlani(area);
    setCurrentStep('list');
  };

  const handleSubmit = async (values: Record<string, string | number>) => {
    if (!selectedProducer || !selectedUretimAlani) return;

    setLoading(true);
    setError(null);

    try {
      const kazanc = Number(values.kasaAdeti || 0) * Number(values.kasaFiyati || 0);

      
      const hasatData: Omit<HasatBilgisi, 'id' | 'createdAt' | 'updatedAt'> = {
        producerId: selectedProducer.id,
        uretimAlaniId: selectedUretimAlani.id,
        donem: String(values.donem || ''),
        cesit: String(values.cesit || ''),
        dikimTarihi: String(values.dikimTarihi || ''),
        tonajDa: Number(values.tonajDa || 0),
        ciroDa: Number(values.ciroDa || 0),
        ortalamaFiyat: Number(values.ortalamaFiyat || 0),
        kacDa: Number(values.kacDa || 0),
        kasaAdeti: Number(values.kasaAdeti || 0),
        kasaFiyati: Number(values.kasaFiyati || 0),
        kazanc: kazanc,
        halFisiUrl: values.halFisiUrl ? String(values.halFisiUrl) : undefined,
        teknikEkipNotu: values.teknikEkipNotu ? String(values.teknikEkipNotu) : undefined,
        ciftciNotu: values.ciftciNotu ? String(values.ciftciNotu) : undefined
      };

      if (editingHasat) {
        await updateHasatBilgisi(editingHasat.id, hasatData);
      } else {
        await saveHasatBilgisi(hasatData);
      }

      setCurrentStep('list');
      setEditingHasat(null);
      await loadHasatKayitlari();
    } catch (err) {
      setError(editingHasat ? 'Güncelleme başarısız' : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hasat: HasatBilgisi) => {
    setEditingHasat(hasat);
    setCurrentStep('form');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

    setLoading(true);
    try {
      await deleteHasatBilgisi(id);
      await loadHasatKayitlari();
    } catch (err) {
      setError('Silme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setEditingHasat(null);
    setHasatKayitlari([]);
    setError(null);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinaryDirect(file);
      return url;
    } catch (error) {
      throw new Error('Fotoğraf yükleme başarısız');
    } finally {
      setUploadingImage(false);
    }
  };

  // Group records by period
  const calculateTotals = (records: HasatBilgisi[]) => {
    return records.reduce((totals, record) => ({
      totalTonaj: totals.totalTonaj + record.tonajDa * record.kacDa,
      totalCiro: totals.totalCiro + record.ciroDa * record.kacDa,
      totalKazanc: totals.totalKazanc + record.kazanc,
      totalAlan: totals.totalAlan + record.kacDa
    }), { totalTonaj: 0, totalCiro: 0, totalKazanc: 0, totalAlan: 0 });
  };

  // PDF'e aktar fonksiyonu
  const exportToPDF = async () => {
    setIsExportingPDF(true);
    const input = document.getElementById('hasat-pdf-table');
    if (!input) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      await new Promise(resolve => setTimeout(resolve, 100)); // render flush
      
      html2canvas(input, { scale: 2 } as any).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        // PDF başlığı ekle
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Hasat Bilgileri Raporu', 20, 20);
        
                 // Filtre bilgilerini ekle
         pdf.setFontSize(10);
         pdf.setFont('helvetica', 'normal');
         let yPosition = 30;
         
         if (selectedSeason) {
           pdf.text('Filtreler:', 20, yPosition);
           yPosition += 5;
           pdf.text(`Sezon: ${selectedSeason}`, 25, yPosition);
           yPosition += 10;
         }
        
        // Üretici bilgisi
        if (selectedProducer) {
          pdf.text(`Üretici: ${selectedProducer.firstName} ${selectedProducer.lastName}`, 20, yPosition);
          yPosition += 5;
        }
        
        // Tarih
        pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, yPosition);
        yPosition += 10;
        
        // Tablo
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const pdfWidth = pageWidth - 40; // Kenar boşlukları
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, pdfWidth, pdfHeight);
        
                 // Dosya adı oluştur
         let fileName = 'hasat_bilgileri';
         if (selectedSeason) fileName += `_${selectedSeason}`;
         fileName += '.pdf';
        
        pdf.save(fileName);
        setIsExportingPDF(false);
      });
    } catch (error) {
      console.error('PDF export hatası:', error);
      setIsExportingPDF(false);
    }
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Hasat Bilgisi Sistemi
            </h1>
            <p className="text-slate-600 text-lg">
              Hasat bilgilerini görüntülemek için önce bir üretici seçin
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2">Üretim Alanı Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2">Hasat Bilgileri</span>
              </div>
            </div>
          </div>

          {/* Producer Selection */}
          <UreticiListesi
            selectionMode={true}
            onSelect={handleProducerSelect}
            selectedProducer={selectedProducer}
          />
        </div>
      </div>
    );
  }

  // Üretim Alanı Seçim Step
  if (currentStep === 'select-area') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Üretim Alanı Seç</h2>
            <p className="text-slate-600 text-lg">Lütfen üreticiye ait bir üretim alanı seçin</p>
          </div>
          
          {/* Progress Steps */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-emerald-500 rounded"></div>
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2 font-medium">Üretim Alanı Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2">Hasat Bilgileri</span>
              </div>
            </div>
          </div>

          {/* Geri Dönüş Butonu */}
          <div className="mb-6">
            <button
              onClick={resetSelection}
              className="text-slate-600 hover:text-slate-800 transition-colors flex items-center"
            >
              ← Geri Dön
            </button>
          </div>

          {uretimAlanlari.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏭</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Üretim alanı bulunamadı</h3>
              <p className="text-gray-600 mb-4">Bu üreticiye ait üretim alanı yok.</p>
              <button
                onClick={resetSelection}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Başka Üretici Seç
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 text-center text-lg font-semibold text-emerald-700">Üretim Alanı Listesi</div>
              <ul className="space-y-4">
                {uretimAlanlari.map((area) => (
                  <li key={area.id}>
                    <button
                      className={`w-full text-left border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedUretimAlani?.id === area.id ? 'bg-emerald-50 border-emerald-400' : 'bg-white'}`}
                      onClick={() => handleUretimAlaniSelect(area)}
                    >
                      <div className="font-bold text-lg text-emerald-700 mb-1">{area.urunIsmi} - {area.cesitIsmi}</div>
                      <div className="text-sm text-gray-600">Alan: {area.alanM2} m² | Parsel: {area.parsel} | Ada: {area.ada}</div>
                      <div className="text-xs text-gray-500">Dikim Tarihi: {area.dikimTarihi} | Sera Tipi: {area.seraType}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Records List Step
  if (currentStep === 'list') {
    const allTotals = calculateTotals(filteredRecords);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentStep('select-area')}
                  className="text-slate-600 hover:text-slate-800 transition-colors"
                >
                  ← Geri
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {selectedProducer?.firstName} {selectedProducer?.lastName} - Hasat Bilgileri
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Üretim Alanı: {selectedUretimAlani?.urunIsmi} - {selectedUretimAlani?.cesitIsmi} ({selectedUretimAlani?.alanM2} m²)
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setEditingHasat(null);
                  setCurrentStep('form');
                }}
                className="mt-4 lg:mt-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg"
              >
                + Yeni Kayıt Ekle
              </button>
            </div>

            {/* Progress Steps */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center">
                <div className="flex items-center text-emerald-600">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="ml-2 font-medium">Üretici Seç</span>
                </div>
                <div className="flex-1 mx-4 h-1 bg-emerald-500 rounded"></div>
                <div className="flex items-center text-emerald-600">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="ml-2 font-medium">Üretim Alanı Seç</span>
                </div>
                <div className="flex-1 mx-4 h-1 bg-emerald-500 rounded"></div>
                <div className="flex items-center text-emerald-600">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="ml-2 font-medium">Hasat Bilgileri</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🌾</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Toplam Tonaj</h3>
                    <p className="text-slate-600 text-sm">Tüm dönemler</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">{allTotals.totalTonaj.toFixed(2)}</p>
                <p className="text-slate-600 text-sm">ton</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Toplam Ciro</h3>
                    <p className="text-slate-600 text-sm">Tüm dönemler</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">₺{allTotals.totalCiro.toLocaleString()}</p>
                <p className="text-slate-600 text-sm">TL</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Toplam Kazanç</h3>
                    <p className="text-slate-600 text-sm">Satış kazançları</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">₺{allTotals.totalKazanc.toLocaleString()}</p>
                <p className="text-slate-600 text-sm">TL</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📏</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Toplam Alan</h3>
                    <p className="text-slate-600 text-sm">Ekili alan</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">{allTotals.totalAlan}</p>
                <p className="text-slate-600 text-sm">da</p>
              </div>
            </div>

            {/* Filtreleme Bölümü */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">🔍 Filtreleme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sezon Filtresi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sezon</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Tüm Sezonlar</option>
                    {getUniqueSeasons().map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre Butonları */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
              
              {/* Filtreleme Sonuçları */}
              {filteredRecords.length !== hasatKayitlari.length && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{filteredRecords.length}</strong> kayıt gösteriliyor 
                    (toplam {hasatKayitlari.length} kayıttan)
                  </p>
                </div>
              )}
            </div>

            {/* PDF'e Aktar Butonu */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-slate-600">
                {filteredRecords.length > 0 && (
                  <span>Filtrelenmiş kayıtların PDF'ini alabilirsiniz</span>
                )}
              </div>
              <button
                onClick={exportToPDF}
                disabled={filteredRecords.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? 'PDF Hazırlanıyor...' : 'PDF\'e Aktar'}
              </button>
            </div>

            {/* Kayıtlar Listesi */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-slate-800">📋 Hasat Kayıtları</h2>
                <p className="text-slate-600 mt-1">Tüm hasat kayıtlarını görüntüleyin ve yönetin</p>
              </div>
              
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz hasat kaydı yok</h3>
                  <p className="text-slate-600 mb-4">İlk hasat kaydınızı oluşturmak için "Yeni Kayıt Ekle" butonuna tıklayın.</p>
                  <button
                    onClick={() => {
                      setEditingHasat(null);
                      setCurrentStep('form');
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                  >
                    + İlk Hasat Kaydını Oluştur
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Üretici</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hasat Tarihi</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sezon</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kasa Adeti</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kg</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Fiyat</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kazanç</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hal Fişi Foto</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            {producerMap[record.producerId]?.firstName} {producerMap[record.producerId]?.lastName}
                          </td>
                          <td className="px-4 py-3">{new Date(record.dikimTarihi).toLocaleDateString('tr-TR')}</td>
                          <td className="px-4 py-3">{record.donem}</td>
                          <td className="px-4 py-3">{record.kasaAdeti ? String(record.kasaAdeti) : ''}</td>
                          <td className="px-4 py-3">{(Number(record.tonajDa) * Number(record.kacDa) * 1000).toLocaleString()} kg</td>
                          <td className="px-4 py-3">₺{record.ortalamaFiyat ? String(record.ortalamaFiyat) : ''}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">₺{record.kazanc ? Number(record.kazanc).toLocaleString() : ''}</td>
                          <td className="px-4 py-3">
                            {record.halFisiUrl ? (
                              <a href={record.halFisiUrl} target="_blank" rel="noopener noreferrer">
                                <img src={record.halFisiUrl} alt="Hal Fişi" className="w-16 h-16 object-cover rounded border" />
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                ✏️ Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                🗑️ Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Toplamlar satırı */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 text-slate-800">Toplam</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800">{filteredRecords.reduce((sum, r) => sum + Number(r.kasaAdeti), 0)}</td>
                        <td className="px-4 py-3 text-slate-800">{filteredRecords.reduce((sum, r) => sum + (Number(r.tonajDa) * Number(r.kacDa) * 1000), 0).toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-slate-800">-</td>
                        <td className="px-4 py-3 text-emerald-600">₺{filteredRecords.reduce((sum, r) => sum + Number(r.kazanc), 0).toLocaleString()}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PDF için kapsayıcı */}
            <div id="hasat-pdf-table" className="hidden">
              {/* Tek tablo, sezon ayrımı olmadan */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-slate-800">Tüm Hasat Kayıtları</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Üretici</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hasat Tarihi</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sezon</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kasa Adeti</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kg</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Fiyat</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kazanç</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            {producerMap[record.producerId]?.firstName} {producerMap[record.producerId]?.lastName}
                          </td>
                          <td className="px-4 py-3">{new Date(record.dikimTarihi).toLocaleDateString('tr-TR')}</td>
                          <td className="px-4 py-3">{record.donem}</td>
                          <td className="px-4 py-3">{record.kasaAdeti ? String(record.kasaAdeti) : ''}</td>
                          <td className="px-4 py-3">{(Number(record.tonajDa) * Number(record.kacDa) * 1000).toLocaleString()} kg</td>
                          <td className="px-4 py-3">₺{record.ortalamaFiyat ? String(record.ortalamaFiyat) : ''}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">₺{record.kazanc ? Number(record.kazanc).toLocaleString() : ''}</td>
                        </tr>
                      ))}
                      {/* Toplamlar satırı */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 text-slate-800">Toplam</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800">{filteredRecords.reduce((sum, r) => sum + Number(r.kasaAdeti), 0)}</td>
                        <td className="px-4 py-3 text-slate-800">{filteredRecords.reduce((sum, r) => sum + (Number(r.tonajDa) * Number(r.kacDa) * 1000), 0).toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-slate-800">-</td>
                        <td className="px-4 py-3 text-emerald-600">₺{filteredRecords.reduce((sum, r) => sum + Number(r.kazanc), 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => setCurrentStep('list')}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                ← Geri
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {editingHasat ? 'Hasat Kaydını Düzenle' : 'Yeni Hasat Kaydı'}
                </h1>
                <p className="text-slate-600 mt-1">{selectedProducer?.firstName} {selectedProducer?.lastName}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <Formik
              initialValues={getInitialValues()}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Temel Bilgiler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dönem
                      </label>
                      <Field
                        as="select"
                        name="donem"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">Seçiniz</option>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                      </Field>
                      <div className="text-red-500 text-sm mt-1">
                        <ErrorMessage name="donem" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Çeşit
                      </label>
                      <Field
                        type="text"
                        name="cesit"
                        placeholder="Örn: Domates F1"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                      <div className="text-red-500 text-sm mt-1">
                        <ErrorMessage name="cesit" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Dikim Tarihi
                      </label>
                      <Field
                        type="date"
                        name="dikimTarihi"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                      <div className="text-red-500 text-sm mt-1">
                        <ErrorMessage name="dikimTarihi" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kaç Da
                      </label>
                      <Field
                        type="number"
                        name="kacDa"
                        step="0.1"
                        placeholder="Örn: 5.5"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                      <div className="text-red-500 text-sm mt-1">
                        <ErrorMessage name="kacDa" />
                      </div>
                    </div>
                  </div>

                  {/* Verim Bilgileri */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Verim Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tonaj/da
                        </label>
                        <Field
                          type="number"
                          name="tonajDa"
                          step="0.1"
                          placeholder="Örn: 45.5"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <div className="text-red-500 text-sm mt-1">
                          <ErrorMessage name="tonajDa" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Ciro/da
                        </label>
                        <Field
                          type="number"
                          name="ciroDa"
                          step="0.01"
                          placeholder="Örn: 120000"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <div className="text-red-500 text-sm mt-1">
                          <ErrorMessage name="ciroDa" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Ortalama Fiyat
                        </label>
                        <Field
                          type="number"
                          name="ortalamaFiyat"
                          step="0.01"
                          placeholder="Örn: 8.50"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <div className="text-red-500 text-sm mt-1">
                          <ErrorMessage name="ortalamaFiyat" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Satış Bilgileri */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Satış Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Kasa Adeti
                        </label>
                        <Field
                          type="number"
                          name="kasaAdeti"
                          placeholder="Örn: 1500"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <div className="text-red-500 text-sm mt-1">
                          <ErrorMessage name="kasaAdeti" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Kilogram Fiyatı
                        </label>
                        <Field
                          type="number"
                          name="kasaFiyati"
                          step="0.01"
                          placeholder="Örn: 25.00"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <div className="text-red-500 text-sm mt-1">
                          <ErrorMessage name="kasaFiyati" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Toplam Kazanç
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-emerald-600">
                          ₺{(values.kasaAdeti * values.kasaFiyati).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hal Fişi Fotoğrafı */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Hal Fişi Fotoğrafı</h3>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await handleFileUpload(file);
                              setFieldValue('halFisiUrl', url);
                            } catch (error) {
                              setError('Fotoğraf yükleme başarısız');
                            }
                          }
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <p className="text-sm text-blue-600 mt-2">Fotoğraf yükleniyor...</p>
                      )}
                      {values.halFisiUrl && (
                        <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => setPreviewImageUrl(values.halFisiUrl)}
                                className="focus:outline-none"
                              >
                                <OptimizedImage
                                  src={values.halFisiUrl}
                                  alt="Hal Fişi"
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                                />
                              </button>
      {/* Fotoğraf büyük önizleme modalı */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewImageUrl(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={previewImageUrl} alt="Büyük Önizleme" className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border-4 border-white" />
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notlar */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Notlar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Teknik Ekip Notu
                        </label>
                        <Field
                          as="textarea"
                          name="teknikEkipNotu"
                          rows={4}
                          placeholder="Teknik ekip değerlendirmesi..."
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const textarea = e.target as HTMLTextAreaElement;
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const value = textarea.value;
                              textarea.value = value.substring(0, start) + '\n' + value.substring(end);
                              textarea.selectionStart = textarea.selectionEnd = start + 1;
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Çiftçi Notu
                        </label>
                        <Field
                          as="textarea"
                          name="ciftciNotu"
                          rows={4}
                          placeholder="Çiftçi notları..."
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const textarea = e.target as HTMLTextAreaElement;
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const value = textarea.value;
                              textarea.value = value.substring(0, start) + '\n' + value.substring(end);
                              textarea.selectionStart = textarea.selectionEnd = start + 1;
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('list')}
                        className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                      >
                        {isSubmitting || loading
                          ? 'Kaydediliyor...'
                          : editingHasat
                          ? 'Güncelle'
                          : 'Kaydet'}
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasatBilgisiComponent; 