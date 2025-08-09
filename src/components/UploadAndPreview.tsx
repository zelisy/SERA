import React, { useState } from 'react';
import axios from 'axios';
import OptimizedImage from './OptimizedImage';

const UploadAndPreview = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setPreview(URL.createObjectURL(file)); 
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'my_preset'); 

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dq93lo9e6/image/upload', 
        formData
      );
      setImageUrl(response.data.secure_url);
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
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Önizleme:</h3>
          <button type="button" onClick={() => setModalImg(preview)} className="focus:outline-none">
            <OptimizedImage
              src={preview}
              alt="Preview"
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

      {/* Modal for large image preview */}
      {modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setModalImg(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <OptimizedImage src={modalImg || ''} alt="Büyük Önizleme" className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border-4 border-white" optimize={{ width: 1600, height: 1200, crop: 'limit' }} />
            <button
              type="button"
              onClick={() => setModalImg(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadAndPreview;
