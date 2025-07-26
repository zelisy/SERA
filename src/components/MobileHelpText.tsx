import React from 'react';

interface MobileHelpTextProps {
  className?: string;
}

const MobileHelpText: React.FC<MobileHelpTextProps> = ({ className = '' }) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start space-x-2">
        <span className="text-blue-600 text-lg">💡</span>
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Mobil Kullanım İpuçları:</p>
          <ul className="space-y-1">
            <li>• 📸 Kamera ile çekmek için "Kamera ile Çek" seçin</li>
            <li>• 🖼️ Galeriden seçmek için "Galeriden Seç" seçin</li>
            <li>• 👆 Fotoğrafları silmek için fotoğrafa dokunun</li>
            <li>• 📱 Yatay çekim daha iyi sonuç verir</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileHelpText; 