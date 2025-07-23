import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UreticiListesi from './UreticiListesi';
import { uploadToCloudinaryDirect } from '../utils/tempCloudinaryUtils';
import {
  saveHasatBilgisi,
  updateHasatBilgisi,
  getHasatBilgileriByProducer,
  deleteHasatBilgisi,
  getProducerById
} from '../utils/firestoreUtils';
import type { HasatBilgisi } from '../types/checklist';
import type { Producer } from '../types/producer';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

const HasatBilgisiComponent = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'list' | 'form'>('select-producer');
  const [hasatKayitlari, setHasatKayitlari] = useState<HasatBilgisi[]>([]);
  const [editingHasat, setEditingHasat] = useState<HasatBilgisi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  // Yeni: Üretici bilgilerini cache'leyecek state
  const [producerMap, setProducerMap] = useState<Record<string, Producer>>({});

  // Validation Schema
  const validationSchema = Yup.object({
    donem: Yup.string().required('Dönem gerekli'),
    cesit: Yup.string().required('Çeşit gerekli'),
    dikimTarihi: Yup.date().required('Dikim tarihi gerekli'),
    tonajDa: Yup.number().positive('Pozitif sayı olmalı').required('Tonaj/da gerekli'),
    ciroDa: Yup.number().positive('Pozitif sayı olmalı').required('Ciro/da gerekli'),
    ortalamaFiyat: Yup.number().positive('Pozitif sayı olmalı').required('Ortalama fiyat gerekli'),
    kacDa: Yup.number().positive('Pozitif sayı olmalı').required('Kaç da gerekli'),
    kasaAdeti: Yup.number().positive('Pozitif sayı olmalı').required('Kasa adeti gerekli'),
    kasaFiyati: Yup.number().positive('Pozitif sayı olmalı').required('Kasa fiyatı gerekli'),
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
    }
  }, [selectedProducer]);

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
    if (!selectedProducer) return;
    
    setLoading(true);
    try {
      const kayitlar = await getHasatBilgileriByProducer(selectedProducer.id);
      setHasatKayitlari(kayitlar);
    } catch (err) {
      setError('Hasat kayıtları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('list');
  };

  const handleSubmit = async (values: Record<string, string | number>) => {
    if (!selectedProducer) return;

    setLoading(true);
    setError(null);

    try {
      const kazanc = Number(values.kasaAdeti) * Number(values.kasaFiyati);

      
      const hasatData: Omit<HasatBilgisi, 'id' | 'createdAt' | 'updatedAt'> = {
        producerId: selectedProducer.id,
        donem: String(values.donem),
        cesit: String(values.cesit),
        dikimTarihi: String(values.dikimTarihi),
        tonajDa: Number(values.tonajDa),
        ciroDa: Number(values.ciroDa),
        ortalamaFiyat: Number(values.ortalamaFiyat),
        kacDa: Number(values.kacDa),
        kasaAdeti: Number(values.kasaAdeti),
        kasaFiyati: Number(values.kasaFiyati),
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
  const groupByPeriod = (records: HasatBilgisi[]) => {
    return records.reduce((acc, record) => {
      if (!acc[record.donem]) {
        acc[record.donem] = [];
      }
      acc[record.donem].push(record);
      return acc;
    }, {} as Record<string, HasatBilgisi[]>);
  };

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
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    await new Promise(resolve => setTimeout(resolve, 100)); // render flush
    html2canvas(input, { scale: 2 } as any).then((canvas: any) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = pageWidth;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save('hasat_bilgileri.pdf');
      setIsExportingPDF(false);
    });
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Hasat Bilgileri</h1>
              <p className="text-slate-600 mt-1">Hasat kayıtlarını görüntülemek için önce bir üretici seçin</p>
            </div>

            <UreticiListesi
              selectionMode={true}
              onSelect={handleProducerSelect}
              selectedProducer={selectedProducer}
            />
          </div>
        </div>
      </div>
    );
  }

  // Records List Step
  if (currentStep === 'list') {
    const groupedRecords = groupByPeriod(hasatKayitlari);
    const allTotals = calculateTotals(hasatKayitlari);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={resetSelection}
                  className="text-slate-600 hover:text-slate-800 transition-colors"
                >
                  ← Geri
                </button>
                <div>
                                  <h1 className="text-2xl font-bold text-slate-800">
                  {selectedProducer?.firstName} {selectedProducer?.lastName} - Hasat Bilgileri
                </h1>
                  <p className="text-slate-600 mt-1">Dönemsel hasat kayıtları ve analizi</p>
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

            {/* PDF'e Aktar Butonu */}
            <div className="flex justify-end mb-4">
              <button
                onClick={exportToPDF}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                PDF'e Aktar
              </button>
            </div>
            {/* PDF için kapsayıcı */}
            <div id="hasat-pdf-table">
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
                        { !isExportingPDF && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Hal Fişi Foto</th> }
                        { !isExportingPDF && <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">İşlemler</th> }
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {hasatKayitlari.map((record) => (
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
                          { !isExportingPDF && (
                            <td className="px-4 py-3">
                              {record.halFisiUrl ? (
                                <a href={record.halFisiUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={record.halFisiUrl} alt="Hal Fişi" className="w-16 h-16 object-cover rounded border" />
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          )}
                          { !isExportingPDF && (
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(record)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >Düzenle</button>
                                <button
                                  onClick={() => handleDelete(record.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >Sil</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {/* Toplamlar satırı */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 text-slate-800">Toplam</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-slate-800">{hasatKayitlari.reduce((sum, r) => sum + Number(r.kasaAdeti), 0)}</td>
                        <td className="px-4 py-3 text-slate-800">{hasatKayitlari.reduce((sum, r) => sum + (Number(r.tonajDa) * Number(r.kacDa) * 1000), 0).toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-slate-800">-</td>
                        <td className="px-4 py-3 text-emerald-600">₺{hasatKayitlari.reduce((sum, r) => sum + Number(r.kazanc), 0).toLocaleString()}</td>
                        { !isExportingPDF && <td className="px-4 py-3"></td> }
                        { !isExportingPDF && <td className="px-4 py-3"></td> }
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
                        Dönem *
                      </label>
                      <Field
                        as="select"
                        name="donem"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">Dönem seçin</option>
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
                        Çeşit *
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
                        Dikim Tarihi *
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
                        Kaç Da *
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
                          Tonaj/da *
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
                          Ciro/da *
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
                          Ortalama Fiyat *
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
                          Kasa Adeti *
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
                          Kasa Fiyatı *
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
                          <img
                            src={values.halFisiUrl}
                            alt="Hal Fişi"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
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