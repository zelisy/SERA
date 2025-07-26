import type { ChecklistSection } from '../types/checklist';

export const seraKontrolConfig: ChecklistSection = {
  id: 'sera-kontrol',
  title: 'Sera Kontrol Checklist',
  items: [
    {
      id: 'iklim-kontrolu',
      label: 'İklim kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'isi', label: 'Isı', type: 'boolean', required: false },
        { id: 'isik', label: 'Işık', type: 'boolean', required: false },
        { id: 'nem', label: 'Nem', type: 'boolean', required: false },
        { id: 'havalandirma', label: 'Havalandırma', type: 'boolean', required: false }
      ]
    },
    {
      id: 'bos-su-ec-ph',
      label: 'Boş su EC / pH',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'ec-degeri', label: 'EC Değeri', type: 'number', required: false },
        { id: 'ph-degeri', label: 'pH Değeri', type: 'number', required: false }
      ]
    },
    {
      id: 'toprak-analizi',
      label: 'Toprak analizi',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'toprak-analizi-foto', label: 'Fotoğraflar', type: 'multiple-files', required: false }
      ]
    },
    {
      id: 'kontrol-bitkileri-kontrolu',
      label: 'Kontrol bitkileri kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'kok-foto', label: 'Kök Fotoğrafları', type: 'multiple-files', required: false },
        { id: 'drenaj-foto', label: 'Drenaj Fotoğrafları', type: 'multiple-files', required: false },
        { id: 'vejetatif-kontrol-foto', label: 'Vejetatif kontrol Fotoğrafları', type: 'multiple-files', required: false },
        { id: 'brix-kontrol-foto', label: 'Brix kontrol Fotoğrafları', type: 'multiple-files', required: false },
        { id: 'klorofil-kontrol-foto', label: 'Klorofil kontrol Fotoğrafları', type: 'multiple-files', required: false },
        { id: 'generatif-kontrol-foto', label: 'Generatif kontrol Fotoğrafları', type: 'multiple-files', required: false }
      ]
    },
    {
      id: 'sulama-kontrolu',
      label: 'Sulama kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'damla-5cm', label: 'Damla mesafe - 5cm aç', type: 'boolean', required: false },
        { id: 'damla-10cm', label: 'Damla mesafe - 10cm aç', type: 'boolean', required: false },
        { id: 'damla-15cm', label: 'Damla mesafe - 15cm aç', type: 'boolean', required: false },
        { id: 'su-400ml', label: 'Su miktarı - 400ml', type: 'boolean', required: false },
        { id: 'su-500ml', label: 'Su miktarı - 500ml', type: 'boolean', required: false },
        { id: 'su-600ml', label: 'Su miktarı - 600ml', type: 'boolean', required: false },
        { id: 'su-700ml', label: 'Su miktarı - 700ml', type: 'boolean', required: false }
      ]
    },
    {
      id: 'bitki-gelisim-donemi',
      label: 'Bitki gelişim dönemi / evreleri',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'baslangic', label: 'Başlangıç', type: 'development-stage', required: false },
        { id: 'vejetatif', label: 'Vejetatif', type: 'development-stage', required: false },
        { id: 'ciceklenme', label: 'Çiçeklenme', type: 'development-stage', required: false },
        { id: 'meyve-tutumu', label: 'Meyve tutumu', type: 'development-stage', required: false },
        { id: 'meyve-irilesme', label: 'Meyve irileşme', type: 'development-stage', required: false },
        { id: 'meyve-olgunlasma', label: 'Meyve olgunlaşma', type: 'development-stage', required: false },
        { id: 'meyve-hasat', label: 'Meyve hasat', type: 'development-stage', required: false }
      ]
    },
    {
      id: 'zararli-kontrolu',
      label: 'Zararlı kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'insektisit', label: 'İnsektisit', type: 'pest-control', required: false },
        { id: 'beyaz-sinek', label: 'Beyaz sinek', type: 'pest-control', required: false },
        { id: 'thrips', label: 'Thrips', type: 'pest-control', required: false },
        { id: 'yesil-kurt-tuta', label: 'Yeşil kurt / tuta', type: 'pest-control', required: false },
        { id: 'yaprak-biti', label: 'Yaprak biti', type: 'pest-control', required: false },
        { id: 'unlu-biti', label: 'Unlu biti', type: 'pest-control', required: false },
        { id: 'biber-gal-sinegi', label: 'Biber gal sineği', type: 'pest-control', required: false },
        { id: 'akarisit', label: 'Akarisit', type: 'pest-control', required: false },
        { id: 'kirmizi-orumcek', label: 'Kırmızı örümcek', type: 'pest-control', required: false },
        { id: 'sari-cay-akari', label: 'Sarı çay akarı', type: 'pest-control', required: false },
        { id: 'fungusit', label: 'Fungusit', type: 'pest-control', required: false },
        { id: 'kulleme', label: 'Külleme', type: 'pest-control', required: false },
        { id: 'pas', label: 'Pas', type: 'pest-control', required: false },
        { id: 'virus', label: 'Virüs', type: 'pest-control', required: false },
        { id: 'bakteri', label: 'Bakteri', type: 'pest-control', required: false }
      ]
    },
    {
      id: 'besin-eksikligi-kontrolu',
      label: 'Besin eksikliği kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        // Makro besinler
        { id: 'azot', label: 'Azot', type: 'boolean', required: false },
        { id: 'fosfor', label: 'Fosfor', type: 'boolean', required: false },
        { id: 'potasyum', label: 'Potasyum', type: 'boolean', required: false },
        { id: 'magnezyum', label: 'Magnezyum', type: 'boolean', required: false },
        { id: 'kalsiyum', label: 'Kalsiyum', type: 'boolean', required: false },
        { id: 'kukurt', label: 'Kükürt', type: 'boolean', required: false },
        // Mikro besinler
        { id: 'mangan', label: 'Mangan', type: 'boolean', required: false },
        { id: 'cinko', label: 'Çinko', type: 'boolean', required: false },
        { id: 'bor', label: 'Bor', type: 'boolean', required: false },
        { id: 'molibden', label: 'Molibden', type: 'boolean', required: false },
        { id: 'bakir', label: 'Bakır', type: 'boolean', required: false },
        { id: 'demir', label: 'Demir', type: 'boolean', required: false },
        { id: 'nikel', label: 'Nikel', type: 'boolean', required: false },
        { id: 'kobalt', label: 'Kobalt', type: 'boolean', required: false }
      ]
    },
    {
      id: 'sera-kulturel-genel-kontrol',
      label: 'Sera kültürel – genel kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'dolama', label: 'Dolama', type: 'boolean', required: false },
        { id: 'toplama', label: 'Toplama', type: 'boolean', required: false },
        { id: 'nemlendirme', label: 'Nemlendirme', type: 'boolean', required: false },
        { id: 'budama', label: 'Budama', type: 'boolean', required: false },
        { id: 'ip-baglama', label: 'İp bağlama', type: 'boolean', required: false }
      ]
    },
    {
      id: 'sera-ici-temizligi',
      label: 'Sera içi temizliği',
      completed: false,
      hasDetails: true,
      detailFields: [
        { id: 'tuzak-ekleme', label: 'Tuzak ekleme', type: 'boolean', required: false },
        { id: 'mavi-5-adet', label: '5 adet mavi', type: 'number', required: false },
        { id: 'sari-5-adet', label: '5 adet sarı', type: 'number', required: false },
        { id: 'mavi-10-adet', label: '10 adet mavi', type: 'number', required: false },
        { id: 'sari-10-adet', label: '10 adet sarı', type: 'number', required: false },
        { id: 'mavi-15-adet', label: '15 adet mavi', type: 'number', required: false },
        { id: 'sari-15-adet', label: '15 adet sarı', type: 'number', required: false }
      ]
    }
  ]
}; 