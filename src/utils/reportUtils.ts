import { 
  getAllProducers, 
  getAllUretimAlanlari, 
  getAllHasatBilgileri, 
  loadChecklistData 
} from './firestoreUtils';
import type { 
  ReportData, 
  ReportFilters, 
  KPIMetrics, 
  ProducerPerformance, 
  GreenhousePerformance, 
  CropAnalysis, 
  ChecklistAnalysis,
  FinancialSummary,
  TimeSeriesData,
  TrendAnalysis
} from '../types/reports';
import type { Producer } from '../types/producer';
import type { UretimAlani, HasatBilgisi } from '../types/checklist';

// Varsayılan filtreler
export const getDefaultFilters = (): ReportFilters => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Bu ayın başı ve sonu
  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  return {
    producers: [],
    greenhouses: [],
    startDate,
    endDate,
    period: 'month',
    season: `${currentYear}-${currentYear + 1}`,
    reportTypes: ['production', 'financial'],
    cropTypes: []
  };
};

// Tarih aralığına göre veri filtreleme
export const filterByDateRange = <T extends { createdAt: string }>(
  data: T[], 
  startDate: string, 
  endDate: string
): T[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return data.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= start && itemDate <= end;
  });
};

// KPI hesaplama
export const calculateKPIs = async (filters: ReportFilters): Promise<KPIMetrics> => {
  try {
    const [producers, greenhouses, harvests] = await Promise.all([
      getAllProducers(),
      getAllUretimAlanlari(),
      getAllHasatBilgileri()
    ]);

    // Filtreleme
    const filteredHarvests = filterDataByFilters(harvests, filters);
    const filteredGreenhouses = filterDataByFilters(greenhouses, filters);
    const filteredProducers = filterProducersByFilters(producers, filters);

    // Hesaplamalar
    const totalProduction = filteredHarvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
    const totalRevenue = filteredHarvests.reduce((sum, h) => sum + h.ciroDa, 0);
    const totalCost = filteredHarvests.reduce((sum, h) => sum + (h.kasaAdeti * h.kasaFiyati * 0.7), 0); // Tahmini maliyet
    const netProfit = totalRevenue - totalCost;
    const averagePrice = filteredHarvests.length > 0 ? 
      filteredHarvests.reduce((sum, h) => sum + h.ortalamaFiyat, 0) / filteredHarvests.length : 0;
    
    const totalArea = filteredGreenhouses.reduce((sum, g) => sum + g.alanM2, 0);
    const yieldPerDecareAvg = filteredHarvests.length > 0 ?
      filteredHarvests.reduce((sum, h) => sum + h.tonajDa, 0) / filteredHarvests.length : 0;

    // Büyüme hesaplaması (önceki dönemle karşılaştırma)
    const previousPeriodFilters = getPreviousPeriodFilters(filters);
    const previousHarvests = filterDataByFilters(harvests, previousPeriodFilters);
    const previousProduction = previousHarvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
    const previousRevenue = previousHarvests.reduce((sum, h) => sum + h.ciroDa, 0);
    
    const productionGrowth = previousProduction > 0 ? 
      ((totalProduction - previousProduction) / previousProduction) * 100 : 0;
    const revenueGrowth = previousRevenue > 0 ? 
      ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalProduction,
      totalRevenue,
      totalCost,
      netProfit,
      averagePrice,
      yieldPerDecareAvg,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      productionGrowth,
      revenueGrowth,
      totalGreenhouseArea: totalArea / 10000, // m² to dekar
      activeProducers: filteredProducers.length,
      completedHarvests: filteredHarvests.length,
      averageEfficiency: calculateAverageEfficiency(filteredGreenhouses, filteredHarvests)
    };
  } catch (error) {
    console.error('KPI hesaplama hatası:', error);
    throw new Error('KPI verileri hesaplanamadı');
  }
};

