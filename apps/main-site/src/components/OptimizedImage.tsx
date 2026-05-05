import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "placeholder"> {
  isPriority?: boolean;
}

/**
 * Optimized Image Component
 * 
 * Auto-applies:
 * - sizes fallback if fill is used
 * - placeholder="blur" (base64 fallback)
 * - loading="lazy" for non-priority images
 */
const OptimizedImage = ({
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
  ...props
}: OptimizedImageProps) => {
  // Default sizes for grid-like layouts if not provided
  const defaultSizes = fill
    ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes || defaultSizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      placeholder="blur"
      // Standard light gray blur placeholder
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXwMwFcyRowAAAABJRU5ErkJggg=="
      {...props}
    />
  );
};

export default OptimizedImage;
