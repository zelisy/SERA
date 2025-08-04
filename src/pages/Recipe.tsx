import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import UreticiListesi from '../components/UreticiListesi';
import type { Producer } from '../types/producer';
import type { Recipe } from '../types/recipe';
import { getRecipesByProducer, deleteRecipe, getAllRecipes } from '../utils/recipeUtils';
import { getProducerById } from '../utils/firestoreUtils';

const RecipePage: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'recipe-management' | 'all-recipes'>('select-producer');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('recipe-management');
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setRecipes([]);
    setError(null);
    // Clear URL parameter
    navigate('/admin/recipes');
  };

  const handleCreateRecipe = (producerId: string) => {
    navigate(`/admin/recipe/create/${producerId}`);
  };

  const loadRecipes = async () => {
    if (!selectedProducer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const recipeList = await getRecipesByProducer(selectedProducer.id);
      setRecipes(recipeList);
    } catch (err) {
      setError('Reçeteler yüklenirken bir hata oluştu');
      console.error('Reçete yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const recipeList = await getAllRecipes();
      setRecipes(recipeList);
    } catch (err) {
      setError('Reçeteler yüklenirken bir hata oluştu');
      console.error('Reçete yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm('Bu reçeteyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      setLoading(true);
      await deleteRecipe(recipeId);
      await loadRecipes();
    } catch (err) {
      setError('Reçete silinirken bir hata oluştu');
      console.error('Reçete silme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (recipe: Recipe) => {
    try {
      // Create HTML content for PDF
      const container = document.createElement('div');
      container.style.width = '210mm';
      container.style.padding = '20mm';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.color = '#333';
      container.style.background = 'white';

      container.innerHTML = `
        <style>
          .pdf-container { max-width: 170mm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
          .date { font-size: 12px; color: #9ca3af; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .info-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; margin-bottom: 10px; }
          .info-label { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
          .info-value { font-size: 14px; font-weight: bold; color: #1f2937; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .table th, .table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11px; }
          .table th { background: #f3f4f6; font-weight: bold; }
          .table tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .status-completed { color: #059669; font-weight: bold; }
          .status-pending { color: #dc2626; font-weight: bold; }
        </style>
        
        <div class="pdf-container">
          <!-- Header -->
          <div class="header">
            <div class="title">Bioera Tarım Danışmanlığı</div>
            <div class="subtitle">Reçete Raporu</div>
            <div class="date">Tarih: ${new Date(recipe.createdAt).toLocaleDateString('tr-TR')}</div>
          </div>

          <!-- Üretici Bilgileri -->
          <div class="section">
            <div class="section-title">Üretici Bilgileri</div>
            <div class="info-card">
              <div class="info-label">Ad Soyad</div>
              <div class="info-value">${recipe.producerName}</div>
            </div>
          </div>

          <!-- Gübreleme Programı -->
          <div class="section">
            <div class="section-title">Gübreleme Programı</div>
            ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3]
              .filter(Boolean)
              .map((fert, index) => `
                <div class="info-card">
                  <div class="info-label">${index + 1}. Gübreleme Uygulaması</div>
                  <div class="info-value">${fert}</div>
                </div>
              `).join('')}
            ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3].filter(Boolean).length === 0 ? 
              '<div class="info-card"><div class="info-value">Gübreleme programı belirtilmemiş</div></div>' : ''}
          </div>

          <!-- Üstten Besleme -->
          ${recipe.topFeeding ? `
            <div class="section">
              <div class="section-title">Üstten Besleme</div>
              <div class="info-card">
                <div class="info-value">${recipe.topFeeding}</div>
              </div>
            </div>
          ` : ''}

          <!-- Sera İçi Kontrol Verileri -->
          ${recipe.selectedSeraKontrolData ? `
            <div class="section">
              <div class="section-title">Sera İçi Kontrol Verileri</div>
              <div class="info-card">
                <div class="info-label">Kontrol Tarihi</div>
                <div class="info-value">${new Date(recipe.selectedSeraKontrolData.date).toLocaleDateString('tr-TR')}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Kontrol Saati</div>
                <div class="info-value">${recipe.selectedSeraKontrolData.timeFormatted || 'Belirtilmemiş'}</div>
              </div>
              ${recipe.selectedSeraKontrolData.items ? `
                <table class="table">
                  <thead>
                    <tr>
                      <th>Kontrol Maddesi</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recipe.selectedSeraKontrolData.items.slice(0, 8).map(item => `
                      <tr>
                        <td>${item.label}</td>
                        <td class="${item.completed ? 'status-completed' : 'status-pending'}">
                          ${item.completed ? '✓ Tamamlandı' : '✗ Eksik'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
            </div>
          ` : ''}

          <!-- Hava Durumu -->
          ${recipe.weatherData && recipe.weatherData.length > 0 ? `
            <div class="section">
              <div class="section-title">Hava Durumu Bilgileri</div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Gün</th>
                    <th>Sıcaklık</th>
                  </tr>
                </thead>
                <tbody>
                  ${recipe.weatherData.slice(0, 5).map(weather => `
                    <tr>
                      <td>${weather.day}</td>
                      <td>${weather.icon} ${weather.minTemp}°C - ${weather.maxTemp}°C</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Danışman Notları -->
          ${recipe.notes ? `
            <div class="section">
              <div class="section-title">Danışman Notları ve Öneriler</div>
              <div class="info-card">
                <div class="info-value">${recipe.notes}</div>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</div>
            <div>Bioera Tarım Danışmanlık Sistemi</div>
          </div>
        </div>
      `;

      // Add to document temporarily
      document.body.appendChild(container);

      // Convert to canvas and then to PDF
      import('html2canvas').then(async ({ default: html2canvas }) => {
        try {
          const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            background: '#ffffff',
            scale: 2
          });

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
          const fileName = `Bioera_Recete_${recipe.producerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
          pdf.save(fileName);

          // Clean up
          document.body.removeChild(container);
        } catch (error) {
          console.error('Canvas to PDF error:', error);
          document.body.removeChild(container);
          alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }).catch(error => {
        console.error('html2canvas import error:', error);
        document.body.removeChild(container);
        alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      });

    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const previewPDF = (recipe: Recipe) => {
    try {
      // Create HTML content for PDF
      const container = document.createElement('div');
      container.style.width = '210mm';
      container.style.padding = '20mm';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.color = '#333';
      container.style.background = 'white';

      container.innerHTML = `
        <style>
          .pdf-container { max-width: 170mm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
          .date { font-size: 12px; color: #9ca3af; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .info-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; margin-bottom: 10px; }
          .info-label { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
          .info-value { font-size: 14px; font-weight: bold; color: #1f2937; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .table th, .table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11px; }
          .table th { background: #f3f4f6; font-weight: bold; }
          .table tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .status-completed { color: #059669; font-weight: bold; }
          .status-pending { color: #dc2626; font-weight: bold; }
        </style>
        
        <div class="pdf-container">
          <!-- Header -->
          <div class="header">
            <div class="title">Bioera Tarım Danışmanlığı</div>
            <div class="subtitle">Reçete Raporu</div>
            <div class="date">Tarih: ${new Date(recipe.createdAt).toLocaleDateString('tr-TR')}</div>
          </div>

          <!-- Üretici Bilgileri -->
          <div class="section">
            <div class="section-title">Üretici Bilgileri</div>
            <div class="info-card">
              <div class="info-label">Ad Soyad</div>
              <div class="info-value">${recipe.producerName}</div>
            </div>
          </div>

          <!-- Gübreleme Programı -->
          <div class="section">
            <div class="section-title">Gübreleme Programı</div>
            ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3]
              .filter(Boolean)
              .map((fert, index) => `
                <div class="info-card">
                  <div class="info-label">${index + 1}. Gübreleme Uygulaması</div>
                  <div class="info-value">${fert}</div>
                </div>
              `).join('')}
            ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3].filter(Boolean).length === 0 ? 
              '<div class="info-card"><div class="info-value">Gübreleme programı belirtilmemiş</div></div>' : ''}
          </div>

          <!-- Üstten Besleme -->
          ${recipe.topFeeding ? `
            <div class="section">
              <div class="section-title">Üstten Besleme</div>
              <div class="info-card">
                <div class="info-value">${recipe.topFeeding}</div>
              </div>
            </div>
          ` : ''}

          <!-- Sera İçi Kontrol Verileri -->
          ${recipe.selectedSeraKontrolData ? `
            <div class="section">
              <div class="section-title">Sera İçi Kontrol Verileri</div>
              <div class="info-card">
                <div class="info-label">Kontrol Tarihi</div>
                <div class="info-value">${new Date(recipe.selectedSeraKontrolData.date).toLocaleDateString('tr-TR')}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Kontrol Saati</div>
                <div class="info-value">${recipe.selectedSeraKontrolData.timeFormatted || 'Belirtilmemiş'}</div>
              </div>
              ${recipe.selectedSeraKontrolData.items ? `
                <table class="table">
                  <thead>
                    <tr>
                      <th>Kontrol Maddesi</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recipe.selectedSeraKontrolData.items.slice(0, 8).map(item => `
                      <tr>
                        <td>${item.label}</td>
                        <td class="${item.completed ? 'status-completed' : 'status-pending'}">
                          ${item.completed ? '✓ Tamamlandı' : '✗ Eksik'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
            </div>
          ` : ''}

          <!-- Hava Durumu -->
          ${recipe.weatherData && recipe.weatherData.length > 0 ? `
            <div class="section">
              <div class="section-title">Hava Durumu Bilgileri</div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Gün</th>
                    <th>Sıcaklık</th>
                  </tr>
                </thead>
                <tbody>
                  ${recipe.weatherData.slice(0, 5).map(weather => `
                    <tr>
                      <td>${weather.day}</td>
                      <td>${weather.icon} ${weather.minTemp}°C - ${weather.maxTemp}°C</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Danışman Notları -->
          ${recipe.notes ? `
            <div class="section">
              <div class="section-title">Danışman Notları ve Öneriler</div>
              <div class="info-card">
                <div class="info-value">${recipe.notes}</div>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</div>
            <div>Bioera Tarım Danışmanlık Sistemi</div>
          </div>
        </div>
      `;

      // Add to document temporarily
      document.body.appendChild(container);

      // Convert to canvas and then to PDF
      import('html2canvas').then(async ({ default: html2canvas }) => {
        try {
          const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            background: '#ffffff',
            scale: 2
          });

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

          // Open PDF in new window
          const pdfBlob = pdf.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          window.open(url, '_blank');
          
          // Clean up
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          document.body.removeChild(container);
        } catch (error) {
          console.error('Canvas to PDF error:', error);
          document.body.removeChild(container);
          alert('PDF önizlenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }).catch(error => {
        console.error('html2canvas import error:', error);
        document.body.removeChild(container);
        alert('PDF önizlenirken bir hata oluştu. Lütfen tekrar deneyin.');
      });

    } catch (error) {
      console.error('PDF önizleme hatası:', error);
      alert('PDF önizlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle URL parameters for producer selection
  useEffect(() => {
    const producerId = searchParams.get('producerId');
    if (producerId && !selectedProducer) {
      const loadProducer = async () => {
        try {
          setLoading(true);
          const producer = await getProducerById(producerId);
          if (producer) {
            setSelectedProducer(producer);
            setCurrentStep('recipe-management');
          }
        } catch (err) {
          console.error('Üretici yükleme hatası:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProducer();
    }
  }, [searchParams, selectedProducer]);

  // Reçeteleri yükle
  useEffect(() => {
    if (currentStep === 'recipe-management' && selectedProducer) {
      loadRecipes();
    } else if (currentStep === 'all-recipes') {
      loadAllRecipes();
    }
  }, [currentStep, selectedProducer]);

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Reçete Yönetimi</h1>
            <p className="text-slate-600 text-sm">Reçete işlemlerini başlatmak için önce bir üretici seçin</p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-slate-600">
                <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 font-medium text-sm">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-slate-200 rounded"></div>
              <div className="flex items-center text-slate-400">
                <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm">Reçete Yönetimi</span>
              </div>
            </div>
          </div>

          {/* Tüm Reçeteler Butonu */}
          <div className="text-center">
            <button
              onClick={() => setCurrentStep('all-recipes')}
              className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              Tüm Reçeteleri Görüntüle
            </button>
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

  // All Recipes Step
  if (currentStep === 'all-recipes') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">Tüm Reçeteler</h1>
              <p className="text-slate-600 text-sm">{recipes.length} reçete bulundu</p>
            </div>
            <button
              onClick={() => setCurrentStep('select-producer')}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Recipe List */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-slate-900">Reçete Listesi</h2>
              <button
                onClick={loadAllRecipes}
                disabled={loading}
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Yükleniyor...' : 'Yenile'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-600 text-sm">Yükleniyor...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Henüz Reçete Yok</h3>
                <p className="text-slate-600 mb-6 text-sm">Henüz hiç reçete oluşturulmamış.</p>
                <button
                  onClick={() => setCurrentStep('select-producer')}
                  className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  İlk Reçeteyi Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📋</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 text-sm">
                              Reçete #{recipe.id.slice(-6)}
                            </h3>
                            <p className="text-xs text-slate-600">
                              Üretici: {recipe.producerName}
                            </p>
                            <p className="text-xs text-slate-600">
                              Oluşturulma: {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs">Gübreleme Programı</h4>
                            <div className="space-y-2">
                              {recipe.fertilization1 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">1. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization1}</p>
                                </div>
                              )}
                              {recipe.fertilization2 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">2. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization2}</p>
                                </div>
                              )}
                              {recipe.fertilization3 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">3. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization3}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs">Üstten Besleme</h4>
                            {recipe.topFeeding ? (
                              <div className="bg-slate-50 p-2 rounded text-xs">
                                <p className="text-slate-700">{recipe.topFeeding}</p>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs italic">Üstten besleme bilgisi yok</p>
                            )}
                            
                            {recipe.notes && (
                              <div className="mt-3">
                                <h4 className="font-medium text-slate-700 mb-2 text-xs">Notlar</h4>
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <p className="text-slate-700">{recipe.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => previewPDF(recipe)}
                            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                            title="PDF Önizle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => generatePDF(recipe)}
                            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                            title="PDF İndir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Reçeteyi Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Recipe Management Step
  if (currentStep === 'recipe-management') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header with Producer Info */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-slate-600 text-sm">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCreateRecipe(selectedProducer!.id)}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  + Yeni Reçete
                </button>
                <button
                  onClick={resetSelection}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Üretici Değiştir
                </button>
              </div>
            </div>
          </div>

          {/* Recipe List */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-medium text-slate-900">
                Reçeteler ({recipes.length})
              </h2>
              <button
                onClick={loadRecipes}
                disabled={loading}
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Yükleniyor...' : 'Yenile'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-600 text-sm">Yükleniyor...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">Henüz Reçete Yok</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  {selectedProducer?.firstName} {selectedProducer?.lastName} için henüz reçete oluşturulmamış.
                </p>
                <button
                  onClick={() => handleCreateRecipe(selectedProducer!.id)}
                  className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  İlk Reçeteyi Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">📋</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 text-sm">
                              Reçete #{recipe.id.slice(-6)}
                            </h3>
                            <p className="text-xs text-slate-600">
                              Oluşturulma: {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs">Gübreleme Programı</h4>
                            <div className="space-y-2">
                              {recipe.fertilization1 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">1. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization1}</p>
                                </div>
                              )}
                              {recipe.fertilization2 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">2. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization2}</p>
                                </div>
                              )}
                              {recipe.fertilization3 && (
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <span className="font-medium text-slate-700">3. Gübreleme:</span>
                                  <p className="text-slate-600 mt-1">{recipe.fertilization3}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs">Üstten Besleme</h4>
                            {recipe.topFeeding ? (
                              <div className="bg-slate-50 p-2 rounded text-xs">
                                <p className="text-slate-700">{recipe.topFeeding}</p>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs italic">Üstten besleme bilgisi yok</p>
                            )}
                            
                            {recipe.notes && (
                              <div className="mt-3">
                                <h4 className="font-medium text-slate-700 mb-2 text-xs">Notlar</h4>
                                <div className="bg-slate-50 p-2 rounded text-xs">
                                  <p className="text-slate-700">{recipe.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => previewPDF(recipe)}
                            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                            title="PDF Önizle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => generatePDF(recipe)}
                            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                            title="PDF İndir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Reçeteyi Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RecipePage; 