// Üretici performansı hesaplama
export const calculateProducerPerformances = async (filters: ReportFilters): Promise<ProducerPerformance[]> => {
  try {
    const [producers, greenhouses, harvests] = await Promise.all([
      getAllProducers(),
      getAllUretimAlanlari(),
      getAllHasatBilgileri()
    ]);

    const filteredHarvests = filterDataByFilters(harvests, filters);
    const filteredGreenhouses = filterDataByFilters(greenhouses, filters);

    return producers.map(producer => {
      const producerHarvests = filteredHarvests.filter(h => h.producerId === producer.id);
      const producerGreenhouses = filteredGreenhouses.filter(g => g.producerId === producer.id);
      
      const production = producerHarvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
      const revenue = producerHarvests.reduce((sum, h) => sum + h.ciroDa, 0);
      const cost = producerHarvests.reduce((sum, h) => sum + (h.kasaAdeti * h.kasaFiyati * 0.7), 0);
      const profit = revenue - cost;
      const averageYield = producerHarvests.length > 0 ?
        producerHarvests.reduce((sum, h) => sum + h.tonajDa, 0) / producerHarvests.length : 0;

      return {
        producer,
        production,
        revenue,
        cost,
        profit,
        efficiency: calculateProducerEfficiency(producerGreenhouses, producerHarvests),
        greenhouseCount: producerGreenhouses.length,
        averageYield,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    }).filter(p => p.production > 0 || filters.producers.includes(p.producer.id));
  } catch (error) {
    console.error('Üretici performans hesaplama hatası:', error);
    throw new Error('Üretici performans verileri hesaplanamadı');
  }
};

// Sera performansı hesaplama
export const calculateGreenhousePerformances = async (filters: ReportFilters): Promise<GreenhousePerformance[]> => {
  try {
    const [producers, greenhouses, harvests] = await Promise.all([
      getAllProducers(),
      getAllUretimAlanlari(),
      getAllHasatBilgileri()
    ]);

    const filteredHarvests = filterDataByFilters(harvests, filters);
    const filteredGreenhouses = filterDataByFilters(greenhouses, filters);

    return filteredGreenhouses.map(greenhouse => {
      const producer = producers.find(p => p.id === greenhouse.producerId);
      const greenhouseHarvests = filteredHarvests.filter(h => h.producerId === greenhouse.producerId);
      
      const production = greenhouseHarvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
      const revenue = greenhouseHarvests.reduce((sum, h) => sum + h.ciroDa, 0);
      const averagePrice = greenhouseHarvests.length > 0 ?
        greenhouseHarvests.reduce((sum, h) => sum + h.ortalamaFiyat, 0) / greenhouseHarvests.length : 0;
      
      const lastHarvest = greenhouseHarvests.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        greenhouse,
        producer: producer!,
        production,
        revenue,
        yieldPerDecare: production / (greenhouse.alanM2 / 1000), // kg/da
        efficiency: calculateGreenhouseEfficiency(greenhouse, greenhouseHarvests),
        averagePrice,
        harvestCount: greenhouseHarvests.length,
        lastHarvestDate: lastHarvest?.createdAt
      };
    }).filter(gh => gh.producer);
  } catch (error) {
    console.error('Sera performans hesaplama hatası:', error);
    throw new Error('Sera performans verileri hesaplanamadı');
  }
};

