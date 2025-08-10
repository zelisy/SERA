export type CloudinaryOptimizeOptions = {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'thumb' | 'auto' | string;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif' | string;
  dpr?: 'auto' | number;
};

const CLOUDINARY_HOST = 'res.cloudinary.com';
const FALLBACK_CLOUD_NAME = import.meta?.env?.VITE_CLOUDINARY_CLOUD_NAME || '';

// Convert local asset path to Cloudinary delivery URL if configured
export function toCloudinaryFromLocal(localPath: string): string {
  if (!FALLBACK_CLOUD_NAME) return localPath;
  // Expect assets like /assets/arkaplan1.jpg or relative '.../assets/arkaplan1.jpg'
  const filename = localPath.split('/').pop() || localPath;
  return `https://${CLOUDINARY_HOST}/${FALLBACK_CLOUD_NAME}/image/upload/${filename}`;
}

/**
 * Inserts Cloudinary delivery transformations (f_auto,q_auto,dpr_auto,c_limit,w_...) into a Cloudinary URL.
 * If the URL is not a Cloudinary upload URL, returns it unchanged.
 */
export function getOptimizedCloudinaryUrl(
  originalUrl: string,
  options: CloudinaryOptimizeOptions = {}
): string {
  try {
    if (!originalUrl) return originalUrl;

    const url = new URL(originalUrl);
    if (!url.hostname.includes(CLOUDINARY_HOST)) return originalUrl;

    // Only handle image upload URLs
    const uploadMarker = '/image/upload/';
    const path = url.pathname;
    const idx = path.indexOf(uploadMarker);
    if (idx === -1) return originalUrl;

    const before = path.slice(0, idx + uploadMarker.length); // includes '/image/upload/'
    const after = path.slice(idx + uploadMarker.length); // may already contain transformations or version/publicId

    // Build desired transformation string
    const desired = buildTransformationString(options);

    // If there are already transformations present (a segment without leading 'v' and without folder),
    // we try to merge by prefixing the desired ones that are missing.
    // Heuristic: Cloudinary version starts with 'v' followed by digits.
    const parts = after.split('/');
    const firstSegment = parts[0] || '';
    const hasExistingTransform = firstSegment && !/^v\d+/.test(firstSegment);

    let finalAfter = '';
    if (hasExistingTransform) {
      // Merge transformations: avoid duplicates like f_auto or q_auto
      const existing = firstSegment.split(',');
      const desiredParts = desired ? desired.split(',') : [];
      const merged = mergeTransforms(existing, desiredParts);
      parts[0] = merged.join(',');
      finalAfter = parts.join('/');
    } else {
      finalAfter = desired ? `${desired}/${after}` : after;
    }

    url.pathname = `${before}${finalAfter}`;
    return url.toString();
  } catch {
    return originalUrl;
  }
}

function buildTransformationString(options: CloudinaryOptimizeOptions): string {
  const transforms: string[] = [];

  // Always prefer automatic format/quality/dpr unless overridden
  const format = options.format ?? 'auto';
  const quality = options.quality ?? 'auto';
  const dpr = options.dpr ?? 'auto';
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (dpr) transforms.push(`dpr_${dpr}`);

  const crop = options.crop;
  const width = options.width;
  const height = options.height;

  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  return transforms.join(',');
}

function mergeTransforms(existing: string[], desired: string[]): string[] {
  const existingKeys = new Set(existing.map(keyOfTransform));
  const merged = existing.slice();
  for (const d of desired) {
    const key = keyOfTransform(d);
    if (!existingKeys.has(key)) {
      merged.unshift(d); // prepend desired for priority
      existingKeys.add(key);
    }
  }
  return merged;
}

function keyOfTransform(t: string): string {
  // f_auto -> f, q_auto -> q, dpr_auto -> dpr, c_limit -> c, w_1200 -> w, h_800 -> h
  const idx = t.indexOf('_');
  return idx === -1 ? t : t.slice(0, idx);
}


