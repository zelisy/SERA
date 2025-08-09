import React from 'react';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinaryDelivery';
import type { CloudinaryOptimizeOptions } from '../utils/cloudinaryDelivery';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  optimize?: CloudinaryOptimizeOptions;
};

const OptimizedImage: React.FC<Props> = ({ src, optimize, ...imgProps }) => {
  const finalSrc = typeof src === 'string' ? getOptimizedCloudinaryUrl(src, optimize) : src;
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


