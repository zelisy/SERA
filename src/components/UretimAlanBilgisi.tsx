import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UreticiListesi from './UreticiListesi';
import {
  saveUretimAlani,
  updateUretimAlani,
  getUretimAlanlariByProducer,
  deleteUretimAlani
} from '../utils/firestoreUtils';
import type { UretimAlani } from '../types/checklist';
import type { Producer } from '../types/producer';

const UretimAlanBilgisi: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'form' | 'list'>('select-producer');
  const [existingAreas, setExistingAreas] = useState<UretimAlani[]>([]);
  const [editingArea, setEditingArea] = useState<UretimAlani | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation Schema
  const validationSchema = Yup.object({
    seraType: Yup.string(),
    plastikYil: Yup.number().when('seraType', {
      is: 'plastik',
      then: (schema) => schema,
      otherwise: (schema) => schema.nullable()
    }),
    katmanType: Yup.string().when('seraType', {
      is: 'plastik',
      then: (schema) => schema,
      otherwise: (schema) => schema.nullable()
    }),
    ada: Yup.string(),
    parsel: Yup.string(),
    mahalle: Yup.string(),
    alanM2: Yup.number().min(1, 'En az 1 m² olmalıdır'),
    urunIsmi: Yup.string(),
    cesitIsmi: Yup.string(),
    dikimTarihi: Yup.date(),
    dikimYogunlugu: Yup.string(),
    siraArasiMesafe: Yup.number().min(0, 'Negatif olamaz'),
    setUstuMesafe: Yup.number().min(0, 'Negatif olamaz'),
    siraType: Yup.string(),
    dikimYonu: Yup.string(),
    suKaynagi: Yup.string(),
    damlamaSistemiAdeti: Yup.number().min(0, 'Negatif olamaz'),
    damlamaDebisi: Yup.string(),
    sulamaSekli: Yup.string(),
    toprakYapisi: Yup.string(),
    drenajSeviyesi: Yup.string(),
    isitmaSistemi: Yup.string(),
    havalandirma: Yup.string(),
    tulType: Yup.string().when('tulBilgisi', {
      is: true,
      then: (schema) => schema,
      otherwise: (schema) => schema.nullable()
    }),
    kulturelIslemler: Yup.string(),
    teknikDegerlendirme: Yup.string()
  });

  // Initial values
  const getInitialValues = () => ({
    seraType: editingArea?.seraType || '',
    plastikYil: editingArea?.plastikYil || '',
    katmanType: editingArea?.katmanType || '',
    ada: editingArea?.ada || '',
    parsel: editingArea?.parsel || '',
    mahalle: editingArea?.mahalle || '',
    alanM2: editingArea?.alanM2 || '',
    urunIsmi: editingArea?.urunIsmi || '',
    cesitIsmi: editingArea?.cesitIsmi || '',
    dikimTarihi: editingArea?.dikimTarihi || '',
    dikimYogunlugu: editingArea?.dikimYogunlugu || '',
    siraArasiMesafe: editingArea?.siraArasiMesafe || '',
    setUstuMesafe: editingArea?.setUstuMesafe || '',
    siraType: editingArea?.siraType || '',
    dikimYonu: editingArea?.dikimYonu || '',
    suKaynagi: editingArea?.suKaynagi || '',
    damlamaSistemiAdeti: editingArea?.damlamaSistemiAdeti || '',
    damlamaDebisi: editingArea?.damlamaDebisi || '',
    sulamaSekli: editingArea?.sulamaSekli || '',
    nemlendirmeSistemi: editingArea?.nemlendirmeSistemi || false,
    toprakYapisi: editingArea?.toprakYapisi || '',
    drenajSeviyesi: editingArea?.drenajSeviyesi || '',
    isitmaSistemi: editingArea?.isitmaSistemi || '',
    havalandirma: editingArea?.havalandirma || '',
    tulBilgisi: editingArea?.tulBilgisi || false,
    tulType: editingArea?.tulType || '',
    kulturelIslemler: editingArea?.kulturelIslemler || '',
    teknikDegerlendirme: editingArea?.teknikDegerlendirme || ''
  });

  // Load existing areas when producer is selected
  useEffect(() => {
    if (selectedProducer) {
      loadExistingAreas();
    }
  }, [selectedProducer]);

  const loadExistingAreas = async () => {
    if (!selectedProducer) return;
    
    try {
      setLoading(true);
      const areas = await getUretimAlanlariByProducer(selectedProducer.id);
      setExistingAreas(areas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('list');
  };

  const handleSubmit = async (values: Record<string, string | number | boolean>) => {
    if (!selectedProducer) return;

    try {
      setLoading(true);
      setError(null);

      const uretimAlaniData: Omit<UretimAlani, 'id' | 'createdAt' | 'updatedAt'> = {
        producerId: selectedProducer.id,
        seraType: values.seraType as 'cam' | 'plastik' | 'acikalan',
        ada: String(values.ada),
        parsel: String(values.parsel),
        mahalle: String(values.mahalle),
        alanM2: Number(values.alanM2),
        urunIsmi: String(values.urunIsmi),
        cesitIsmi: String(values.cesitIsmi),
        dikimTarihi: String(values.dikimTarihi),
        dikimYogunlugu: String(values.dikimYogunlugu),
        siraArasiMesafe: Number(values.siraArasiMesafe),
        setUstuMesafe: Number(values.setUstuMesafe),
        siraType: values.siraType as 'tek' | 'cift',
        dikimYonu: values.dikimYonu as 'kuzey-guney' | 'dogu-bati',
        suKaynagi: String(values.suKaynagi),
        damlamaSistemiAdeti: Number(values.damlamaSistemiAdeti),
        damlamaDebisi: String(values.damlamaDebisi),
        sulamaSekli: String(values.sulamaSekli),
        nemlendirmeSistemi: Boolean(values.nemlendirmeSistemi),
        toprakYapisi: values.toprakYapisi as 'tasli' | 'kumlu' | 'tinli' | 'killi' | 'marnli' | 'humuslu' | 'kirecli',
        drenajSeviyesi: values.drenajSeviyesi as 'cok-iyi' | 'iyi' | 'orta' | 'kotu' | 'cok-kotu',
        isitmaSistemi: String(values.isitmaSistemi),
        havalandirma: values.havalandirma as 'tepe' | 'oluk-ustu' | 'yandan' | 'yandan-oluk-ustu',
        tulBilgisi: Boolean(values.tulBilgisi),
        kulturelIslemler: values.kulturelIslemler as 'isci' | 'kendi' | 'isci-kendi',
        teknikDegerlendirme: String(values.teknikDegerlendirme)
      };

      // Add optional fields only if they have values
      if (values.plastikYil && Number(values.plastikYil) > 0) {
        (uretimAlaniData as UretimAlani).plastikYil = Number(values.plastikYil);
      }
      
      if (values.katmanType) {
        (uretimAlaniData as UretimAlani).katmanType = values.katmanType as 'tek' | 'cift';
      }
      
      if (values.tulType) {
        (uretimAlaniData as UretimAlani).tulType = values.tulType as 'ari' | 'bocek' | 'ari-bocek';
      }

      if (editingArea) {
        await updateUretimAlani(editingArea.id, uretimAlaniData);
      } else {
        await saveUretimAlani(uretimAlaniData);
      }

      await loadExistingAreas();
      setCurrentStep('list');
      setEditingArea(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (area: UretimAlani) => {
    setEditingArea(area);
    setCurrentStep('form');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu üretim alanını silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      await deleteUretimAlani(id);
      await loadExistingAreas();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setExistingAreas([]);
    setEditingArea(null);
    setError(null);
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">

          
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Üretim Alanı Bilgisi
            </h1>
            <p className="text-slate-600 text-lg">
              Üretim alanı kaydetmek için önce bir üretici seçin
            </p>
          </div>

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
                <span className="ml-2">Üretim Alanı</span>
              </div>
            </div>
          </div>

          <UreticiListesi
            selectionMode={true}
            onSelect={handleProducerSelect}
            selectedProducer={selectedProducer}
          />
        </div>
      </div>
    );
  }

  // Areas List Step
  if (currentStep === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">

          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">
                    {selectedProducer?.gender === 'Erkek' ? '👨' : selectedProducer?.gender === 'Kadın' ? '👩' : '👤'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    {selectedProducer?.firstName} {selectedProducer?.lastName} - Üretim Alanları
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  👤 Üretici Değiştir
                </button>
                <button
                  onClick={() => {
                    setEditingArea(null);
                    setCurrentStep('form');
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  + Yeni Üretim Alanı
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            /* Areas List */
            <div className="space-y-4">
              {existingAreas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🏭</span>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Üretim alanı bulunamadı</h3>
                    <p className="text-slate-600 mb-6">Bu üretici için henüz kayıtlı üretim alanı bulunmuyor.</p>
                    <button
                      onClick={() => {
                        setEditingArea(null);
                        setCurrentStep('form');
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                    >
                      İlk Üretim Alanını Ekle
                    </button>
                  </div>
                </div>
              ) : (
                existingAreas.map(area => (
                  <div key={area.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 lg:mb-0">
                        <div>
                          <h3 className="font-semibold text-slate-800 mb-1">
                            {area.urunIsmi} - {area.cesitIsmi}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            {area.alanM2} m² | {area.seraType.charAt(0).toUpperCase() + area.seraType.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Lokasyon</p>
                          <p className="font-medium text-slate-800">
                            {area.mahalle} / Ada: {area.ada} / Parsel: {area.parsel}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Dikim Tarihi</p>
                          <p className="font-medium text-slate-800">
                            {new Date(area.dikimTarihi).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(area)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form Step - Continue in next part due to length...
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                {editingArea ? 'Üretim Alanını Düzenle' : 'Yeni Üretim Alanı Ekle'}
              </h1>
              <p className="text-slate-600">
                {selectedProducer?.firstName} {selectedProducer?.lastName} için
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('list')}
              className="mt-4 lg:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri Dön
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-8">
                {/* Sera Tipi Bilgileri */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                    🏭 Üretim  Tipi Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Üretim Tipi
                      </label>
                      <Field as="select" name="seraType" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                        <option value="">Seçiniz...</option>
                        <option value="cam">Cam</option>
                        <option value="plastik">Plastik</option>
                        <option value="acikalan">Açık Alan</option>
                      </Field>
                      <ErrorMessage name="seraType" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    {values.seraType === 'plastik' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kaç Yıllık
                          </label>
                          <Field
                            type="number"
                            name="plastikYil"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            placeholder="Örn: 3"
                          />
                          <ErrorMessage name="plastikYil" component="div" className="text-red-500 text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Katman Tipi
                          </label>
                          <Field as="select" name="katmanType" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                            <option value="">Seçiniz...</option>
                            <option value="tek">Tek Katmı</option>
                            <option value="cift">Çift Katmı</option>
                          </Field>
                          <ErrorMessage name="katmanType" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Lokasyon Bilgileri */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                    📍 Lokasyon Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ada
                      </label>
                      <Field
                        type="text"
                        name="ada"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: 123"
                      />
                      <ErrorMessage name="ada" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Parsel
                      </label>
                      <Field
                        type="text"
                        name="parsel"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: 45"
                      />
                      <ErrorMessage name="parsel" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mahalle
                      </label>
                      <Field
                        type="text"
                        name="mahalle"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: Merkez Mahalle"
                      />
                      <ErrorMessage name="mahalle" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alan (m²)
                      </label>
                      <Field
                        type="number"
                        name="alanM2"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: 1000"
                      />
                      <ErrorMessage name="alanM2" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                </div>

                                 {/* Ürün Bilgileri */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     🌱 Ürün Bilgileri
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Ürün İsmi
                       </label>
                       <Field
                         type="text"
                         name="urunIsmi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: Domates"
                       />
                       <ErrorMessage name="urunIsmi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Çeşit İsmi
                       </label>
                       <Field
                         type="text"
                         name="cesitIsmi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: Beef Tomato"
                       />
                       <ErrorMessage name="cesitIsmi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Dikim Tarihi
                       </label>
                       <Field
                         type="date"
                         name="dikimTarihi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                       />
                       <ErrorMessage name="dikimTarihi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>
                   </div>
                 </div>

                 {/* Dikim Detayları */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     🌾 Dikim Detayları
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div className="lg:col-span-2">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Dikim Yoğunluğu
                       </label>
                       <Field
                         type="text"
                         name="dikimYogunlugu"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: 2.5 bitki/m²"
                       />
                       <ErrorMessage name="dikimYogunlugu" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Sıra Arası Mesafe (cm)
                       </label>
                       <Field
                         type="number"
                         name="siraArasiMesafe"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: 120"
                       />
                       <ErrorMessage name="siraArasiMesafe" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Set Üstü Mesafe (cm)
                       </label>
                       <Field
                         type="number"
                         name="setUstuMesafe"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: 40"
                       />
                       <ErrorMessage name="setUstuMesafe" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Sıra Tipi
                       </label>
                       <Field as="select" name="siraType" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="tek">Tek Sıra</option>
                         <option value="cift">Çift Sıra</option>
                       </Field>
                       <ErrorMessage name="siraType" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Dikim Yönü
                       </label>
                       <Field as="select" name="dikimYonu" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="kuzey-guney">Kuzey-Güney</option>
                         <option value="dogu-bati">Doğu-Batı</option>
                       </Field>
                       <ErrorMessage name="dikimYonu" component="div" className="text-red-500 text-xs mt-1" />
                     </div>
                   </div>
                 </div>

                 {/* Su ve Sulama */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     💧 Su ve Sulama Sistemi
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Su Kaynağı
                       </label>
                       <Field
                         type="text"
                         name="suKaynagi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: Kuyu, Şebeke"
                       />
                       <ErrorMessage name="suKaynagi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Damlama Sistemi Adeti
                       </label>
                       <Field
                         type="number"
                         name="damlamaSistemiAdeti"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: 4"
                       />
                       <ErrorMessage name="damlamaSistemiAdeti" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Damlama Debisi
                       </label>
                       <Field
                         type="text"
                         name="damlamaDebisi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: 4 L/h, 8 L/h"
                       />
                       <ErrorMessage name="damlamaDebisi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Sulama Şekli
                       </label>
                       <Field
                         type="text"
                         name="sulamaSekli"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: Manuel, Otomatik, Damla Sulama"
                       />
                       <ErrorMessage name="sulamaSekli" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="flex items-start lg:items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                         <Field
                           type="checkbox"
                           name="nemlendirmeSistemi"
                           className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 lg:mt-0 flex-shrink-0"
                         />
                         <div className="flex-1">
                           <span className="text-sm lg:text-base font-semibold text-gray-700">
                             Nemlendirme Sistemi Var mı?
                           </span>
                         </div>
                       </label>
                       <ErrorMessage name="nemlendirmeSistemi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>
                   </div>
                 </div>

                 {/* Toprak Bilgileri */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     🌍 Toprak Bilgileri
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Toprak Yapısı
                       </label>
                       <Field as="select" name="toprakYapisi" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="tasli">Taşlı</option>
                         <option value="kumlu">Kumlu</option>
                         <option value="tinli">Tınlı</option>
                         <option value="killi">Killi</option>
                         <option value="marnli">Marnlı</option>
                         <option value="humuslu">Humuslu</option>
                         <option value="kirecli">Kireçli</option>
                       </Field>
                       <ErrorMessage name="toprakYapisi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Drenaj Seviyesi / Su Tutma Kapasitesi
                       </label>
                       <Field as="select" name="drenajSeviyesi" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="cok-iyi">Çok İyi</option>
                         <option value="iyi">İyi</option>
                         <option value="orta">Orta</option>
                         <option value="kotu">Kötü</option>
                         <option value="cok-kotu">Çok Kötü</option>
                       </Field>
                       <ErrorMessage name="drenajSeviyesi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>
                   </div>
                 </div>

                 {/* Sistem Bilgileri */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     🔧 Sistem Bilgileri
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Isıtma Sistemi
                       </label>
                       <Field
                         type="text"
                         name="isitmaSistemi"
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                         placeholder="Örn: Merkezi, Kombi, Yok"
                       />
                       <ErrorMessage name="isitmaSistemi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Havalandırma
                       </label>
                       <Field as="select" name="havalandirma" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="tepe">Tepe</option>
                         <option value="oluk-ustu">Oluk Üstü</option>
                         <option value="yandan">Yandan</option>
                         <option value="yandan-oluk-ustu">Yandan + Oluk Üstü</option>
                       </Field>
                       <ErrorMessage name="havalandirma" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div className="lg:col-span-2">
                       <label className="flex items-start lg:items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                         <Field
                           type="checkbox"
                           name="tulBilgisi"
                           className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 lg:mt-0 flex-shrink-0"
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                             setFieldValue('tulBilgisi', e.target.checked);
                             if (!e.target.checked) {
                               setFieldValue('tulType', '');
                             }
                           }}
                         />
                         <div className="flex-1">
                           <span className="text-sm lg:text-base font-semibold text-gray-700">
                             Tül Bilgisi Var mı?
                           </span>
                         </div>
                       </label>
                       <ErrorMessage name="tulBilgisi" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     {values.tulBilgisi && (
                       <div className="lg:col-span-2">
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                           Tül Tipi
                         </label>
                         <Field as="select" name="tulType" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                           <option value="">Seçiniz...</option>
                           <option value="ari">Arı Tülü</option>
                           <option value="bocek">Böcek Tülü</option>
                           <option value="ari-bocek">Arı + Böcek Tülü</option>
                         </Field>
                         <ErrorMessage name="tulType" component="div" className="text-red-500 text-xs mt-1" />
                       </div>
                     )}
                   </div>
                 </div>

                 {/* İşçilik ve Değerlendirme */}
                 <div>
                   <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-200 pb-2">
                     👥 İşçilik ve Teknik Değerlendirme
                   </h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Kültürel İşlemleri Kim Yapacak
                       </label>
                       <Field as="select" name="kulturelIslemler" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200">
                         <option value="">Seçiniz...</option>
                         <option value="isci">İşçi</option>
                         <option value="kendi">Kendisi</option>
                         <option value="isci-kendi">İşçi + Kendisi</option>
                       </Field>
                       <ErrorMessage name="kulturelIslemler" component="div" className="text-red-500 text-xs mt-1" />
                     </div>

                     <div className="lg:col-span-2">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Teknik Ekip Değerlendirme Alanı
                       </label>
                       <Field
                         as="textarea"
                         name="teknikDegerlendirme"
                         rows={4}
                         className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-vertical min-h-[100px]"
                         placeholder="Teknik ekip değerlendirmesi ve önerileri..."
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
                       <ErrorMessage name="teknikDegerlendirme" component="div" className="text-red-500 text-xs mt-1" />
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-blue-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? '⏳ Kaydediliyor...' : (editingArea ? '💾 Güncelle' : '💾 Kaydet')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('list')}
                    className="flex-1 sm:flex-none bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    ❌ İptal
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default UretimAlanBilgisi; 