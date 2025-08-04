# Image Optimization Guide

## Next.js Image Optimization Setup

Bu projede `next/image` komponenti kullanarak image optimization implement edilmiştir.

### Remote Patterns (next.config.ts)

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "lh3.googleusercontent.com", // Google avatars
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "avatar.vercel.sh", // Demo avatars
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com", // Potential barber shop images
      port: "",
      pathname: "/**",
    },
  ],
  formats: ['image/webp', 'image/avif'], // Modern formats
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  deviceSizes: [640, 768, 1024, 1280, 1920], // Responsive breakpoints
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon sizes
}
```

### Specialized Components

#### 1. OptimizedImage (components/ui/optimized-image.tsx)
Genel kullanım için optimize edilmiş image component:
- Loading skeleton
- Error handling with fallback
- Blur placeholder
- Performance optimizations

```tsx
<OptimizedImage
  src="/images/shop-photo.jpg"
  alt="Barber shop interior"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

#### 2. StaffPhoto
Berber fotoğrafları için özelleştirilmiş component:
- Fallback olarak initials avatar
- Circular crop
- Responsive sizing

```tsx
<StaffPhoto
  src="/images/staff/ahmet.jpg"
  name="Ahmet Yılmaz"
  size={64}
/>
```

#### 3. ShopImage
Dükkan fotoğrafları için optimize edilmiş:
- Yüksek kalite (quality=90)
- Rounded corners
- Object cover

```tsx
<ShopImage
  src="/images/shop-exterior.jpg"
  alt="Barber shop exterior"
  width={600}
  height={400}
/>
```

#### 4. ImageGallery
Çoklu fotoğraf galerisi:
- Grid layout
- Priority loading for first 3 images
- Hover effects

```tsx
<ImageGallery
  images={[
    { id: "1", src: "/images/gallery/1.jpg", alt: "Shop interior" },
    { id: "2", src: "/images/gallery/2.jpg", alt: "Cutting station" },
  ]}
/>
```

## Best Practices

### 1. Always Use next/image
```tsx
// ❌ Don't use img tag
<img src="/photo.jpg" alt="Photo" />

// ✅ Use Next.js Image component
<Image src="/photo.jpg" alt="Photo" width={300} height={200} />
```

### 2. Provide Proper Alt Text
```tsx
// ❌ Generic or empty alt
<Image src="/staff.jpg" alt="" />
<Image src="/staff.jpg" alt="image" />

// ✅ Descriptive alt text
<Image src="/staff.jpg" alt="Ahmet Yılmaz - Master Barber" />
```

### 3. Use Proper Dimensions
```tsx
// ❌ No dimensions (causes layout shift)
<Image src="/photo.jpg" alt="Photo" />

// ✅ Specify dimensions
<Image src="/photo.jpg" alt="Photo" width={300} height={200} />
```

### 4. Optimize for Different Use Cases
```tsx
// Hero images - high priority, high quality
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority={true}
  quality={95}
/>

// Thumbnails - lower quality, smaller size
<Image
  src="/thumb.jpg"
  alt="Thumbnail"
  width={150}
  height={150}
  quality={75}
/>
```

### 5. Use Blur Placeholders
```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

## Potential Use Cases in Barber App

### Staff Photos
- Profile pictures for barbers
- Staff gallery on homepage
- Booking flow staff selection

### Shop Images
- Hero image on homepage
- Gallery section
- Service photos (haircut examples)
- Shop interior/exterior

### Service Images
- Before/after haircut photos
- Service type illustrations
- Style gallery

### User Generated Content
- Customer review photos
- Social media integration
- Portfolio showcase

## File Organization

```
public/
├── images/
│   ├── staff/
│   │   ├── staff-1.jpg
│   │   └── staff-2.jpg
│   ├── gallery/
│   │   ├── shop-1.jpg
│   │   └── shop-2.jpg
│   ├── services/
│   │   ├── haircut-1.jpg
│   │   └── haircut-2.jpg
│   └── placeholder.jpg
```

## Performance Benefits

1. **Automatic Optimization**: WebP/AVIF format conversion
2. **Responsive Loading**: Different sizes for different devices
3. **Lazy Loading**: Images load when needed
4. **Blur Placeholders**: Better perceived performance
5. **CDN Delivery**: Automatic CDN optimization
6. **Cache Control**: Long-term caching for better performance

## Future Enhancements

1. **Image Upload System**: For staff photos and gallery
2. **Dynamic Galleries**: CMS integration for easy management
3. **Image Compression**: Automatic compression on upload
4. **Progressive Enhancement**: Fallbacks for older browsers