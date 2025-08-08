import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DenemeFormData {
  producer?: {
    firstName: string;
    lastName: string;
  };
  genelCalismak: string;
  genelAmac: string;
  ulke: string;
  konum: string;
  turler: string;
  cesitlilik: string;
  tedaviler: string;
  tekrarlar: string;
  tedaviBitkiSayisi: string;
  mahsulDurumu: string;
  evrim: string;
  goruntuler?: string[];
}

export const generateDenemePDFContent = (formData: DenemeFormData): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '210mm';
  container.style.padding = '20mm';
  container.style.fontFamily = 'Poppins, Inter, Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.color = '#333';
  container.style.background = 'white';

  container.innerHTML = `
    <style>
      .pdf-container { max-width: 170mm; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
      .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; font-family: 'Poppins', sans-serif; }
      .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 5px; font-family: 'Inter', sans-serif; }
      .date { font-size: 12px; color: #9ca3af; font-family: 'Inter', sans-serif; }
      .section { margin-bottom: 25px; }
      .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-family: 'Poppins', sans-serif; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .info-item { margin-bottom: 12px; }
      .info-label { font-size: 11px; color: #6b7280; margin-bottom: 3px; font-weight: bold; font-family: 'Inter', sans-serif; }
      .info-value { font-size: 12px; color: #1f2937; font-family: 'Inter', sans-serif; }
      .images-section { margin-top: 20px; }
      .images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
      .image-item { text-align: center; }
      .image-placeholder { width: 80px; height: 80px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; margin: 0 auto; border-radius: 8px; color: #9ca3af; font-size: 10px; font-family: 'Inter', sans-serif; }
      .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; font-family: 'Inter', sans-serif; }
    </style>
    
    <div class="pdf-container">
      <!-- Header -->
      <div class="header">
        <div class="title">Deneme Formu Detayı</div>
        <div class="subtitle">Trial Form Details</div>
        <div class="date">Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</div>
      </div>

      <!-- Üretici Bilgileri -->
      <div class="section">
        <div class="section-title">👤 Üretici Bilgileri</div>
        <div class="info-item">
          <div class="info-label">Üretici Adı:</div>
          <div class="info-value">${formData.producer ? `${formData.producer.firstName} ${formData.producer.lastName}` : 'Belirtilmemiş'}</div>
        </div>
      </div>

      <!-- Genel Bilgiler -->
      <div class="section">
        <div class="section-title">📋 Genel Bilgiler</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Çalışmak:</div>
            <div class="info-value">${formData.genelCalismak || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Amaç:</div>
            <div class="info-value">${formData.genelAmac || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Ülke:</div>
            <div class="info-value">${formData.ulke || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Konum:</div>
            <div class="info-value">${formData.konum || 'Belirtilmemiş'}</div>
          </div>
        </div>
      </div>

      <!-- Deneme Detayları -->
      <div class="section">
        <div class="section-title">🧪 Deneme Detayları</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Türler:</div>
            <div class="info-value">${formData.turler || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Çeşitlilik:</div>
            <div class="info-value">${formData.cesitlilik || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tedaviler:</div>
            <div class="info-value">${formData.tedaviler || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tekrarlar:</div>
            <div class="info-value">${formData.tekrarlar || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Tedavi Başına Bitki Sayısı:</div>
            <div class="info-value">${formData.tedaviBitkiSayisi || 'Belirtilmemiş'}</div>
          </div>
        </div>
      </div>

      <!-- Sonuçlar -->
      <div class="section">
        <div class="section-title">📊 Sonuçlar</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Mahsul Durumu:</div>
            <div class="info-value">${formData.mahsulDurumu || 'Belirtilmemiş'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Evrim:</div>
            <div class="info-value">${formData.evrim || 'Belirtilmemiş'}</div>
          </div>
        </div>
      </div>

      <!-- Görüntüler -->
      <div class="section">
        <div class="section-title">📸 Görüntüler</div>
        <div class="images-section">
          ${formData.goruntuler && formData.goruntuler.length > 0 ? `
            <div class="images-grid">
              ${formData.goruntuler.map((url, index) => `
                <div class="image-item">
                  <img src="${url}" alt="Görsel ${index + 1}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #d1d5db;" />
                  <div style="font-size: 10px; color: #6b7280; margin-top: 5px;">Görsel ${index + 1}</div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="image-item">
              <div class="image-placeholder">Görsel Yok</div>
            </div>
          `}
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>Bu rapor SERA uygulaması tarafından otomatik olarak oluşturulmuştur.</div>
        <div>Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
      </div>
    </div>
  `;

  return container;
};

export const exportDenemeFormToPDF = async (formData: DenemeFormData): Promise<void> => {
  try {
    // PDF content oluştur
    const pdfContent = generateDenemePDFContent(formData);
    document.body.appendChild(pdfContent);

    // HTML'i canvas'a çevir
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    } as any);

    // Canvas'ı kaldır
    document.body.removeChild(pdfContent);

    // Canvas'ı PDF'e çevir
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 genişliği (mm)
    const pageHeight = 295; // A4 yüksekliği (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // İlk sayfa
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Gerekirse ek sayfalar ekle
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // PDF'i indir
    const producerName = formData.producer ? `${formData.producer.firstName}_${formData.producer.lastName}` : 'Bilinmeyen';
    const filename = `deneme-formu-${producerName}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    console.log('PDF başarıyla oluşturuldu:', filename);
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw new Error('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}; 