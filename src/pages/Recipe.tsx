import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import UreticiListesi from '../components/UreticiListesi';
import type { Producer } from '../types/producer';
import type { Recipe } from '../types/recipe';
import type { ChecklistItem } from '../types/checklist';
import { getRecipesByProducer, deleteRecipe } from '../utils/recipeUtils';
import { getProducerById, getUretimAlanlariByProducer } from '../utils/firestoreUtils';
import { fetchWeatherData } from '../utils/weatherUtils';

const RecipePage: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'select-area' | 'recipe-management'>('select-producer');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Üretim alanları için state
  const [uretimAlanlari, setUretimAlanlari] = useState<any[]>([]);
  const [selectedUretimAlani, setSelectedUretimAlani] = useState<any | null>(null);

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('select-area');
    loadUretimAlanlari(producer.id);
  };

  // Üretim alanlarını çek
  const loadUretimAlanlari = async (producerId: string) => {
    try {
      const alanlar = await getUretimAlanlariByProducer(producerId);
      setUretimAlanlari(alanlar);
    } catch (err) {
      setUretimAlanlari([]);
    }
  };

  const handleUretimAlaniSelect = (area: any) => {
    setSelectedUretimAlani(area);
    setCurrentStep('recipe-management');
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setRecipes([]);
    setError(null);
    setUretimAlanlari([]);
    setSelectedUretimAlani(null);
    // Clear URL parameter
    navigate('/admin/recipes');
  };

  const handleCreateRecipe = () => {
    if (!selectedProducer || !selectedUretimAlani) return;
    navigate(`/admin/recipes/create?producerId=${selectedProducer.id}&uretimAlaniId=${selectedUretimAlani.id}`);
  };

  const loadRecipes = async () => {
    if (!selectedProducer || !selectedUretimAlani) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const recipeList = await getRecipesByProducer(selectedProducer.id);
      // Üretim alanına göre filtrele
      const filteredRecipes = recipeList.filter(recipe => !recipe.uretimAlaniId || recipe.uretimAlaniId === selectedUretimAlani.id);
      setRecipes(filteredRecipes);
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

  const generatePDF = async (recipe: Recipe) => {
    try {
      // Hava durumu verilerini al (otomatik konum algılama ile)
      const weatherData = await fetchWeatherData();
      // Parse fonksiyonları
      const parseFertilizationData = (fertString: string) => {
        // Örnek format: "2025-07-31 03:40 - Su: 100ml, Süre: 3dk, Ürünler: aaa"
        const timeMatch = fertString.match(/(\d{2}:\d{2})/);
        const dateMatch = fertString.match(/(\d{4}-\d{2}-\d{2})/);
        const waterMatch = fertString.match(/Su:\s*(\d+)ml/);
        const durationMatch = fertString.match(/Süre:\s*(\d+)dk/);
        const productsMatch = fertString.match(/Ürünler:\s*(.+)/);
        
        return {
          time: timeMatch ? timeMatch[1] : 'Belirtilmemiş',
          date: dateMatch ? dateMatch[1].split('-').reverse().join('.') : 'Belirtilmemiş',
          water: waterMatch ? waterMatch[1] : 'Belirtilmemiş',
          duration: durationMatch ? durationMatch[1] : 'Belirtilmemiş',
          products: productsMatch ? productsMatch[1].split(',').map(p => p.trim()) : []
        };
      };

      const parseTopFeedingData = (feedingString: string) => {
        // Örnek format: "2025-08-09 02:40 - sas"
        const parts = feedingString.split(' - ');
        if (parts.length >= 2) {
          const dateTime = parts[0];
          const products = parts[1];
          
          const timeMatch = dateTime.match(/(\d{2}:\d{2})/);
          const dateMatch = dateTime.match(/(\d{4}-\d{2}-\d{2})/);
          
          return [{
            time: timeMatch ? timeMatch[1] : 'Belirtilmemiş',
            date: dateMatch ? dateMatch[1].split('-').reverse().join('.') : 'Belirtilmemiş',
            products: [products]
          }];
        }
        return [];
      };

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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
          .pdf-container { max-width: 210mm; margin: 0 auto; padding: 20px; background: white; border: 1px solid #000; }
          
          /* Header Section */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #10b981; }
          .logo { font-size: 50px; font-weight: 900; color: #10b981; text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 1px 1px 2px rgba(0,0,0,0.2), 0 0 8px rgba(16, 185, 129, 0.4); font-family: 'Segoe UI', sans-serif; -webkit-text-stroke: 1px rgba(16, 185, 129, 0.8); letter-spacing: 2px; }
          .header-info { text-align: right; }
          .header-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 5px; font-family: 'Segoe UI', sans-serif; }
          .header-datetime { font-size: 11px; color: #6b7280; margin-bottom: 10px; font-family: 'Segoe UI', sans-serif; font-weight: 500; }
          .header-producer-details { display: flex; flex-direction: column; gap: 3px; }
          .producer-detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 10px; line-height: 1.1; }
          .producer-detail-label { color: #6b7280; font-weight: 600; font-family: 'Segoe UI', sans-serif; }
          .producer-detail-value { color: #111827; font-weight: 700; font-family: 'Segoe UI', sans-serif; }
          
          /* Producer Info Section */
          .producer-info { background: #f8fafc; border-radius: 12px; padding: 15px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
          .producer-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .producer-info-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
          .producer-info-label { font-size: 12px; color: #64748b; font-weight: 600; }
          .producer-info-value { font-size: 13px; color: #1f2937; font-weight: 700; }
          
          /* Main Content Grid */
          .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
          
          /* Section Cards */
          .section-card { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 10px; display: flex; align-items: center; }
          .section-subtitle { font-size: 12px; color: #6b7280; margin-bottom: 15px; font-weight: 500; }
          
          /* Application Cards */
          .application-card { background: #10b981; border-radius: 8px; padding: 7px 8px; margin-bottom: 6px; color: white; font-size: 9px; }
          .application-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .application-time { font-size: 11px; font-weight: 600; }
          .application-date { font-size: 11px; font-weight: 600; }
          .application-details { font-size: 10px; line-height: 1.4; }
          .application-products { margin-top: 5px; }
          .product-item { text-decoration: underline; }
          
          /* Control Section */
          .control-card { background: #10b981; border-radius: 8px; padding: 12px; margin-bottom: 10px; color: white; }
          .control-item { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; }
          .control-label { font-weight: 600; }
          .control-value { font-weight: 500; }
          
          /* Weather Section */
          .weather-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .weather-table th, .weather-table td { padding: 4px 6px; text-align: center; font-size: 10px; }
          .weather-table th { background: #10b981; color: white; font-weight: 600; }
          .weather-table td { background: #f8fafc; }
          .weather-icon { font-size: 12px; }
          .temp-bar { background: #10b981; height: 4px; border-radius: 2px; margin: 2px 0; }
          
          /* Footer */
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
        
                <div class="pdf-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">Agrovia</div>
            <div class="header-info">
              <div class="header-title">Üretici Bilgisi</div>
              <div class="header-datetime">Saat: ${new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})} / Tarih: ${new Date().toLocaleDateString('tr-TR')}</div>
              <div class="header-producer-details">
                <div class="producer-detail-row">
                  <span class="producer-detail-label">Ad Soyad:</span>
                  <span class="producer-detail-value">${recipe.producerName}</span>
                </div>
                <div class="producer-detail-row">
                  <span class="producer-detail-label">TC:</span>
                  <span class="producer-detail-value">${selectedProducer?.tcNo || 'Belirtilmemiş'}</span>
                </div>
                <div class="producer-detail-row">
                  <span class="producer-detail-label">Tel:</span>
                  <span class="producer-detail-value">${selectedProducer?.phone || 'Belirtilmemiş'}</span>
                </div>
                <div class="producer-detail-row">
                  <span class="producer-detail-label">Adres:</span>
                  <span class="producer-detail-value">${selectedProducer?.address || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </div>
          </div>



          <!-- Ana İçerik Grid -->
          <div class="content-grid">
            <!-- Gübreleme Programı -->
            <div class="section-card">
              <div class="section-title">🌱 Gübreleme Programı</div>
              <div class="section-subtitle">1 Dönüme / Dekara</div>
              <div style="max-height: 80mm; overflow: auto;">
                ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3]
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((fert) => {
                    const fertData = parseFertilizationData(fert);
                    return `
                      <div class="application-card">
                        <div class="application-header">
                          <span class="application-time">Saat: ${fertData.time}</span>
                          <span class="application-date">Tarih: ${fertData.date}</span>
                        </div>
                        <div class="application-details">
                          Su: ${fertData.water} ml<br>
                          dk: ${fertData.duration} dk<br>
                          <div class="application-products">
                            ${fertData.products.map(product => `<span class="product-item">${product}</span>`).join(', ')}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                ${[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3].filter(Boolean).length === 0 ? 
                  '<div class="application-card"><div class="application-details">Gübreleme programı belirtilmemiş</div></div>' : ''}
              </div>
            </div>

            <!-- Üstten Besleme -->
            <div class="section-card">
              <div class="section-title">💧 Üsten Besleme</div>
              <div class="section-subtitle">100 lt suya</div>
              ${recipe.topFeeding ? `
                ${parseTopFeedingData(recipe.topFeeding).map((feed) => {
                  return `
                    <div class="application-card">
                      <div class="application-header">
                        <span class="application-time">Saat: ${feed.time}</span>
                        <span class="application-date">Tarih: ${feed.date}</span>
                      </div>
                      <div class="application-details">
                        <div class="application-products">
                          ${feed.products.map(product => `<span class="product-item">${product}</span>`).join(', ')}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              ` : '<div class="application-card"><div class="application-details">Üstten besleme belirtilmemiş</div></div>'}
            </div>
          </div>

          <!-- Alt Grid - Sera Kontrolleri ve Hava Durumu -->
          <div class="content-grid">
            <!-- Sera İçi Kontroller -->
            <div class="section-card">
              <div class="section-title">🔍 Sera İçi Kontroller</div>
              ${recipe.selectedSeraKontrolData ? `
                <div class="control-card">
                  ${(() => {
                    const filteredItems = recipe.selectedSeraKontrolData.items.filter((item: ChecklistItem) => {
                      const allowedItems = [
                        'iklim-kontrolu',
                        'bos-su-ec-ph', 
                        'kontrol-bitkileri-kontrolu'
                      ];
                      return allowedItems.includes(item.id);
                    });

                    const displayData: Array<{label: string, value: string}> = [];

                    filteredItems.forEach((item: ChecklistItem) => {
                      if (item.data && Object.keys(item.data).length > 0) {
                        if (item.id === 'iklim-kontrolu') {
                          if (item.data.isi) displayData.push({label: 'Sera Isısı', value: `${String(item.data.isi)}°C`});
                          if (item.data.nem) displayData.push({label: 'Sera Nemi', value: `${String(item.data.nem)}%`});
                          if (item.data.isik) displayData.push({label: 'Ortalama ışık değerleri', value: `${String(item.data.isik)}lux`});
                        } else if (item.id === 'bos-su-ec-ph') {
                          if (item.data['ec-degeri']) displayData.push({label: 'Su EC', value: `${String(item.data['ec-degeri'])} dS/m`});
                          if (item.data['ph-degeri']) displayData.push({label: 'Su pH', value: `${String(item.data['ph-degeri'])}`});
                        } else if (item.id === 'kontrol-bitkileri-kontrolu') {
                          if (item.data['kok-problemi']) displayData.push({label: 'Kökte problem', value: String(item.data['kok-problemi'])});
                          if (item.data['vejetatif-kontrol-problemi']) displayData.push({label: 'Vejetatif aksamda problem', value: String(item.data['vejetatif-kontrol-problemi'])});
                          if (item.data['generatif-kontrol-problemi']) displayData.push({label: 'Generatif aksamda problem', value: String(item.data['generatif-kontrol-problemi'])});
                          if (item.data['brix-degeri']) displayData.push({label: 'Ortalama Brix değeri', value: `${String(item.data['brix-degeri'])}`});
                          if (item.data['klorofil-degeri']) displayData.push({label: 'Ortalama klorofil değeri', value: `${String(item.data['klorofil-degeri'])}`});
                        }
                      }
                    });

                    return displayData.map(data => `
                      <div class="control-item">
                        <span class="control-label">${data.label}:</span>
                        <span class="control-value">${data.value}</span>
                      </div>
                    `).join('');
                  })()}
                </div>
                
                <!-- Danışman Notu -->
                <div class="control-card">
                  <div class="control-item">
                    <span class="control-label">Danışman Notu:</span>
                  </div>
                  ${recipe.notes ? `
                    <div class="application-details">
                      ${recipe.notes.split('\n').map(note => `• ${note}`).join('<br>')}
                    </div>
                  ` : `
                    <div class="application-details">
                      • 5 mavi tuzak asılsın<br>
                      • 10 sarı tuzak asılsın<br>
                      • Damlamalar 5-10 cm arası açılsın<br>
                      • İçerideki nem %45 ten aşağıya düşerse araları nemlendirelim<br>
                      • Sıcaklık derecesi 37°C yüksek olursa sulamayı 100 ml artıralım<br>
                      • Toplama yapılsın<br>
                      • Seradaki otlar temizlensin
                    </div>
                  `}
                </div>
              ` : `
                <div class="control-card">
                  <div class="application-details">Sera kontrol verisi bulunamadı</div>
                </div>
              `}
            </div>

            <!-- Hava Durumu -->
            <div class="section-card">
              <div class="section-title">🌤️ Hava Durumu</div>
              <div class="section-subtitle">10 GÜNLÜK TAHMIN</div>
              ${weatherData && weatherData.length > 0 ? `
                <table class="weather-table">
                  <thead>
                    <tr>
                      <th>Gün</th>
                      <th>İkon</th>
                      <th>Min</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${weatherData.slice(0, 10).map((weather) => `
                      <tr>
                        <td>${weather.day}</td>
                        <td class="weather-icon">${weather.icon}</td>
                        <td>${weather.minTemp}°</td>
                        <td>${weather.maxTemp}°</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="application-card">
                  <div class="application-details">Hava durumu verisi bulunamadı</div>
                </div>
              `}
            </div>
          </div>



          <!-- Footer -->
          <div class="footer">
            <div>Bu rapor ${new Date().toLocaleString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.</div>
            <div>Agrovia Tarım Danışmanlık Sistemi</div>
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
            background: '#ffffff'
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
          const fileName = `Agrovia_Recete_${recipe.producerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    setPreviewRecipe(recipe);
    setShowPreviewModal(true);
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
            setCurrentStep('select-area');
            loadUretimAlanlari(producer.id); // Üretim alanlarını da yükle
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
    }
  }, [currentStep, selectedProducer]);

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Reçete Yönetimi
            </h1>
            <p className="text-slate-600 text-lg">
              Reçete işlemlerini başlatmak için önce bir üretici seçin
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
                <span className="ml-2">Reçete Yönetimi</span>
              </div>
            </div>
          </div>

          <UreticiListesi
            selectionMode={true}
            onSelect={handleProducerSelect}
            selectedProducer={selectedProducer}
            onAddRecipe={handleCreateRecipe}
            showRecipeButtons={true}
          />
        </div>
      </div>
    );
  }

  // Area Selection Step
  if (currentStep === 'select-area') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Üretim Alanı Seçimi
            </h1>
            <p className="text-slate-600 text-lg">
              Üretici seçtikten sonra üretim alanınızı belirleyin
            </p>
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
                <span className="ml-2">Reçete Yönetimi</span>
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

  // Recipe Management Step
  if (currentStep === 'recipe-management' && selectedProducer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentStep('select-area')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Üretim Alanına Dön</span>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {selectedProducer.firstName} {selectedProducer.lastName} - Reçete Yönetimi
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Üretim Alanı: {selectedUretimAlani?.urunIsmi} - {selectedUretimAlani?.cesitIsmi} ({selectedUretimAlani?.alanM2} m²)
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleCreateRecipe()}
                className="mt-4 lg:mt-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
              >
                + Yeni Reçete Oluştur
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
                  <span className="ml-2 font-medium">Reçete Yönetimi</span>
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
              /* Recipe List */
              <div className="space-y-4">
                {recipes.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📋</span>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">Henüz Reçete Yok</h3>
                      <p className="text-slate-600 mb-6">
                        {selectedProducer?.firstName} {selectedProducer?.lastName} için henüz reçete oluşturulmamış.
                      </p>
                      <button
                        onClick={() => handleCreateRecipe()}
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                      >
                        İlk Reçeteyi Oluştur
                      </button>
                    </div>
                  </div>
                ) : (
                  recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 lg:mb-0">
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-1">
                              Reçete #{recipe.id.slice(-6)}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              {recipe.producerName}
                            </p>
                            <p className="text-slate-600 text-sm">
                              {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 text-sm">Gübreleme Programı</p>
                            <div className="space-y-1">
                              {recipe.fertilization1 && (
                                <p className="font-medium text-slate-800 text-sm">1. {recipe.fertilization1}</p>
                              )}
                              {recipe.fertilization2 && (
                                <p className="font-medium text-slate-800 text-sm">2. {recipe.fertilization2}</p>
                              )}
                              {recipe.fertilization3 && (
                                <p className="font-medium text-slate-800 text-sm">3. {recipe.fertilization3}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-slate-600 text-sm">Üstten Besleme</p>
                            <p className="font-medium text-slate-800 text-sm">
                              {recipe.topFeeding || 'Belirtilmemiş'}
                            </p>
                            {recipe.notes && (
                              <>
                                <p className="text-slate-600 text-sm mt-2">Notlar</p>
                                <p className="font-medium text-slate-800 text-sm">{recipe.notes}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => previewPDF(recipe)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                            title="PDF Önizle"
                          >
                            👁️ Önizle
                          </button>
                          <button
                            onClick={async () => {
                              // Loading mesajı göster
                              const button = event?.target as HTMLButtonElement;
                              const originalText = button.innerHTML;
                              button.innerHTML = '📍 Konum alınıyor...';
                              button.disabled = true;
                              
                              try {
                                await generatePDF(recipe);
                              } finally {
                                // Button'u eski haline getir
                                button.innerHTML = originalText;
                                button.disabled = false;
                              }
                            }}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            title="PDF İndir (Konum algılama ile)"
                          >
                            📥 İndir
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            title="Reçeteyi Sil"
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

          {/* Reçete Önizleme Modal'ı */}
          <RecipePreviewModal
            recipe={previewRecipe}
            isOpen={showPreviewModal}
            onClose={() => {
              setShowPreviewModal(false);
              setPreviewRecipe(null);
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};

// Reçete Önizleme Modal'ı
const RecipePreviewModal: React.FC<{
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ recipe, isOpen, onClose }) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Reçete Önizleme</h2>
                <p className="text-slate-600 text-sm">
                  {recipe.producerName} - {new Date(recipe.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Üretici Bilgileri */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Üretici Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-slate-600 mb-1">Üretici Adı</p>
                <p className="font-semibold text-slate-800">{recipe.producerName}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-slate-600 mb-1">Reçete Tarihi</p>
                <p className="font-semibold text-slate-800">
                  {new Date(recipe.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Gübreleme Programı */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              Gübreleme Programı
            </h3>
            <div className="space-y-3">
              {[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3]
                .filter(Boolean)
                .map((fert, index: number) => (
                  <div key={index} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <p className="text-sm text-emerald-700 mb-1">{index + 1}. Gübreleme Uygulaması</p>
                    <p className="font-semibold text-emerald-800">{fert}</p>
                  </div>
                ))}
              {[recipe.fertilization1, recipe.fertilization2, recipe.fertilization3].filter(Boolean).length === 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-center">Gübreleme programı belirtilmemiş</p>
                </div>
              )}
            </div>
          </div>

          {/* Üstten Besleme */}
          {recipe.topFeeding && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">💧</span>
                Üstten Besleme
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="font-semibold text-blue-800">{recipe.topFeeding}</p>
              </div>
            </div>
          )}

          {/* Sera İçi Kontrol Verileri */}
          {recipe.selectedSeraKontrolData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">🔍</span>
                Sera İçi Kontrol Verileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-sm text-orange-700 mb-1">Kontrol Tarihi</p>
                  <p className="font-semibold text-orange-800">
                    {new Date(recipe.selectedSeraKontrolData.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-sm text-orange-700 mb-1">Kontrol Saati</p>
                  <p className="font-semibold text-orange-800">
                    {recipe.selectedSeraKontrolData.timeFormatted || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              
              {recipe.selectedSeraKontrolData.items && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Kontrol Verileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                      const filteredItems = recipe.selectedSeraKontrolData.items.filter((item: ChecklistItem) => {
                        const allowedItems = [
                          'iklim-kontrolu',
                          'bos-su-ec-ph', 
                          'kontrol-bitkileri-kontrolu'
                        ];
                        return allowedItems.includes(item.id);
                      });

                      const displayData: Array<{label: string, value: string}> = [];

                      filteredItems.forEach((item: ChecklistItem) => {
                        if (item.data && Object.keys(item.data).length > 0) {
                          if (item.id === 'iklim-kontrolu') {
                            if (item.data.isi) displayData.push({label: 'Sera Isısı', value: `${String(item.data.isi)}°C`});
                            if (item.data.nem) displayData.push({label: 'Sera Nemi', value: `${String(item.data.nem)}%`});
                            if (item.data.isik) displayData.push({label: 'Ort Işık Değeri', value: `${String(item.data.isik)} lux`});
                          } else if (item.id === 'bos-su-ec-ph') {
                            if (item.data['ec-degeri']) displayData.push({label: 'Su EC', value: `${String(item.data['ec-degeri'])}`});
                            if (item.data['ph-degeri']) displayData.push({label: 'Su pH', value: `${String(item.data['ph-degeri'])}`});
                          } else if (item.id === 'kontrol-bitkileri-kontrolu') {
                            if (item.data['kok-problemi']) displayData.push({label: 'Kökte Problem', value: String(item.data['kok-problemi'])});
                            if (item.data['vejetatif-kontrol-problemi']) displayData.push({label: 'Vejetatif Aksamda Problem', value: String(item.data['vejetatif-kontrol-problemi'])});
                            if (item.data['generatif-kontrol-problemi']) displayData.push({label: 'Generatif Aksamda Problem', value: String(item.data['generatif-kontrol-problemi'])});
                            if (item.data['brix-degeri']) displayData.push({label: 'Ortalama Brix Değeri', value: `${String(item.data['brix-degeri'])}`});
                            if (item.data['klorofil-degeri']) displayData.push({label: 'Ort Klorofil Değeri', value: `${String(item.data['klorofil-degeri'])}`});
                          }
                        }
                      });

                      return displayData.map((data, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">{data.label}</span>
                            <span className="text-sm font-bold text-slate-800">{data.value}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hava Durumu */}
          {recipe.weatherData && recipe.weatherData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">🌤️</span>
                Hava Durumu Bilgileri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recipe.weatherData.slice(0, 5).map((weather, index: number) => (
                  <div key={index} className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                    <p className="text-sm text-cyan-700 mb-1">{weather.day}</p>
                    <p className="font-semibold text-cyan-800">
                      {weather.icon} {weather.minTemp}°C - {weather.maxTemp}°C
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tuzak ve Zararlı Bilgileri */}
          {(recipe.tuzakBilgileri || recipe.zararlıBilgileri) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">🪤</span>
                Tuzak ve Zararlı Bilgileri
              </h3>
              <div className="space-y-3">
                {recipe.tuzakBilgileri && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <p className="text-sm text-yellow-700 mb-1">Eklenen Tuzaklar</p>
                    <p className="font-semibold text-yellow-800">{recipe.tuzakBilgileri}</p>
                  </div>
                )}
                {recipe.zararlıBilgileri && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-red-700 mb-1">Tespit Edilen Zararlılar</p>
                    <p className="font-semibold text-red-800">{recipe.zararlıBilgileri}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danışman Notları */}
          {recipe.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Danışman Notları ve Öneriler
              </h3>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <p className="font-semibold text-purple-800">{recipe.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePage; 