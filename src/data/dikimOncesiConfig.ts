import type { ChecklistSection } from '../types/checklist';

export const dikimOncesiConfig: ChecklistSection = {
  id: 'dikim-oncesi',
  title: 'Dikim Öncesi Dönem',
  items: [
    {
      id: 'toprak-analizi',
      label: 'Toprak analizi yapıldı',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'analiz-tarihi',
          label: 'Analiz Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'ph-degeri',
          label: 'pH Değeri',
          type: 'number',
          required: false
        },
        {
          id: 'organik-madde',
          label: 'Organik Madde (%)',
          type: 'number',
          required: false
        },
        {
          id: 'analiz-raporu',
          label: 'Analiz Raporu Fotoğrafları',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'notlar',
          label: 'Notlar',
          type: 'textarea',
          required: false,
          placeholder: 'Toprak analizi ile ilgili notlarınız...'
        }
      ]
    },
    {
      id: 'sera-temizligi',
      label: 'Üretim Alanı Temizliği tamamlandı',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'temizlik-tarihi',
          label: 'Temizlik Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'temizlik-turu',
          label: 'Temizlik Türü',
          type: 'select',
          required: false,
          options: ['Genel Temizlik', 'Dezenfeksiyon', 'Derinlemesine Temizlik']
        },
        {
          id: 'kullanilan-maddeler',
          label: 'Kullanılan Ürünler/Teknik Ekip Değerlendirme',
          type: 'textarea',
          required: false,
          placeholder: 'Kullanılan temizlik maddeleri ve miktarları...'
        },
        {
          id: 'temizlik-oncesi-foto',
          label: 'Temizlik Öncesi Fotoğraflar',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'temizlik-sonrasi-foto',
          label: 'Temizlik Sonrası Fotoğraflar',
          type: 'multiple-files',
          required: false
        }
      ]
    },
    {
      id: 'sulama-sistemi',
      label: 'Sulama sistemi kontrol edildi',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'kontrol-tarihi',
          label: 'Kontrol Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'sistem-durumu',
          label: 'Sistem Durumu',
          type: 'select',
          required: false,
          options: ['Mükemmel', 'İyi', 'Orta', 'Kötü', 'Arızalı']
        },
        {
          id: 'basinc-testi',
          label: 'Basınç Testi Yapıldı',
          type: 'boolean',
          required: false
        },
        {
          id: 'basinc-degeri',
          label: 'Basınç Değeri (bar)',
          type: 'number',
          required: false,
          dependsOn: 'basinc-testi',
          showWhen: true
        },
        {
          id: 'arizalar',
          label: 'Tespit Edilen Arızalar',
          type: 'textarea',
          required: false,
          placeholder: 'Varsa tespit edilen arızalar ve yapılan onarımlar...'
        },
        {
          id: 'sistem-foto',
          label: 'Sistem Fotoğrafları',
          type: 'multiple-files',
          required: false
        }
      ]
    },
    {
      id: 'gubreleme-plani',
      label: 'Gübreleme planı hazırlandı',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'plan-tarihi',
          label: 'Plan Hazırlama Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'gubreleme-programi',
          label: 'Gübreleme Programı',
          type: 'select',
          required: false,
          options: ['Haftalık', '10 Günlük', '2 Haftalık', 'Aylık', 'Diğer']
        },
        {
          id: 'ana-gubre',
          label: 'Ana Gübre Türü',
          type: 'select',
          required: false,
          options: ['NPK', 'Organik', 'Kompost', 'Çiftlik Gübresi', 'Karma', 'Diğer',"Mikrobiyal"]
        },
        {
          id: 'gubre-miktari',
          label: 'Gübre Miktarı (kg/dekar)',
          type: 'number',
          required: false
        },
        {
          id: 'plan-detaylari',
          label: 'Plan Detayları',
          type: 'textarea',
          required: false,
          placeholder: 'Gübreleme planının detayları, uygulama zamanları...'
        }
      ]
    },
    {
      id: 'fide-secimi',
      label: 'Fide seçimi tamamlandı',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'secim-tarihi',
          label: 'Fide Seçim Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'fide-turu',
          label: 'Fide Türü',
          type: 'select',
          required: false,
          options: ['Domates', 'Salatalık', 'Biber', 'Patlıcan', 'Diğer']
        },
        {
          id: 'fide-cesidi',
          label: 'Fide Çeşidi',
          type: 'text',
          required: false,
          placeholder: 'Örn: F1 Hibridi, Açık Tozlanan...'
        },
        {
          id: 'fide-sayisi',
          label: 'Fide Sayısı (adet)',
          type: 'number',
          required: false
        },
        {
          id: 'tedarikci',
          label: 'Tedarikçi Firma',
          type: 'text',
          required: false,
          placeholder: 'Fideyi aldığınız firma adı...'
        },
        {
          id: 'fide-foto',
          label: 'Fide Fotoğrafları',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'fide-notlari',
          label: 'Fide Notları/Teknik Ekip Değerlendirme',
          type: 'textarea',
          required: false,
          placeholder: 'Fide kalitesi, görünümü ile ilgili notlar...'
        }
      ]
    }
  ]
}; 