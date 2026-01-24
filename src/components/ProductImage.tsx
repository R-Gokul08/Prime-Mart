import { useState } from 'react';
import { getProductImage, categoryEmojis, getGoogleImageUrl } from '@/lib/productImages';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  name: string;
  category?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProductImage({ name, category, image, size = 'md', className }: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };
  
  const iconSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };
  
  // Try local image first, then Google images
  const localImage = getProductImage(name, category);
  const imageUrl = image || localImage;
  const fallbackImageUrl = !imageUrl ? getGoogleImageUrl(name) : null;
  const fallbackEmoji = category ? categoryEmojis[category] || '🛒' : '🛒';
  
  // Show emoji if both image sources failed
  if ((imageError && (!fallbackImageUrl || fallbackError)) || (!imageUrl && !fallbackImageUrl)) {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          "rounded-xl bg-muted flex items-center justify-center flex-shrink-0",
          className
        )}
      >
        <span className={iconSizeClasses[size]}>{fallbackEmoji}</span>
      </div>
    );
  }
  
  // Use fallback image if primary failed
  const currentImageUrl = imageError && fallbackImageUrl ? fallbackImageUrl : (imageUrl || fallbackImageUrl);
  
  return (
    <div 
      className={cn(
        sizeClasses[size],
        "rounded-xl overflow-hidden flex-shrink-0 relative",
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={currentImageUrl || ''}
        alt={name}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!imageError) {
            setImageError(true);
            setIsLoading(true);
          } else {
            setFallbackError(true);
            setIsLoading(false);
          }
        }}
        loading="lazy"
      />
    </div>
  );
}
