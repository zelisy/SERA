// Temporary Cloudinary utils with env variables
import { getOptimizedCloudinaryUrl } from './cloudinaryDelivery';
const CLOUD_NAME = (import.meta as any)?.env?.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = (import.meta as any)?.env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'sera_upload_preset';
const DEFAULT_FOLDER = (import.meta as any)?.env?.VITE_CLOUDINARY_FOLDER || 'agrovia';
const UPLOAD_URL = CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  : 'https://api.cloudinary.com/v1_1/dq93lo9e6/image/upload';
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  error?: {
    message: string;
  };
}

// Downscale and compress image on the client before uploading to Cloudinary
const downscaleImage = async (
  file: File,
  maxDimension = 1600,
  preferredMime: 'image/webp' | 'image/jpeg' = 'image/webp',
  quality = 0.8
): Promise<Blob | null> => {
  // Skip tiny images
  if (file.size <= 300 * 1024) return file;

  const bitmap = await createImageBitmap(file).catch(async () => {
    // Fallback for older browsers
    return new Promise<ImageBitmap | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // @ts-ignore
        resolve(createImageBitmap ? createImageBitmap(img as any) : null);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  });

  if (!bitmap) return null;

  const { width, height } = bitmap;
  const ratio = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.round(width * ratio);
  const targetH = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  // Try WebP first, then JPEG fallback
  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      preferredMime,
      quality
    );
  });

  if (blob) return blob;

  const jpegBlob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
  });
  return jpegBlob;
};

export const uploadToCloudinaryDirect = async (file: File): Promise<string> => {
  try {
    // Client-side compress to reduce Cloudinary storage
    const compressed = await downscaleImage(file);
    const uploadBlob = compressed || file;
    const filename = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '') + (compressed ? '.webp' : file.name.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg');

    const formData = new FormData();
    formData.append('file', new File([uploadBlob], filename, { type: (compressed ? 'image/webp' : file.type) || 'image/jpeg' }));
    formData.append('upload_preset', UPLOAD_PRESET); // unsigned preset
    // Note: For unsigned uploads, avoid sending unsupported params like use_filename/unique_filename
    // Optional: organize files in a folder (allowed for unsigned presets)
    formData.append('folder', DEFAULT_FOLDER);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

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