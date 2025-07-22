import React, { useState } from 'react';
import axios from 'axios';

const UploadAndPreview = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setPreview(URL.createObjectURL(file)); 

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
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={handleUpload} />
      {preview && <img src={preview} alt="Preview" className="w-48 mt-4" />}
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Yüklenen görsel:</p>
          <img src={imageUrl} alt="Cloudinary" className="w-64" />
        </div>
      )}
    </div>
  );
};

export default UploadAndPreview;
