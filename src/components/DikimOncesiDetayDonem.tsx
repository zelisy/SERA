import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import { dikimOncesiDetayConfig } from '../data/dikimOncesiDetayConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData } from '../utils/firestoreUtils';
import type { ChecklistSection } from '../types/checklist';

const DikimOncesiDetayDonem: React.FC = () => {
  const [checklistData, setChecklistData] = useState<ChecklistSection>(dikimOncesiDetayConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const savedData = await loadChecklistData('dikim-oncesi-detay');
      
      console.log('DikimOncesiDetayDonem - Loaded data:', savedData);
      console.log('DikimOncesiDetayDonem - Config:', dikimOncesiDetayConfig);
      
      if (savedData) {
        const mergedData = {
          ...dikimOncesiDetayConfig,
          items: dikimOncesiDetayConfig.items.map(configItem => {
            const savedItem = savedData.items.find(item => item.id === configItem.id);
            return savedItem ? { ...configItem, ...savedItem } : configItem;
          })
        };
        console.log('DikimOncesiDetayDonem - Merged data:', mergedData);
        setChecklistData(mergedData);
      } else {
        console.log('DikimOncesiDetayDonem - No saved data, saving config');
        await saveChecklistData('dikim-oncesi-detay', dikimOncesiDetayConfig);
        setChecklistData(dikimOncesiDetayConfig);
      }
      setError(null);
    } catch (err) {
      console.error('DikimOncesiDetayDonem - Error:', err);
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>
  ) => {
    try {
      setChecklistData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, completed, data: data || item.data }
            : item
        )
      }));

      await updateChecklistItem('dikim-oncesi-detay', itemId, completed, data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
      await loadInitialData();
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getCompletionStats = () => {
    const totalItems = checklistData.items.length;
    const completedItems = checklistData.items.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { totalItems, completedItems, percentage };
  };

  const getCategoryStats = () => {
    const categories = {
      preparation: checklistData.items.slice(0, 4),
      analysis: checklistData.items.slice(4, 6),
      control: checklistData.items.slice(6, 9),
      documentation: checklistData.items.slice(9, 11)
    };

    return Object.entries(categories).map(([key, items]) => ({
      key,
      name: getCategoryName(key),
      completed: items.filter(item => item.completed).length,
      total: items.length,
      percentage: Math.round((items.filter(item => item.completed).length / items.length) * 100)
    }));
  };

  const getCategoryName = (key: string) => {
    const names = {
      preparation: 'Hazırlık',
      analysis: 'Analiz & Ölçüm',
      control: 'Kontrol & Mücadele',
      documentation: 'Belgelendirme'
    };
    return names[key as keyof typeof names] || key;
  };

  const stats = getCompletionStats();
  const categoryStats = getCategoryStats();
  
  console.log('DikimOncesiDetayDonem - Current checklistData:', JSON.stringify(checklistData, null, 2));
  console.log('DikimOncesiDetayDonem - Stats:', JSON.stringify(stats, null, 2));
  console.log('DikimOncesiDetayDonem - CategoryStats:', JSON.stringify(categoryStats, null, 2));
  console.log('DikimOncesiDetayDonem - Items count:', checklistData.items?.length);
  console.log('DikimOncesiDetayDonem - First item:', checklistData.items?.[0]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-green-200 rounded-lg w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            🌱 Dikim Öncesi Dönem Detaylı Checklist
          </h1>
          
          {/* Main Progress */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Genel İlerleme</h2>
                <p className="text-green-100">
                  {stats.completedItems}/{stats.totalItems} görev tamamlandı
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold">{stats.percentage}%</div>
              </div>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryStats.map((category) => (
              <div key={category.key} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {category.name}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {category.completed}/{category.total}
                </div>
                <div className="text-xs text-gray-500">
                  %{category.percentage}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Checklist Sections */}
        <div className="grid gap-6">
          {checklistData.items.map((item, index) => {
            const isExpanded = expandedSections.has(item.id);
            const categoryIndex = Math.floor(index / 3);
            const categoryColors = [
              'from-blue-500 to-purple-500',
              'from-green-500 to-teal-500', 
              'from-orange-500 to-red-500',
              'from-purple-500 to-pink-500'
            ];
            
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div 
                  className={`bg-gradient-to-r ${categoryColors[categoryIndex % categoryColors.length]} p-4 md:p-6 cursor-pointer`}
                  onClick={() => toggleSection(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${item.completed ? 'bg-white' : 'bg-transparent'}`}>
                        {item.completed && <span className="text-green-500 text-sm">✓</span>}
                      </div>
                      <h3 className="text-white font-semibold text-lg">
                        {item.label}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.completed && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                          Tamamlandı
                        </span>
                      )}
                      <button className="text-white">
                        <svg 
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-6">
                    <ChecklistItem
                      item={item}
                      onUpdate={handleItemUpdate}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion Badge */}
        {stats.percentage === 100 && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 text-center text-white shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Tebrikler!
            </h2>
            <p className="text-lg opacity-90">
              Dikim öncesi dönem detaylı kontrolleri başarıyla tamamlandı!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DikimOncesiDetayDonem; 