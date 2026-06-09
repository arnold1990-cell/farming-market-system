import { brandAssets } from '../brand';

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
    <div className={`logoCircle ${className}`.trim()}>
      <img
        src={brandAssets.logo}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
        {...rest}
      />
    </div>
  );
}
