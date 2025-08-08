import type { ChecklistSection } from '../types/checklist';

export const seraKontrolConfig: ChecklistSection = {
  id: 'sera-kontrol',
  title: 'Sera Kontrol Detaylı Checklist',
  items: [
    {
      id: 'iklim-kontrolu',
      label: '1) İklim Kontrolü',
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
      label: '2) Boş Su EC / pH',
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
      label: '3) Toprak Analizi',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'toprak-analizi-foto',
          label: '📎 A4 boyutunda foto eklenecek alan',
          type: 'multiple-files',
          required: false
        }
      ]
    },
    {
      id: 'kontrol-bitkileri-kontrolu',
      label: '4) Kontrol Bitkileri Kontrolü (Dekar & Bitki Sayısı)',
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
          id: 'vejetatif-foto',
          label: 'Vejetatif Kontrol Fotoğrafları',
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
          label: 'Brix Değeri',
          type: 'number',
          required: false,
          placeholder: 'Brix değeri',
          dependsOn: 'brix-kontrol-problemi',
          showWhen: 'Var'
        },
        {
          id: 'brix-foto',
          label: 'Brix Kontrol Fotoğrafları',
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
          label: 'Klorofil Değeri',
          type: 'number',
          required: false,
          placeholder: 'Klorofil değeri',
          dependsOn: 'klorofil-kontrol-problemi',
          showWhen: 'Var'
        },
        {
          id: 'klorofil-foto',
          label: 'Klorofil Kontrol Fotoğrafları',
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
          id: 'generatif-foto',
          label: 'Generatif Kontrol Fotoğrafları',
          type: 'multiple-files',
          required: false
        }
      ]
    },
    {
      id: 'sulama-kontrolu',
      label: '5) Sulama Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'damla-mesafesi',
          label: 'Damla mesafesi',
          type: 'radio',
          required: false,
          options: ['5 cm aç', '10 cm aç', '15 cm aç', 'Diğer']
        },
        {
          id: 'damla-mesafesi-diger',
          label: 'Diğer Damla Mesafesi',
          type: 'number',
          required: false,
          placeholder: 'cm',
          dependsOn: 'damla-mesafesi',
          showWhen: 'Diğer'
        },
        {
          id: 'su-miktari',
          label: 'Su miktarının ayarlanması',
          type: 'radio',
          required: false,
          options: ['400 ml', '500 ml', '600 ml', '700 ml', 'Diğer']
        },
        {
          id: 'su-miktari-diger',
          label: 'Diğer Su Miktarı',
          type: 'number',
          required: false,
          placeholder: 'ml',
          dependsOn: 'su-miktari',
          showWhen: 'Diğer'
        }
      ]
    },
    {
      id: 'bitki-gelisim-donemleri',
      label: '6) Bitki Gelişim Dönemleri / Gözlemler',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'vejetatif-gelisim',
          label: 'Vejetatif gelişim',
          type: 'checkbox',
          required: false
        },
        {
          id: 'generatif-gelisim',
          label: 'Generatif gelişim',
          type: 'checkbox',
          required: false
        },
        {
          id: 'ciceklenme',
          label: 'Çiçeklenme',
          type: 'checkbox',
          required: false
        },
        {
          id: 'meyve-tutumu',
          label: 'Meyve tutumu',
          type: 'checkbox',
          required: false
        },
        {
          id: 'meyve-olgunlasma',
          label: 'Meyve olgunlaşma',
          type: 'checkbox',
          required: false
        },
        {
          id: 'meyve-hasat',
          label: 'Meyve hasat',
          type: 'checkbox',
          required: false
        },
        {
          id: 'buton-ve-gubreleme-onerisi',
          label: '💡 Buton ve gübreleme önerisi',
          type: 'textarea',
          required: false,
          placeholder: 'Gübreleme önerilerinizi buraya yazın...'
        }
      ]
    },
    {
      id: 'zararli-kontrol',
      label: '7) Zararlı Kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'bocuk-zararli-turleri',
          label: 'Böcek/Zararlı Türleri:',
          type: 'subheader',
          required: false
        },
        {
          id: 'insektisit',
          label: 'İnsektisit',
          type: 'checkbox',
          required: false
        },
        {
          id: 'beyaz-sinek',
          label: 'Beyaz sinek',
          type: 'checkbox',
          required: false
        },
        {
          id: 'thrips',
          label: 'Thrips',
          type: 'checkbox',
          required: false
        },
        {
          id: 'yesil-kurt-tuta',
          label: 'Yeşil kurt / Tuta',
          type: 'checkbox',
          required: false
        },
        {
          id: 'yaprak-biti',
          label: 'Yaprak biti',
          type: 'checkbox',
          required: false
        },
        {
          id: 'unlu-biti',
          label: 'Unlu biti',
          type: 'checkbox',
          required: false
        },
        {
          id: 'biber-gal-sinegi',
          label: 'Biber gal sineği',
          type: 'checkbox',
          required: false
        },
        {
          id: 'akarisit',
          label: 'Akarisit',
          type: 'checkbox',
          required: false
        },
        {
          id: 'kirmizi-orumcek',
          label: 'Kırmızı örümcek',
          type: 'checkbox',
          required: false
        },
        {
          id: 'sari-cay-akar',
          label: 'Sarı çay akar',
          type: 'checkbox',
          required: false
        },
        {
          id: 'hastalik-turleri',
          label: 'Hastalık Türleri:',
          type: 'subheader',
          required: false
        },
        {
          id: 'fungusit',
          label: 'Nematod',
          type: 'checkbox',
          required: false
        },
        {
          id: 'kulleme',
          label: 'Külleme',
          type: 'checkbox',
          required: false
        },
        {
          id: 'pas',
          label: 'Pas',
          type: 'checkbox',
          required: false
        },
        {
          id: 'virus',
          label: 'Virüs',
          type: 'checkbox',
          required: false
        },
        {
          id: 'bakteri',
          label: 'Bakteri',
          type: 'checkbox',
          required: false
        },
        {
          id: 'zararli-fotograflar',
          label: '📌 Tüm zararlılar için görseller',
          type: 'multiple-files',
          required: false
        }
      ]
    },
    {
      id: 'besin-eksikligi-kontrolu',
      label: '8) Besin Eksikliği Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'makro-elementler',
          label: 'Makro Elementler:',
          type: 'subheader',
          required: false
        },
        {
          id: 'makro-elementler-foto',
          label: '📷 Makro Elementler Fotoğrafları',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'azot',
          label: 'Azot',
          type: 'checkbox',
          required: false
        },
        {
          id: 'fosfor',
          label: 'Fosfor',
          type: 'checkbox',
          required: false
        },
        {
          id: 'potasyum',
          label: 'Potasyum',
          type: 'checkbox',
          required: false
        },
        {
          id: 'magnezyum',
          label: 'Magnezyum',
          type: 'checkbox',
          required: false
        },
        {
          id: 'kalsiyum',
          label: 'Kalsiyum',
          type: 'checkbox',
          required: false
        },
        {
          id: 'kukurt',
          label: 'Kükürt',
          type: 'checkbox',
          required: false
        },
        {
          id: 'mikro-elementler',
          label: 'Mikro Elementler:',
          type: 'subheader',
          required: false
        },
        {
          id: 'mikro-elementler-foto',
          label: '📷 Mikro Elementler Fotoğrafları',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'mangan',
          label: 'Mangan',
          type: 'checkbox',
          required: false
        },
        {
          id: 'cinko',
          label: 'Çinko',
          type: 'checkbox',
          required: false
        },
        {
          id: 'bor',
          label: 'Bor',
          type: 'checkbox',
          required: false
        },
        {
          id: 'molibden',
          label: 'Molibden',
          type: 'checkbox',
          required: false
        },
        {
          id: 'bakir',
          label: 'Bakır',
          type: 'checkbox',
          required: false
        },
        {
          id: 'demir',
          label: 'Demir',
          type: 'checkbox',
          required: false
        },
        {
          id: 'nikel',
          label: 'Nikel',
          type: 'checkbox',
          required: false
        },
        {
          id: 'kobalt',
          label: 'Kobalt',
          type: 'checkbox',
          required: false
        }
      ]
    },
    {
      id: 'sera-kulturel-genel-kontrol',
      label: '9) Sera Kültürel – Genel Kontrol',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'bitkisel-kulturel-islemler',
          label: 'Bitkisel Kültürel İşlemler:',
          type: 'subheader',
          required: false
        },
        {
          id: 'dolama-yapilmis-mi',
          label: 'Dolama yapılsın',
          type: 'checkbox',
          required: false
        },
        {
          id: 'toplama-yapilmis-mi',
          label: 'Toplama yapılsın',
          type: 'checkbox',
          required: false
        },
        {
          id: 'nemlendirme-yapilmis-mi',
          label: 'Nemlendirme yapılsın',
          type: 'checkbox',
          required: false
        },
        {
          id: 'budama-yapilmis-mi',
          label: 'Budama yapılsın',
          type: 'checkbox',
          required: false
        },
        {
          id: 'ip-baglama-yapilmis-mi',
          label: 'İp bağlama yapılsın',
          type: 'checkbox',
          required: false
        },
        {
          id: 'sera-ici-temizlik',
          label: 'Sera içi temizlik',
          type: 'textarea',
          required: false,
          placeholder: 'Sera içi temizlik durumunu açıklayın...'
        },
        {
          id: 'tuzak-ekleme',
          label: 'Tuzak Ekleme:',
          type: 'subheader',
          required: false
        },
        {
          id: '5-adet-mavi',
          label: '5 adet mavi',
          type: 'checkbox',
          required: false
        },
        {
          id: '5-adet-sari',
          label: '5 adet sarı',
          type: 'checkbox',
          required: false
        },
        {
          id: '10-adet-mavi',
          label: '10 adet mavi',
          type: 'checkbox',
          required: false
        },
        {
          id: '10-adet-sari',
          label: '10 adet sarı',
          type: 'checkbox',
          required: false
        },
        {
          id: '15-adet-mavi',
          label: '15 adet mavi',
          type: 'checkbox',
          required: false
        },
        {
          id: '15-adet-sari',
          label: '15 adet sarı',
          type: 'checkbox',
          required: false
        }
      ]
    }
  ]
}; 