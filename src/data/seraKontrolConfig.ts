import type { ChecklistSection } from '../types/checklist';

export const seraKontrolConfig: ChecklistSection = {
  id: 'sera-kontrol',
  title: 'Sera Kontrol Checklist',
  items: [
    {
      id: 'iklim-kontrolu',
      label: 'İklim kontrolü yapıldı',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'sicaklik', label: 'Sıcaklık', type: 'number', required: false },
        { id: 'nem', label: 'Nem', type: 'number', required: false },
        { id: 'havalandirma', label: 'Havalandırma', type: 'boolean', required: false }
      ]
    },
    {
      id: 'su-basinci',
      label: 'Su basıncı kontrol edildi',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'basinc', label: 'Basınç (bar)', type: 'number', required: false }
      ]
    },
    {
      id: 'toprak-analizi',
      label: 'Toprak analizi (foto eklenebilecek yer)',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'analiz-foto', label: 'Analiz Fotoğrafı', type: 'file', required: false }
      ]
    },
    {
      id: 'bitki-kontrolu',
      label: 'Kontrol bitkisi kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'kok', label: 'Kök', type: 'boolean', required: false },
        { id: 'drenaj', label: 'Drenaj', type: 'boolean', required: false },
        { id: 'yuzeyel', label: 'Yüzeyel Kontrol', type: 'boolean', required: false },
        { id: 'genel', label: 'Genel Kontrol', type: 'boolean', required: false }
      ]
    },
    {
      id: 'sulama-kontrolu',
      label: 'Sulama kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'damlama-mesafe', label: 'Damlama Mesafe', type: 'number', required: false },
        { id: 'su-miktari', label: 'Su Miktarı (ml)', type: 'number', required: false }
      ]
    },
    {
      id: 'bitki-gelisim',
      label: 'Bitki gelişim dönemleri',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'cikis', label: 'Çıkış', type: 'boolean', required: false },
        { id: 'yaprak', label: 'Yaprak', type: 'boolean', required: false },
        { id: 'ciceklenme', label: 'Çiçeklenme', type: 'boolean', required: false },
        { id: 'meyve-tutumu', label: 'Meyve Tutumu', type: 'boolean', required: false },
        { id: 'meyve-olgunlasma', label: 'Meyve Olgunlaşma', type: 'boolean', required: false },
        { id: 'meyve-hasat', label: 'Meyve Hasat', type: 'boolean', required: false }
      ]
    },
    {
      id: 'zararli-kontrol',
      label: 'Zararlı kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'beyaz-sinek', label: 'Beyaz Sinek', type: 'boolean', required: false },
        { id: 'trips', label: 'Trips', type: 'boolean', required: false },
        { id: 'kirmizi-orumcek', label: 'Kırmızı Örümcek', type: 'boolean', required: false },
        { id: 'yesil-kurt', label: 'Yeşil Kurt', type: 'boolean', required: false },
        { id: 'yaprak-biti', label: 'Yaprak Biti', type: 'boolean', required: false },
        { id: 'biber-gal-sinegi', label: 'Biber Gal Sineği', type: 'boolean', required: false },
        { id: 'samyeli-akari', label: 'Samyeli Akarı', type: 'boolean', required: false }
      ]
    },
    {
      id: 'besin-eksikligi',
      label: 'Besin eksikliği kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'azot', label: 'Azot', type: 'boolean', required: false },
        { id: 'fosfor', label: 'Fosfor', type: 'boolean', required: false },
        { id: 'potasyum', label: 'Potasyum', type: 'boolean', required: false },
        { id: 'magnezyum', label: 'Magnezyum', type: 'boolean', required: false },
        { id: 'kalsiyum', label: 'Kalsiyum', type: 'boolean', required: false },
        { id: 'mangan', label: 'Mangan', type: 'boolean', required: false },
        { id: 'demir', label: 'Demir', type: 'boolean', required: false },
        { id: 'bor', label: 'Bor', type: 'boolean', required: false },
        { id: 'bakir', label: 'Bakır', type: 'boolean', required: false },
        { id: 'cinko', label: 'Çinko', type: 'boolean', required: false },
        { id: 'nikel', label: 'Nikel', type: 'boolean', required: false }
      ]
    },
    {
      id: 'sera-kulturu',
      label: 'Sera kültürü - genel kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'toplama', label: 'Toplama', type: 'boolean', required: false },
        { id: 'nemlendirme', label: 'Nemlendirme', type: 'boolean', required: false },
        { id: 'budama', label: 'Budama', type: 'boolean', required: false },
        { id: 'sera-temizligi', label: 'Sera Temizliği', type: 'boolean', required: false },
        { id: 'mavi-5', label: '5 adet mavi', type: 'number', required: false },
        { id: 'sari-5', label: '5 adet sarı', type: 'number', required: false },
        { id: 'mavi-15', label: '15 adet mavi', type: 'number', required: false },
        { id: 'sari-15', label: '15 adet sarı', type: 'number', required: false }
      ]
    }
  ]
}; 