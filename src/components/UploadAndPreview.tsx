import React, { useState } from 'react';
import axios from 'axios';

const UploadAndPreview = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      {/* Styled File Input */}
      <div className="flex flex-col items-center">
        <label className="block w-full max-w-xs md:max-w-sm cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-center hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          📷 Fotoğraf Seç
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
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full max-w-xs md:w-48 h-auto rounded-lg shadow-lg border-2 border-gray-200" 
          />
        </div>
      )}

      {/* Uploaded Image */}
      {imageUrl && (
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Yüklenen Görsel:</h3>
          <img 
            src={imageUrl} 
            alt="Cloudinary" 
            className="w-full max-w-xs md:w-64 h-auto rounded-lg shadow-lg border-2 border-emerald-200" 
          />
          <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✅ Başarıyla yüklendi
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadAndPreview;