// Ürün analizi hesaplama
export const calculateCropAnalyses = async (filters: ReportFilters): Promise<CropAnalysis[]> => {
  try {
    const [greenhouses, harvests] = await Promise.all([
      getAllUretimAlanlari(),
      getAllHasatBilgileri()
    ]);

    const filteredHarvests = filterDataByFilters(harvests, filters);
    const filteredGreenhouses = filterDataByFilters(greenhouses, filters);

    const cropGroups = groupBy(filteredHarvests, 'cesit');
    const totalMarketValue = filteredHarvests.reduce((sum, h) => sum + h.ciroDa, 0);

    return Object.entries(cropGroups).map(([variety, crops]) => {
      const cropProduction = crops.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
      const cropRevenue = crops.reduce((sum, h) => sum + h.ciroDa, 0);
      const cropCost = crops.reduce((sum, h) => sum + (h.kasaAdeti * h.kasaFiyati * 0.7), 0);
      const averagePrice = crops.length > 0 ?
        crops.reduce((sum, h) => sum + h.ortalamaFiyat, 0) / crops.length : 0;
      const averageYield = crops.length > 0 ?
        crops.reduce((sum, h) => sum + h.tonajDa, 0) / crops.length : 0;

      const relatedGreenhouses = filteredGreenhouses.filter(g => 
        crops.some(c => c.producerId === g.producerId)
      );
      const uniqueProducers = new Set(crops.map(c => c.producerId));

      return {
        cropType: variety.split(' ')[0] || 'Bilinmeyen', // İlk kelimeyi ürün türü olarak al
        variety,
        totalProduction: cropProduction,
        totalRevenue: cropRevenue,
        averagePrice,
        averageYield,
        marketShare: totalMarketValue > 0 ? (cropRevenue / totalMarketValue) * 100 : 0,
        profitMargin: cropRevenue > 0 ? ((cropRevenue - cropCost) / cropRevenue) * 100 : 0,
        producerCount: uniqueProducers.size,
        greenhouseCount: relatedGreenhouses.length
      };
    });
  } catch (error) {
    console.error('Ürün analizi hesaplama hatası:', error);
    throw new Error('Ürün analizi verileri hesaplanamadı');
  }
};

// Zaman serisi verisi oluşturma
export const generateTimeSeriesData = async (filters: ReportFilters): Promise<TimeSeriesData[]> => {
  try {
    const harvests = await getAllHasatBilgileri();
    const filteredHarvests = filterDataByFilters(harvests, filters);

    const grouped = groupByPeriod(filteredHarvests, filters.period);
    
    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        production: items.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0),
        revenue: items.reduce((sum, h) => sum + h.ciroDa, 0),
        cost: items.reduce((sum, h) => sum + (h.kasaAdeti * h.kasaFiyati * 0.7), 0),
        profit: items.reduce((sum, h) => sum + h.ciroDa, 0) - items.reduce((sum, h) => sum + (h.kasaAdeti * h.kasaFiyati * 0.7), 0)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Zaman serisi verisi oluşturma hatası:', error);
    throw new Error('Zaman serisi verileri oluşturulamadı');
  }
};

