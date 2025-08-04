import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  className?: string
  fallbackSrc?: string
  showLoader?: boolean
}

export function OptimizedImage({
  className,
  alt,
  fallbackSrc = '/images/placeholder.jpg', // Default fallback
  showLoader = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  if (hasError && fallbackSrc && fallbackSrc !== props.src) {
    return (
      <OptimizedImage
        {...props}
        src={fallbackSrc}
        fallbackSrc={undefined} // Prevent infinite fallback loop
        alt={alt || 'Fallback image'}
        className={className}
        showLoader={false}
      />
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <Image
        {...props}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        // Performance optimizations
        priority={props.priority || false}
        quality={props.quality || 85} // Good balance between quality and file size
        placeholder={props.placeholder || 'blur'}
        blurDataURL={props.blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='}
      />
    </div>
  )
}

// Specialized components for common use cases in barber app

export function StaffPhoto({
  src,
  name,
  size = 64,
  className,
  ...props
}: {
  src?: string
  name: string
  size?: number
  className?: string
} & Partial<ImageProps>) {
  if (!src) {
    // Fallback to initials avatar
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    return (
      <div 
        className={cn(
          'bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold',
          className
        )}
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={`${name} fotoğrafı`}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      {...props}
    />
  )
}

export function ShopImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  ...props
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
} & Partial<ImageProps>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-lg object-cover', className)}
      quality={90} // Higher quality for hero images
      {...props}
    />
  )
}

// Gallery component for multiple shop images
export function ImageGallery({ 
  images, 
  className 
}: { 
  images: Array<{ src: string; alt: string; id: string }>
  className?: string 
}) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      {images.map((image, index) => (
        <ShopImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          width={300}
          height={200}
          className="aspect-[3/2] hover:opacity-90 transition-opacity cursor-pointer"
          priority={index < 3} // Prioritize first 3 images
        />
      ))}
    </div>
  )
}