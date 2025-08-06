import React from 'react';

interface PlantControlButtonProps {
  onClick: () => void;
  isCompleted?: boolean;
}

const PlantControlButton: React.FC<PlantControlButtonProps> = ({ onClick, isCompleted = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isCompleted
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600'
      }`}
    >
      {isCompleted ? '✅ Bitki Kontrolü Tamamlandı' : '🌱 Bitki Kontrolü Başlat'}
    </button>
  );
};

export default PlantControlButton; 