// Tam rapor verisi oluşturma
export const generateReportData = async (filters: ReportFilters): Promise<ReportData> => {
  try {
    // Önce ham verileri çek
    const [rawProducers, rawGreenhouses, rawHarvests] = await Promise.all([
      getAllProducers(),
      getAllUretimAlanlari(),
      getAllHasatBilgileri()
    ]);

    // Veri validasyonu - hiç veri yoksa hata fırlat
    if (rawProducers.length === 0 && rawGreenhouses.length === 0 && rawHarvests.length === 0) {
      throw new Error('Sistemde hiç veri bulunamadı. Lütfen önce üretici, sera ve hasat bilgilerini ekleyin.');
    }

    // Filtrelenmiş verileri al
    const filteredHarvests = filterDataByFilters(rawHarvests, filters);
    const filteredGreenhouses = filterDataByFilters(rawGreenhouses, filters);
    const filteredProducers = filterProducersByFilters(rawProducers, filters);

    // Kritik kontrol: Filtreleme sonrası hiç veri yoksa
    if (filteredHarvests.length === 0) {
      const dateRange = `${new Date(filters.startDate).toLocaleDateString('tr-TR')} - ${new Date(filters.endDate).toLocaleDateString('tr-TR')}`;
      throw new Error(`Seçilen tarih aralığında (${dateRange}) hiç hasat verisi bulunamadı. Lütfen farklı bir tarih aralığı seçin veya bu dönemde hasat verisi ekleyin.`);
    }

    if (filteredGreenhouses.length === 0) {
      throw new Error('Seçilen filtrelere uygun sera bulunamadı. Lütfen filtreleri gözden geçirin.');
    }

    // Üretici filtresi uygulandıysa kontrol et
    if (filters.producers.length > 0 && filteredProducers.length === 0) {
      throw new Error('Seçilen üreticiler bulunamadı. Lütfen geçerli üreticiler seçin.');
    }

    const [
      kpis,
      producerPerformances,
      greenhousePerformances,
      cropAnalyses,
      timeSeriesData
    ] = await Promise.all([
      calculateKPIs(filters),
      calculateProducerPerformances(filters),
      calculateGreenhousePerformances(filters),
      calculateCropAnalyses(filters),
      generateTimeSeriesData(filters)
    ]);

    // Hesaplanmış verilerde de kontrol yap
    if (producerPerformances.length === 0 && filters.producers.length === 0) {
      throw new Error('Seçilen dönemde aktif üretici bulunamadı.');
    }

    if (cropAnalyses.length === 0) {
      throw new Error('Seçilen dönemde ürün analizi yapılacak veri bulunamadı.');
    }

    // Kontrol listesi analizleri
    const checklistAnalyses = await calculateChecklistAnalyses();
    
    // Finansal özet
    const financialSummary = calculateFinancialSummary(kpis, cropAnalyses, filters);
    
    // Trend analizleri
    const trends = calculateTrends(kpis, timeSeriesData);

    return {
      filters,
      kpis,
      timeSeriesData,
      producerPerformances,
      greenhousePerformances,
      cropAnalyses,
      checklistAnalyses,
      financialSummary,
      trends,
      generatedAt: new Date().toISOString(),
      reportId: generateReportId()
    };
  } catch (error) {
    console.error('Rapor verisi oluşturma hatası:', error);
    
    // Eğer hata mesajı zaten kullanıcı dostu ise, onu koru
    if (error instanceof Error && error.message.includes('bulunamadı') || error instanceof Error && error.message.includes('ekleyin')) {
      throw error;
    }
    
    // Aksi halde genel hata mesajı
    throw new Error('Rapor verileri oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
  }
};

// Yardımcı fonksiyonlar
const filterDataByFilters = <T extends { producerId?: string; createdAt: string }>(
  data: T[], 
  filters: ReportFilters
): T[] => {
  return data.filter(item => {
    // Üretici filtresi
    if (filters.producers.length > 0 && item.producerId && !filters.producers.includes(item.producerId)) {
      return false;
    }
    
    // Tarih filtresi
    const itemDate = new Date(item.createdAt);
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    return itemDate >= startDate && itemDate <= endDate;
  });
};

const filterProducersByFilters = (producers: Producer[], filters: ReportFilters): Producer[] => {
  if (filters.producers.length === 0) return producers;
  return producers.filter(p => filters.producers.includes(p.id));
};

const getPreviousPeriodFilters = (filters: ReportFilters): ReportFilters => {
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  const diff = end.getTime() - start.getTime();
  
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - diff);
  
  return {
    ...filters,
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0]
  };
};

const calculateAverageEfficiency = (greenhouses: UretimAlani[], harvests: HasatBilgisi[]): number => {
  if (greenhouses.length === 0) return 0;
  
  const totalPotential = greenhouses.reduce((sum, g) => sum + (g.alanM2 / 1000 * 50), 0); // 50 kg/da potansiyel
  const actualProduction = harvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
  
  return totalPotential > 0 ? (actualProduction / totalPotential) * 100 : 0;
};

const calculateProducerEfficiency = (greenhouses: UretimAlani[], harvests: HasatBilgisi[]): number => {
  if (greenhouses.length === 0) return 0;
  
  const totalArea = greenhouses.reduce((sum, g) => sum + g.alanM2, 0) / 1000; // dekar
  const totalProduction = harvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
  
  return totalArea > 0 ? (totalProduction / totalArea) * 2 : 0; // 50 kg/da = 100% efficiency
};

const calculateGreenhouseEfficiency = (greenhouse: UretimAlani, harvests: HasatBilgisi[]): number => {
  const area = greenhouse.alanM2 / 1000; // dekar
  const production = harvests.reduce((sum, h) => sum + (h.tonajDa * h.kacDa), 0);
  
  return area > 0 ? (production / area) * 2 : 0; // 50 kg/da = 100% efficiency
};

