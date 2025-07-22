interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dq93lo9e6';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sera_upload_preset';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'sera'); // Organize uploads in folders

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
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