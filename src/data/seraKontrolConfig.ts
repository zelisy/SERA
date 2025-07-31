import type { ChecklistSection } from '../types/checklist';

export const seraKontrolConfig: ChecklistSection = {
  id: 'sera-kontrol',
  title: 'Sera Kontrol Checklist',
  items: [
    {
      id: 'iklim-kontrolu',
      label: '1. İklim Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'isi', 
          label: 'Isı', 
          type: 'number', 
          required: false,
          placeholder: '°C',
          validation: { min: -50, max: 100 }
        },
        { 
          id: 'isik', 
          label: 'Işık', 
          type: 'number', 
          required: false,
          placeholder: 'lux',
          validation: { min: 0 }
        },
        { 
          id: 'nem', 
          label: 'Nem', 
          type: 'number', 
          required: false,
          placeholder: '%',
          validation: { min: 0, max: 100 }
        },
        { 
          id: 'havalandirma', 
          label: 'Havalandırma', 
          type: 'select', 
          required: false,
          options: ['İyi', 'Orta', 'Kötü']
        }
      ]
    },
    {
      id: 'bos-su-ec-ph',
      label: '2. Boş Su EC / pH',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'ph-degeri', 
          label: 'pH', 
          type: 'number', 
          required: false,
          placeholder: 'pH değeri',
          validation: { min: 0, max: 14 }
        },
        { 
          id: 'ec-degeri', 
          label: 'EC', 
          type: 'number', 
          required: false,
          placeholder: 'EC değeri',
          validation: { min: 0 }
        }
      ]
    },
    {
      id: 'toprak-analizi',
      label: '3. Toprak Analizi',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'toprak-analizi-foto', 
          label: 'A4 boyutunda görsel/fotoğraf', 
          type: 'multiple-files', 
          required: false 
        }
      ]
    },
    {
      id: 'kontrol-bitkileri-kontrolu',
      label: '4. Kontrol Bitkileri Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'kok-problemi', 
          label: 'Kök problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'kok-foto', 
          label: 'Kök Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        },
        { 
          id: 'drenaj-problemi', 
          label: 'Drenaj problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'drenaj-foto', 
          label: 'Drenaj Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        },
        { 
          id: 'vejetatif-kontrol-problemi', 
          label: 'Vejetatif kontrol problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'vejetatif-kontrol-foto', 
          label: 'Vejetatif kontrol Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        },
        { 
          id: 'brix-kontrol-problemi', 
          label: 'Brix kontrol problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'brix-degeri', 
          label: 'Brix değeri', 
          type: 'number', 
          required: false,
          placeholder: 'Brix değeri'
        },
        { 
          id: 'brix-kontrol-foto', 
          label: 'Brix kontrol Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        },
        { 
          id: 'klorofil-kontrol-problemi', 
          label: 'Klorofil kontrol problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'klorofil-degeri', 
          label: 'Klorofil değeri', 
          type: 'number', 
          required: false,
          placeholder: 'Klorofil değeri'
        },
        { 
          id: 'klorofil-kontrol-foto', 
          label: 'Klorofil kontrol Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        },
        { 
          id: 'generatif-kontrol-problemi', 
          label: 'Generatif kontrol problemi', 
          type: 'select', 
          required: false,
          options: ['Var', 'Yok']
        },
        { 
          id: 'generatif-kontrol-foto', 
          label: 'Generatif kontrol Fotoğrafları', 
          type: 'multiple-files', 
          required: false 
        }
      ]
    },
    {
      id: 'sulama-kontrolu',
      label: '5. Sulama Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'damla-5cm', 
          label: '5 cm açık', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'damla-10cm', 
          label: '10 cm açık', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'damla-15cm', 
          label: '15 cm açık', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'su-400ml', 
          label: '400 ml', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'su-500ml', 
          label: '500 ml', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'su-600ml', 
          label: '600 ml', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'su-700ml', 
          label: '700 ml', 
          type: 'boolean', 
          required: false 
        }
      ]
    },
    {
      id: 'bitki-gelisim-donemi',
      label: '6. Bitki Gelişim Dönemleri',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'vejetatif', 
          label: 'Vejetatif', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'generatif', 
          label: 'Generatif', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'ciceklenme', 
          label: 'Çiçeklenme', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'meyve-tutumu', 
          label: 'Meyve tutumu', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'meyve-irilesme', 
          label: 'Meyve iriliği', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'meyve-olgunlasma', 
          label: 'Meyve olgunlaşma', 
          type: 'development-stage', 
          required: false 
        },
        { 
          id: 'meyve-hasat', 
          label: 'Meyve hasadı', 
          type: 'development-stage', 
          required: false 
        }
      ]
    },
    {
      id: 'zararli-kontrolu',
      label: '7. Zararlı Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        // Zararlı Türleri
        { 
          id: 'insektisit', 
          label: 'İnsektisit', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'beyaz-sinek', 
          label: 'Beyaz sinek', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'thrips', 
          label: 'Thrips', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'yesil-kurt-tuta', 
          label: 'Yeşil kurt / Tuta', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'yaprak-biti', 
          label: 'Yaprak biti', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'unlu-biti', 
          label: 'Unlu biti', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'biber-gal-sinegi', 
          label: 'Biber gal sineği', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'akarisit', 
          label: 'Akarisit', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'kirmizi-orumcek', 
          label: 'Kırmızı örümcek', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'sari-cay-akari', 
          label: 'Sarı çay akarı', 
          type: 'pest-control', 
          required: false 
        },
        // Hastalık Türleri
        { 
          id: 'fungusit', 
          label: 'Fungusit', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'kulleme', 
          label: 'Külleme', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'pas', 
          label: 'Pas', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'virus', 
          label: 'Virüs', 
          type: 'pest-control', 
          required: false 
        },
        { 
          id: 'bakteri', 
          label: 'Bakteri', 
          type: 'pest-control', 
          required: false 
        }
      ]
    },
    {
      id: 'besin-eksikligi-kontrolu',
      label: '8. Besin Eksikliği Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        // Makro Elementler
        { 
          id: 'azot', 
          label: 'Azot', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'fosfor', 
          label: 'Fosfor', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'potasyum', 
          label: 'Potasyum', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'magnezyum', 
          label: 'Magnezyum', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'kalsiyum', 
          label: 'Kalsiyum', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'kukurt', 
          label: 'Kükürt', 
          type: 'boolean', 
          required: false 
        },
        // Mikro Elementler
        { 
          id: 'mangan', 
          label: 'Mangan', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'cinko', 
          label: 'Çinko', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'bor', 
          label: 'Bor', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'molibden', 
          label: 'Molibden', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'bakir', 
          label: 'Bakır', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'demir', 
          label: 'Demir', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'nikel', 
          label: 'Nikel', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'kobalt', 
          label: 'Kobalt', 
          type: 'boolean', 
          required: false 
        }
      ]
    },
    {
      id: 'sera-kulturel-genel-kontrol',
      label: '9. Sera Kültürel – Genel Kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'dolama', 
          label: 'Dolama yapılmış mı?', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'toplama', 
          label: 'Toplama yapılmış mı?', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'nemlendirme', 
          label: 'Nemlendirme yapılmış mı?', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'budama', 
          label: 'Budama yapılmış mı?', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'ip-baglama', 
          label: 'İp bağlama yapılmış mı?', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'sera-ici-temizlik', 
          label: 'Sera içi temizlik', 
          type: 'text', 
          required: false,
          placeholder: 'Temizlik detayları'
        }
      ]
    },
    {
      id: 'tuzak-ekleme',
      label: '10. Tuzak Ekleme',
      completed: false,
      hasDetails: true,
      detailFields: [
        { 
          id: 'mavi-5-adet', 
          label: '5 adet mavi', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'sari-5-adet', 
          label: '5 adet sarı', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'mavi-10-adet', 
          label: '10 adet mavi', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'sari-10-adet', 
          label: '10 adet sarı', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'mavi-15-adet', 
          label: '15 adet mavi', 
          type: 'boolean', 
          required: false 
        },
        { 
          id: 'sari-15-adet', 
          label: '15 adet sarı', 
          type: 'boolean', 
          required: false 
        }
      ]
    }
  ]
}; 