const calculateChecklistAnalyses = async (): Promise<ChecklistAnalysis[]> => {
  try {
    const [prePlanting, greenhouseControl] = await Promise.all([
      loadChecklistData('dikim-oncesi'),
      loadChecklistData('sera-kontrol')
    ]);

    const analyses: ChecklistAnalysis[] = [];

    if (prePlanting) {
      const completedTasks = prePlanting.items.filter(item => item.completed).length;
      const totalTasks = prePlanting.items.length;
      
      analyses.push({
        checklistType: 'pre-planting',
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageScore: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        commonIssues: prePlanting.items.filter(item => !item.completed).map(item => item.label),
        completedTasks,
        totalTasks,
        lastUpdateDate: new Date().toISOString()
      });
    }

    if (greenhouseControl) {
      const completedTasks = greenhouseControl.items.filter(item => item.completed).length;
      const totalTasks = greenhouseControl.items.length;
      
      analyses.push({
        checklistType: 'greenhouse-control',
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageScore: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        commonIssues: greenhouseControl.items.filter(item => !item.completed).map(item => item.label),
        completedTasks,
        totalTasks,
        lastUpdateDate: new Date().toISOString()
      });
    }

    return analyses;
  } catch (error) {
    console.error('Kontrol listesi analizi hatası:', error);
    return [];
  }
};

const calculateFinancialSummary = (
  kpis: KPIMetrics, 
  cropAnalyses: CropAnalysis[], 
  filters: ReportFilters
): FinancialSummary => {
  const revenueBreakdown: { [cropType: string]: number } = {};
  cropAnalyses.forEach(crop => {
    revenueBreakdown[crop.cropType] = crop.totalRevenue;
  });

  return {
    period: `${filters.startDate} - ${filters.endDate}`,
    totalRevenue: kpis.totalRevenue,
    totalCost: kpis.totalCost,
    netProfit: kpis.netProfit,
    profitMargin: kpis.profitMargin,
    costBreakdown: {
      material: kpis.totalCost * 0.4, // %40 materyal
      labor: kpis.totalCost * 0.3,    // %30 işçilik
      energy: kpis.totalCost * 0.2,   // %20 enerji
      other: kpis.totalCost * 0.1     // %10 diğer
    },
    revenueBreakdown
  };
};

const calculateTrends = (kpis: KPIMetrics, timeSeriesData: TimeSeriesData[]): TrendAnalysis[] => {
  const trends: TrendAnalysis[] = [];
  
  if (timeSeriesData.length >= 2) {
    const recent = timeSeriesData[timeSeriesData.length - 1];
    const previous = timeSeriesData[timeSeriesData.length - 2];
    
    trends.push({
      metric: 'Üretim',
      trend: recent.production > previous.production ? 'up' : recent.production < previous.production ? 'down' : 'stable',
      change: previous.production > 0 ? ((recent.production - previous.production) / previous.production) * 100 : 0,
      direction: recent.production > previous.production ? 'Artış' : recent.production < previous.production ? 'Azalış' : 'Sabit',
      period: 'Son dönem'
    });
  }
  
  return trends;
};

const groupBy = <T>(array: T[], key: keyof T): { [key: string]: T[] } => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
};

const groupByPeriod = (harvests: HasatBilgisi[], period: string): { [key: string]: HasatBilgisi[] } => {
  return harvests.reduce((groups, harvest) => {
    const date = new Date(harvest.createdAt);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week': {
        const week = getWeekNumber(date);
        key = `${date.getFullYear()}-W${week}`;
        break;
      }
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      }
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(harvest);
    return groups;
  }, {} as { [key: string]: HasatBilgisi[] });
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const generateReportId = (): string => {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Formatters
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

export const formatNumber = (number: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatPercentage = (value: number): string => {
  return `${formatNumber(value, 1)}%`;
};

export const formatWeight = (kg: number): string => {
  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, 1)} ton`;
  }
  return `${formatNumber(kg)} kg`;
};

export const formatArea = (m2: number): string => {
  const dekar = m2 / 1000;
  return `${formatNumber(dekar, 2)} da`;
}; 