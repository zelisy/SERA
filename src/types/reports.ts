import type { Producer } from './producer';
import type { UretimAlani } from './checklist';

// Rapor Filtreleri
export interface ReportFilters {
  producers: string[]; // Seçilen üretici ID'leri
  greenhouses: string[]; // Seçilen sera ID'leri
  startDate: string;
  endDate: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  season: string; // 2023-2024, 2024-2025 gibi
  reportTypes: ReportType[];
}

// Rapor Türleri
export type ReportType = 
  | 'production' 
  | 'financial' 
  | 'greenhouse_control' 
  | 'pre_planting' 
  | 'harvest'
  | 'comparison';

// KPI Metrikleri
export interface KPIMetrics {
  totalProduction: number; // kg
  totalRevenue: number; // TL
  totalCost: number; // TL
  netProfit: number; // TL
  averagePrice: number; // TL/kg
  yieldPerDecareAvg: number; // kg/da
  profitMargin: number; // %
  productionGrowth: number; // %
  revenueGrowth: number; // %
  totalGreenhouseArea: number; // m²
  activeProducers: number;
  completedHarvests: number;
  averageEfficiency: number; // %
}

// Zaman Serisi Verisi
export interface TimeSeriesData {
  date: string;
  production: number;
  revenue: number;
  cost: number;
  profit: number;
}

// Üretici Performansı
export interface ProducerPerformance {
  producer: Producer;
  production: number; // kg
  revenue: number; // TL
  cost: number; // TL
  profit: number; // TL
  efficiency: number; // %
  greenhouseCount: number;
  averageYield: number; // kg/da
  profitMargin: number; // %
}

// Sera Performansı
export interface GreenhousePerformance {
  greenhouse: UretimAlani;
  producer: Producer;
  production: number; // kg
  revenue: number; // TL
  yieldPerDecare: number; // kg/da
  efficiency: number; // %
  averagePrice: number; // TL/kg
  harvestCount: number;
  lastHarvestDate?: string;
}

// Ürün Bazlı Analiz
export interface CropAnalysis {
  cropType: string;
  variety: string;
  totalProduction: number; // kg
  totalRevenue: number; // TL
  averagePrice: number; // TL/kg
  averageYield: number; // kg/da
  marketShare: number; // %
  profitMargin: number; // %
  producerCount: number;
  greenhouseCount: number;
}

// Kontrol Listesi Analizi
export interface ChecklistAnalysis {
  checklistType: 'pre-planting' | 'greenhouse-control';
  completionRate: number; // %
  averageScore: number; // %
  commonIssues: string[];
  completedTasks: number;
  totalTasks: number;
  lastUpdateDate: string;
}

// Finansal Özet
export interface FinancialSummary {
  period: string;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  costBreakdown: {
    material: number;
    labor: number;
    energy: number;
    other: number;
  };
  revenueBreakdown: {
    [cropType: string]: number;
  };
}

// Trend Analizi
export interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // %
  direction: string;
  period: string;
}

// Karşılaştırma Verisi
export interface ComparisonData {
  current: KPIMetrics;
  previous: KPIMetrics;
  changes: {
    [key in keyof KPIMetrics]: {
      value: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

// Rapor Konfigürasyonu
export interface ReportConfig {
  title: string;
  subtitle?: string;
  includeCharts: boolean;
  includeTables: boolean;
  includeKPIs: boolean;
  layout: 'vertical' | 'horizontal';
  chartTypes: ChartType[];
  exportFormat: 'pdf' | 'excel' | 'csv';
}

// Grafik Türleri
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'area' 
  | 'scatter' 
  | 'donut'
  | 'gauge';

// Tam Rapor Verisi
export interface ReportData {
  filters: ReportFilters;
  kpis: KPIMetrics;
  timeSeriesData: TimeSeriesData[];
  producerPerformances: ProducerPerformance[];
  greenhousePerformances: GreenhousePerformance[];
  cropAnalyses: CropAnalysis[];
  checklistAnalyses: ChecklistAnalysis[];
  financialSummary: FinancialSummary;
  trends: TrendAnalysis[];
  comparison?: ComparisonData;
  generatedAt: string;
  reportId: string;
}

// Excel Export Yapısı
export interface ExportData {
  summary: KPIMetrics;
  producers: ProducerPerformance[];
  greenhouses: GreenhousePerformance[];
  timeSeries: TimeSeriesData[];
  crops: CropAnalysis[];
  financial: FinancialSummary;
}

// Alert/Uyarı Türleri
export interface ReportAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

// Rapor Ayarları
export interface ReportSettings {
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  defaultPeriod: string;
  defaultFilters: Partial<ReportFilters>;
  favoriteReports: string[];
  notifications: boolean;
} 