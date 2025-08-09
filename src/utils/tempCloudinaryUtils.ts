// Temporary Cloudinary utils without env variables
import { getOptimizedCloudinaryUrl } from './cloudinaryDelivery';
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  error?: {
    message: string;
  };
}

export const uploadToCloudinaryDirect = async (file: File): Promise<string> => {
  try {
    // Create unsigned upload preset first in Cloudinary dashboard
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sera_upload_preset'); // Must be created as unsigned preset
    
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dq93lo9e6/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data: CloudinaryResponse = await response.json();

    if (!response.ok) {
      console.error('Cloudinary error response:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }

    return getOptimizedCloudinaryUrl(data.secure_url);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Fotoğraf yükleme başarısız: ${error.message}`);
    }
    throw new Error('Fotoğraf yükleme başarısız');
  }
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Sadece JPEG, PNG ve WebP formatları desteklenir');
  }

  if (file.size > maxSize) {
    throw new Error('Dosya boyutu 10MB\'dan küçük olmalıdır');
  }

  return true;
}; 