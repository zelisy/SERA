import React, { useState } from 'react';

interface MobileCameraButtonProps {
  onPhotoTaken: (file: File) => void;
  onGallerySelect: (files: FileList) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const MobileCameraButton: React.FC<MobileCameraButtonProps> = ({
  onPhotoTaken,
  onGallerySelect,
  multiple = false,
  disabled = false,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = multiple;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        if (multiple) {
          onGallerySelect(files);
        } else {
          onPhotoTaken(files[0]);
        }
      }
    };
    
    input.click();
  };

  const handleGalleryClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = multiple;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        if (multiple) {
          onGallerySelect(files);
        } else {
          onPhotoTaken(files[0]);
        }
      }
    };
    
    input.click();
  };

  // Mobil cihaz kontrolü
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) {
    // Desktop için normal file input
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-400 transition-colors ${className}`}>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              if (multiple) {
                onGallerySelect(files);
              } else {
                onPhotoTaken(files[0]);
              }
            }
          }}
          className="block w-full text-xs lg:text-sm text-gray-500 file:mr-2 lg:file:mr-4 file:py-1.5 lg:file:py-2 file:px-3 lg:file:px-4 file:rounded-lg file:border-0 file:text-xs lg:file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          💻 Bilgisayarda Ctrl/Cmd + tıklayarak çoklu seçim yapabilirsiniz
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Ana buton */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-400 transition-colors bg-white"
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium text-gray-700">
            {multiple ? 'Fotoğraflar Ekle' : 'Fotoğraf Ekle'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          📱 Mobil cihaz için optimize edilmiş
        </p>
      </button>

      {/* Seçenekler dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                handleCameraClick();
                setShowOptions(false);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">📸</span>
              <span className="text-sm font-medium text-gray-700">Kamera ile Çek</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                handleGalleryClick();
                setShowOptions(false);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">🖼️</span>
              <span className="text-sm font-medium text-gray-700">
                {multiple ? 'Galeriden Seç (Çoklu)' : 'Galeriden Seç'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay - dropdown'ı kapatmak için */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};

export default MobileCameraButton; 