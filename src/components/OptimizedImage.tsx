import React from 'react';
import { getOptimizedCloudinaryUrl, toCloudinaryFromLocal } from '../utils/cloudinaryDelivery';
import type { CloudinaryOptimizeOptions } from '../utils/cloudinaryDelivery';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  optimize?: CloudinaryOptimizeOptions;
};

const OptimizedImage: React.FC<Props> = ({ src, optimize, ...imgProps }) => {
  const normalized = typeof src === 'string'
    ? (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')
        ? src
        : toCloudinaryFromLocal(src))
    : src;
  const finalSrc = typeof normalized === 'string'
    ? (optimize ? getOptimizedCloudinaryUrl(normalized, optimize) : normalized)
    : normalized;
  // Ensure decoding hint and lazy loading by default
  return (
    <img
      src={finalSrc as string}
      loading={imgProps.loading ?? 'lazy'}
      decoding={(imgProps as any).decoding ?? 'async'}
      {...imgProps}
    />
  );
};

export default OptimizedImage;


