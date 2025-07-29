export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'boolean' | 'file' | 'multiple-files' | 'pest-control' | 'development-stage';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  dependsOn?: string; // Field id that this field depends on
  showWhen?: string | number | boolean; // Value that triggers visibility
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  hasDetails: boolean;
  detailFields?: FormField[];
  data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
  history?: any[];
}

export interface ChecklistData {
  sections: ChecklistSection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  };
}

// Üretim Alanı Bilgisi Tipleri
export interface UretimAlani {
  id: string;
  producerId: string; // Üretici ID'si
  
  // Sera Tipi Bilgileri
  seraType: 'cam' | 'plastik' | 'acikalan';
  plastikYil?: number; // Plastik ise kaç yıllık
  katmanType?: 'tek' | 'cift'; // Tek katmı/çift katmı
  
  // Lokasyon Bilgileri
  ada: string;
  parsel: string;
  mahalle: string;
  alanM2: number;
  
  // Ürün Bilgileri
  urunIsmi: string;
  cesitIsmi: string;
  dikimTarihi: string;
  
  // Dikim Detayları
  dikimYogunlugu: string;
  siraArasiMesafe: number;
  setUstuMesafe: number;
  siraType: 'tek' | 'cift';
  dikimYonu: 'kuzey-guney' | 'dogu-bati';
  
  // Su ve Sulama
  suKaynagi: string;
  damlamaSistemiAdeti: number;
  nemlendirmeSistemi: boolean;
  damlamaDebisi?: string;
  sulamaSekli?: string;
  
  // Toprak Bilgileri
  toprakYapisi: 'tasli' | 'kumlu' | 'tinli' | 'killi' | 'marnli' | 'humuslu' | 'kirecli';
  drenajSeviyesi: 'cok-iyi' | 'iyi' | 'orta' | 'kotu' | 'cok-kotu';
  
  // Sistem Bilgileri
  isitmaSistemi: string;
  havalandirma: 'tepe' | 'oluk-ustu' | 'yandan' | 'yandan-oluk-ustu';
  tulBilgisi: boolean;
  tulType?: 'ari' | 'bocek' | 'ari-bocek'; // Tül varsa
  
  // İşçilik
  kulturelIslemler: 'isci' | 'kendi' | 'isci-kendi';
  
  // Teknik Ekip Değerlendirmesi
  teknikDegerlendirme: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Hasat Bilgisi Interface
export interface HasatBilgisi {
  id: string;
  producerId: string; // Üretici ID'si
  
  // Dönem Bilgisi
  donem: string; // 2023-2024, 2024-2025, vb.
  
  // Ürün Bilgileri
  cesit: string; // Çeşit
  dikimTarihi: string;
  
  // Verim Bilgileri
  tonajDa: number; // Tonaj/da
  ciroDa: number; // Ciro/da  
  ortalamaFiyat: number; // Ortalama fiyat
  kacDa: number; // Kaç da alan
  
  // Satış Detayları
  kasaAdeti: number;
  kasaFiyati: number;
  kazanc: number; // Hesaplanacak: kasaAdeti * kasaFiyati
  
  // Dokümantasyon
  halFisiUrl?: string; // Hal fişi fotoğrafı
  
  // Notlar
  teknikEkipNotu?: string;
  ciftciNotu?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}