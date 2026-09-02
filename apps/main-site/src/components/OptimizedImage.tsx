import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "placeholder"> {
  /** Force immediate hydration and un-deferred fetch priority */
  isPriority?: boolean;
  /** Disable blur placeholder for small avatars or flat SVGs */
  disableBlur?: boolean;
}

/**
 * High-Performance Master Image Component
 * 
 * Configures:
 * - Next.js responsive srcSet chunking
 * - Non-blocking async multi-threading decoding
 * - Default size hints to prevent Cumulative Layout Shift (CLS)
 * - Premium luxury low-resolution shimmer fallback
 */
const OptimizedImage = ({
  src,
  alt,
  fill,
  sizes,
  priority,
  isPriority,
  disableBlur = false,
  className,
  ...props
}: OptimizedImageProps) => {
  const effectivePriority = priority || isPriority;
  
  // Predictable auto-sizes to minimize payload bandwidth based on layout context
  const defaultSizes = fill
    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    : undefined;

  // Premium ambient low-contrast placeholder (avoids jarring bright flashes)
  const premiumBlurData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/v17PQAJ+wNqRkE/7gAAAABJRU5ErkJggg==";

  // Auto-disable blur on static icons or SVG files
  const isSvgOrStatic = typeof src === "string" && (src.endsWith(".svg") || src.startsWith("data:"));
  const shouldBlur = !disableBlur && !isSvgOrStatic;

  return (
    <Image
      src={src}
      alt={alt || "Hospitality visual representation"}
      fill={fill}
      sizes={sizes || defaultSizes}
      priority={effectivePriority}
      loading={effectivePriority ? undefined : "lazy"}
      decoding={effectivePriority ? "auto" : "async"}
      placeholder={shouldBlur ? "blur" : "empty"}
      blurDataURL={shouldBlur ? premiumBlurData : undefined}
      className={className}
      {...props}
    />
  );
};

export default OptimizedImage;
