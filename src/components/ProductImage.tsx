import { useState } from 'react';
import { getProductImage, categoryEmojis } from '@/lib/productImages';
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
  
  const imageUrl = image || getProductImage(name, category);
  const fallbackEmoji = category ? categoryEmojis[category] || '🛒' : '🛒';
  
  if (!imageUrl || imageError) {
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
        src={imageUrl}
        alt={name}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
}
