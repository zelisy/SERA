import type { ChecklistSection } from '../types/checklist';

export const dikimOncesiDetayConfig: ChecklistSection = {
  id: 'dikim-oncesi-detay',
  title: 'Dikim Öncesi Dönem Detaylı Checklist',
  items: [
    {
      id: 'solarizasyon',
      label: '1) Solarizasyon yapıldı',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'solarizasyon-durum',
          label: 'Solarizasyon Durumu',
          type: 'select',
          required: false,
          options: ['Yapıldı', 'Yapılmadı']
        },
        {
          id: 'kullanilan-urun',
          label: 'Solarizasyonda Kullanılan Ürün',
          type: 'text',
          required: false,
          dependsOn: 'solarizasyon-durum',
          showWhen: 'Yapıldı',
          placeholder: 'Kullanılan ürün/materyal adı...'
        },
        {
          id: 'baslangic-tarihi',
          label: 'Başlangıç Tarihi',
          type: 'date',
          required: false,
          dependsOn: 'solarizasyon-durum',
          showWhen: 'Yapıldı'
        },
        {
          id: 'bitis-tarihi',
          label: 'Bitiş Tarihi',
          type: 'date',
          required: false,
          dependsOn: 'solarizasyon-durum',
          showWhen: 'Yapıldı'
        },
        {
          id: 'golge-durumu',
          label: 'Gölge Durumu',
          type: 'select',
          required: false,
          options: ['Var', 'Yok']
        }
      ]
    },
    {
      id: 'toprak-isleme',
      label: '2) Toprak İşleme Şekli',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'isleme-sekli',
          label: 'İşleme Şekli',
          type: 'select',
          required: false,
          options: ['Derin İşleme', 'Set Üstü İşleme']
        },
        {
          id: 'isleme-tarihi',
          label: 'İşleme Tarihi',
          type: 'date',
          required: false
        },
        {
          id: 'kullanilan-ekipman',
          label: 'Kullanılan Ekipman',
          type: 'text',
          required: false,
          placeholder: 'Traktör, rotovatör, pulluk vb...'
        }
      ]
    },
    {
      id: 'toprak-alti-gubreleme',
      label: '3) Toprak Altı Gübreleme',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'gubreleme-turu',
          label: 'Gübreleme Türü',
          type: 'select',
          required: false,
          options: ['Kimyasal Gübreleme', 'Organik Gübreleme']
        },
        {
          id: 'uygulama-zamani',
          label: 'Uygulama Zamanı',
          type: 'date',
          required: false
        },
        {
          id: 'gubre-cesidi',
          label: 'Gübre Çeşidi',
          type: 'text',
          required: false,
          placeholder: 'NPK 15-15-15, çiftlik gübresi vb...'
        },
        {
          id: 'miktar',
          label: 'Uygulanan Miktar (kg/dekar)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        }
      ]
    },
    {
      id: 'dikim-oncesi-dezenfeksiyon',
      label: '4) Dikim Öncesi Dezenfeksiyon',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'dezenfeksiyon-durum',
          label: 'Dezenfeksiyon Yapıldı mı?',
          type: 'select',
          required: false,
          options: ['Yapıldı', 'Yapılmadı']
        },
        {
          id: 'kullanilan-maddeler',
          label: 'Kullanılan Dezenfektan Maddeler',
          type: 'textarea',
          required: false,
          dependsOn: 'dezenfeksiyon-durum',
          showWhen: 'Yapıldı',
          placeholder: 'Kullanılan dezenfektan maddeleri ve oranları...'
        },
        {
          id: 'uygulama-tarihi',
          label: 'Uygulama Tarihi',
          type: 'date',
          required: false,
          dependsOn: 'dezenfeksiyon-durum',
          showWhen: 'Yapıldı'
        }
      ]
    },
    {
      id: 'analizler-olcumler',
      label: '5) Analizler ve Ölçümler',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'su-analizi-ec',
          label: 'Su Analizi EC Değeri',
          type: 'number',
          required: false,
          validation: { min: 0 },
          placeholder: 'mS/cm'
        },
        {
          id: 'su-analizi-ph',
          label: 'Su Analizi pH Değeri',
          type: 'number',
          required: false,
          validation: { min: 0, max: 14 }
        },
        {
          id: 'toprak-analizi-yapildi',
          label: 'Toprak Analizi Yapıldı mı?',
          type: 'boolean',
          required: false
        },
        {
          id: 'toprak-analizi-sonuc',
          label: 'Toprak Analizi Sonucu Fotoğrafları',
          type: 'multiple-files',
          required: false,
          dependsOn: 'toprak-analizi-yapildi',
          showWhen: true
        },
        {
          id: 'isik-analizi',
          label: 'Işık Değeri (lux)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          id: 'isi-degeri',
          label: 'Isı Değeri (°C)',
          type: 'number',
          required: false
        },
        {
          id: 'nem-degeri',
          label: 'Nem Değeri (%)',
          type: 'number',
          required: false,
          validation: { min: 0, max: 100 }
        },
        {
          id: 'damlama-sistemi-durum',
          label: 'Damlama Sistemi Genel Kontrolü',
          type: 'select',
          required: false,
          options: ['İyi', 'Orta', 'Kötü']
        },
        {
          id: 'kotu-durumu-nedeni',
          label: 'Kötü Durumu Nedeni',
          type: 'textarea',
          required: false,
          dependsOn: 'damlama-sistemi-durum',
          showWhen: 'Kötü',
          placeholder: 'Kötü durumun nedenleri...'
        },
        {
          id: 'sistem-fotografi',
          label: 'Sistem Fotoğrafları',
          type: 'multiple-files',
          required: false,
          dependsOn: 'damlama-sistemi-durum',
          showWhen: 'Kötü'
        }
      ]
    },
    {
      id: 'mucadele-bicimleri',
      label: '6) Mücadele Biçimleri',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'mucadele-turu',
          label: 'Mücadele Türü',
          type: 'select',
          required: false,
          options: ['Kimyasal Mücadele', 'Biyolojik Mücadele', 'Kimyasal + Biyolojik Mücadele']
        },
        {
          id: 'gecmis-donem-hikaye',
          label: 'Seranın Geçmiş Dönem Hastalık/Zararlı Hikayesi',
          type: 'textarea',
          required: false,
          placeholder: 'Geçmiş dönemlerde görülen hastalık ve zararlılar...'
        }
      ]
    },
    {
      id: 'tuzak-kontrol',
      label: '7) Tuzak Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'tuzak-durumu',
          label: 'Tuzak Var mı?',
          type: 'select',
          required: false,
          options: ['Var', 'Yok']
        },
        {
          id: 'tuzak-turu',
          label: 'Tuzak Türü',
          type: 'text',
          required: false,
          dependsOn: 'tuzak-durumu',
          showWhen: 'Var',
          placeholder: 'Sarı yapışkan tuzak, feromon tuzağı vb...'
        },
        {
          id: 'tuzak-sayisi',
          label: 'Tuzak Sayısı',
          type: 'number',
          required: false,
          dependsOn: 'tuzak-durumu',
          showWhen: 'Var',
          validation: { min: 0 }
        }
      ]
    },
    {
      id: 'fide-kontrol',
      label: '8) Fide Kontrolü',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'uretici-firma',
          label: 'Üretici Firma',
          type: 'text',
          required: false,
          placeholder: 'Fide üretici firmasının adı...'
        },
        {
          id: 'viol-turu',
          label: 'Viol Türü',
          type: 'text',
          required: false,
          placeholder: 'Viol türü ve özellikleri...'
        },
        {
          id: 'fide-cesidi',
          label: 'Fide Çeşidi',
          type: 'select',
          required: false,
          options: ['Biber', 'Domates']
        },
        {
          id: 'asi-yapisi',
          label: 'Aşı Yapısı (Domates için)',
          type: 'select',
          required: false,
          dependsOn: 'fide-cesidi',
          showWhen: 'Domates',
          options: ['İyi', 'Kötü']
        },
        {
          id: 'boy',
          label: 'Fide Boyu (cm)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          id: 'cap',
          label: 'Fide Çapı (mm)',
          type: 'number',
          required: false,
          validation: { min: 0 }
        },
        {
          id: 'kok-orani',
          label: 'Kök Oranı',
          type: 'select',
          required: false,
          options: ['Çok İyi', 'İyi', 'Orta', 'Kötü', 'Çok Kötü']
        },
        {
          id: 'kok-fotografi',
          label: 'Kök Fotoğrafı',
          type: 'file',
          required: false
        },
        {
          id: 'fide-sok-durumu',
          label: 'Fide Şok Durumu',
          type: 'select',
          required: false,
          options: ['Şoklı', 'Şoksuz']
        },
        {
          id: 'virus-varmi',
          label: 'Virüs Var mı?',
          type: 'select',
          required: false,
          options: ['Var', 'Yok']
        },
        {
          id: 'virus-fotografi',
          label: 'Virüs Fotoğrafı',
          type: 'file',
          required: false,
          dependsOn: 'virus-varmi',
          showWhen: 'Var'
        },
        {
          id: 'bakteri-varmi',
          label: 'Bakteri Var mı?',
          type: 'select',
          required: false,
          options: ['Var', 'Yok']
        },
        {
          id: 'bakteri-fotografi',
          label: 'Bakteri Fotoğrafı',
          type: 'file',
          required: false,
          dependsOn: 'bakteri-varmi',
          showWhen: 'Var'
        },
        {
          id: 'insektisit-akarisit',
          label: 'İnsektisit/Akarisit Var mı?',
          type: 'select',
          required: false,
          options: ['Var', 'Yok']
        },
        {
          id: 'insektisit-fotografi',
          label: 'İnsektisit/Akarisit Fotoğrafı',
          type: 'file',
          required: false,
          dependsOn: 'insektisit-akarisit',
          showWhen: 'Var'
        }
      ]
    },
    {
      id: 'su-olcum-noktasi',
      label: '9) Su Ölçüm Noktası Oluşturma',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'olcum-noktasi-olusturuldu',
          label: 'Ölçüm Noktası Oluşturuldu mu?',
          type: 'boolean',
          required: false
        },
        {
          id: 'ciftci-uyarisi',
          label: 'Çiftçiye Uyarı Yapıldı mı?',
          type: 'boolean',
          required: false
        },
        {
          id: 'uyari-detaylari',
          label: 'Uyarı Detayları',
          type: 'textarea',
          required: false,
          dependsOn: 'ciftci-uyarisi',
          showWhen: true,
          placeholder: 'Çiftçiye verilen uyarılar ve açıklamalar...'
        }
      ]
    },
    {
      id: 'kontrol-bitkileri',
      label: '10) Kontrol Bitkilerinin Belirlenmesi',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'belirlenen-bitki-sayisi',
          label: 'Belirlenen Bitki Sayısı',
          type: 'number',
          required: false,
          validation: { min: 1 }
        },
        {
          id: 'tablet-fotografi',
          label: 'Tablet ile Direkt Fotoğraflar',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'bitki-konumlari',
          label: 'Bitki Konumları',
          type: 'textarea',
          required: false,
          placeholder: 'Kontrol bitkilerinin seradaki konumları...'
        }
      ]
    },
    {
      id: 'dikim-sonrasi-gorseller',
      label: '11) Dikim Sonrası Çoklu Görsel',
      completed: false,
      hasDetails: true,
      detailFields: [
        {
          id: 'genel-gorseller',
          label: 'Genel Görseller',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'yakindan-gorseller',
          label: 'Yakından Görseller',
          type: 'multiple-files',
          required: false
        },
        {
          id: 'notlar',
          label: 'Dikim Sonrası Notlar',
          type: 'textarea',
          required: false,
          placeholder: 'Dikim sonrası gözlemler ve notlar...'
        }
      ]
    }
  ]
}; 