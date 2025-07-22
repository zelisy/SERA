import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';
import { dikimOncesiConfig } from '../data/dikimOncesiConfig';
import { loadChecklistData, updateChecklistItem, saveChecklistData } from '../utils/firestoreUtils';
import type { ChecklistSection } from '../types/checklist';

const DikimOncesiDonem: React.FC = () => {
  const [checklistData, setChecklistData] = useState<ChecklistSection>(dikimOncesiConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const savedData = await loadChecklistData('dikim-oncesi');
      
      if (savedData) {
        // Merge saved data with config to ensure new fields are included
        const mergedData = {
          ...dikimOncesiConfig,
          items: dikimOncesiConfig.items.map(configItem => {
            const savedItem = savedData.items.find(item => item.id === configItem.id);
            return savedItem ? { ...configItem, ...savedItem } : configItem;
          })
        };
        setChecklistData(mergedData);
      } else {
        // Save initial config if no saved data exists
        await saveChecklistData('dikim-oncesi', dikimOncesiConfig);
        setChecklistData(dikimOncesiConfig);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = async (
    itemId: string, 
    completed: boolean, 
    data?: Record<string, string | number | boolean | string[]>
  ) => {
    try {
      // Update local state immediately for better UX
      setChecklistData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, completed, data: data || item.data }
            : item
        )
      }));

      // Update in Firebase
      await updateChecklistItem('dikim-oncesi', itemId, completed, data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
      // Revert local state on error
      await loadInitialData();
    }
  };

  const getCompletionStats = () => {
    const totalItems = checklistData.items.length;
    const completedItems = checklistData.items.filter(item => item.completed).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { totalItems, completedItems, percentage };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ color: '#228B22', marginBottom: 20 }}>Dikim Öncesi Dönem</h2>
        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          padding: '24px', 
          textAlign: 'center',
          color: '#666'
        }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#228B22', marginBottom: 16 }}>Dikim Öncesi Dönem</h2>
        
        {/* Progress Bar */}
        <div style={{ 
          background: '#f0f0f0', 
          borderRadius: '12px', 
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontWeight: '500', color: '#333' }}>
              İlerleme: {stats.completedItems}/{stats.totalItems} görev tamamlandı
            </span>
            <span style={{ 
              fontWeight: '600', 
              color: stats.percentage === 100 ? '#228B22' : '#666',
              fontSize: '18px'
            }}>
              %{stats.percentage}
            </span>
          </div>
          <div style={{ 
            background: '#e0e0e0', 
            borderRadius: '6px', 
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: `linear-gradient(90deg, #228B22 0%, ${stats.percentage === 100 ? '#32CD32' : '#228B22'} 100%)`,
              height: '100%',
              width: `${stats.percentage}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '12px', 
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #fcc'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
        padding: '24px'
      }}>
        {checklistData.items.map(item => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={handleItemUpdate}
          />
        ))}
      </div>

      {/* Completion Badge */}
      {stats.percentage === 100 && (
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, #228B22, #32CD32)',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(34, 139, 34, 0.3)'
        }}>
          🎉 Tebrikler! Dikim öncesi dönem kontrolleri tamamlandı!
        </div>
      )}
    </div>
  );
};

export default DikimOncesiDonem; 