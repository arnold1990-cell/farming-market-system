import { brandAssets } from '../brand';

const BASE_IMAGE_CLASS = 'h-auto w-full max-w-full object-contain';

export default function BrandLogo({
  alt = 'Pula Harvest logo',
  className = '',
  imgClassName = '',
  width = 1360,
  height = 1520,
  priority = false,
  ...rest
}) {
  return (
    <div className={className}>
      <img
        src={brandAssets.logo}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={`${BASE_IMAGE_CLASS} ${imgClassName}`.trim()}
        {...rest}
      />
    </div>
  );
}
