import React, { useState } from 'react';
// axios kaldırıldı
import { uploadToCloudinaryDirect } from '../utils/tempCloudinaryUtils';
import OptimizedImage from './OptimizedImage';
import ImageLightbox from './ImageLightbox';

const UploadAndPreview = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);

    try {
      const url = await uploadToCloudinaryDirect(file);
      setImageUrl(url);
      setPreview(url);
    } catch (error) {
      console.error('Yükleme hatası:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 md:p-4 space-y-4">
      {/* Styled File Input - More Prominent */}
      <div className="flex flex-col items-center">
        <label className="block w-full max-w-xs md:max-w-sm cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-4 px-6 rounded-2xl text-center text-lg shadow-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 border-4 border-emerald-400">
          📷 Fotoğraf Seç / Yükle
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            className="hidden" 
          />
        </label>
        <p className="text-xs text-gray-500 mt-2 text-center">PNG, JPG, JPEG dosyaları desteklenir</p>
      </div>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-2 text-sm text-gray-600">Yükleniyor...</span>
        </div>
      )}

      {/* Preview Image */}
      {preview && (
        <div className="flex flex-col items-center">
          <button type="button" onClick={() => setModalImg(preview)} className="focus:outline-none">
            <OptimizedImage
              src={preview}
              alt="Yüklenen fotoğraf"
              className="w-full max-w-xs md:w-48 h-auto rounded-lg shadow-lg border-2 border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
              optimize={{ width: 600, crop: 'limit' }}
            />
          </button>
        </div>
      )}

      {/* Uploaded Image */}
      {imageUrl && (
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Yüklenen Görsel:</h3>
          <button type="button" onClick={() => setModalImg(imageUrl)} className="focus:outline-none">
            <OptimizedImage
              src={imageUrl || ''}
              alt="Cloudinary"
              className="w-full max-w-xs md:w-64 h-auto rounded-lg shadow-lg border-2 border-emerald-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
              optimize={{ width: 600, crop: 'limit' }}
            />
          </button>
          <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✅ Başarıyla yüklendi
          </div>
        </div>
      )}

      {/* Modal for large image preview (unified) */}
      <ImageLightbox imageUrl={modalImg} onClose={() => setModalImg(null)} />
    </div>
  );
};

export default UploadAndPreview;
