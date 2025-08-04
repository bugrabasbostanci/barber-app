# Font Optimization Guide

## Next.js Font Optimization Implementation

Bu projede `next/font/google` kullanarak Geist font family'si optimize edilmiş şekilde implement edilmiştir.

### Font Configuration (app/layout.tsx)

```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Better font loading performance
  preload: true, // Critical font loaded immediately
  weight: ["300", "400", "500", "600", "700"], // Only needed weights
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",  
  subsets: ["latin"],
  display: "swap",
  preload: false, // Non-critical font loaded later
  weight: ["400", "500"], // Minimal weights for code
});
```

### CSS Variables (app/globals.css)

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

## Typography System

### Available Typography Components

#### Headings
```tsx
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4 } from "@/components/ui/typography"

<TypographyH1>Ana Başlık</TypographyH1>
<TypographyH2>Alt Başlık</TypographyH2>
<TypographyH3>Bölüm Başlığı</TypographyH3>
<TypographyH4>Küçük Başlık</TypographyH4>
```

#### Body Text
```tsx
<TypographyP>Normal paragraf metni</TypographyP>
<TypographyLarge>Büyük metin</TypographyLarge>
<TypographySmall>Küçük metin</TypographySmall>
<TypographyMuted>Soluk metin</TypographyMuted>
<TypographyLead>Giriş metni</TypographyLead>
```

#### Code & Monospace
```tsx
<TypographyCode>console.log('code')</TypographyCode>
<TypographyInlineCode>inline code</TypographyInlineCode>
<AppointmentTime>14:30</AppointmentTime>
<PriceText>₺50</PriceText>
```

#### Barber App Specific
```tsx
<BrandTitle>The Barber Shop</BrandTitle>
<SectionTitle>Hizmetlerimiz</SectionTitle>
<ServiceTitle>Saç Kesimi</ServiceTitle>
```

## Font Usage Best Practices

### 1. Use Semantic Typography Components
```tsx
// ❌ Don't use generic styling
<h1 className="text-4xl font-bold">Title</h1>

// ✅ Use semantic typography components
<TypographyH1>Title</TypographyH1>
<BrandTitle>Brand Title</BrandTitle>
```

### 2. Leverage Font Display Swap
```tsx
// ✅ Already configured in layout.tsx
display: "swap" // Shows fallback font while loading
```

### 3. Preload Critical Fonts Only
```tsx
// ✅ Critical font (used everywhere)
const geistSans = Geist({
  preload: true, // Loaded immediately
});

// ✅ Non-critical font (used sparingly)
const geistMono = Geist_Mono({
  preload: false, // Loaded when needed
});
```

### 4. Load Only Needed Font Weights
```tsx
// ❌ Don't load all weights
weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]

// ✅ Load only needed weights
weight: ["300", "400", "500", "600", "700"] // Based on design requirements
```

### 5. Use Font Variables in CSS
```css
/* ✅ Use CSS variables for consistency */
.custom-text {
  font-family: var(--font-geist-sans);
}

.code-text {
  font-family: var(--font-geist-mono);
}
```

## Font Performance Benefits

### 1. Zero Layout Shift
- Font metrics are known at build time
- No flash of unstyled text (FOUT)
- No flash of invisible text (FOIT)

### 2. Optimized Loading
- `display: swap` ensures text is always visible
- Critical fonts preloaded
- Non-critical fonts loaded on demand

### 3. Reduced Bundle Size
- Only specified weights are loaded
- Automatic subsetting based on usage
- Self-hosted fonts (no external requests)

### 4. Better Core Web Vitals
- Improved Cumulative Layout Shift (CLS)
- Better First Contentful Paint (FCP)
- Optimized Largest Contentful Paint (LCP)

## Font Usage in Barber App

### Brand Typography
```tsx
// Main brand title
<BrandTitle>The Barber Shop</BrandTitle>

// Section headings
<SectionTitle>Randevularım</SectionTitle>
<SectionTitle>Hizmetlerimiz</SectionTitle>
```

### Functional Typography
```tsx
// Time display (monospace for alignment)
<AppointmentTime>14:30</AppointmentTime>
<AppointmentTime>09:45</AppointmentTime>

// Price display
<PriceText>₺45</PriceText>
<PriceText>₺60</PriceText>

// Service titles
<ServiceTitle>Saç Kesimi</ServiceTitle>
<ServiceTitle>Sakal Düzeltme</ServiceTitle>
```

### Form and UI Typography
```tsx
// Regular text
<TypographyP>Randevu detayları burada görünecek.</TypographyP>

// Muted helper text
<TypographyMuted>Randevu saatinden 15 dakika önce gelin.</TypographyMuted>

// Small labels
<TypographySmall>Son güncelleme: 2 saat önce</TypographySmall>
```

## Responsive Typography

### Mobile-First Approach
```tsx
// ✅ Responsive sizing built-in
<TypographyH1 className="text-2xl md:text-4xl lg:text-5xl">
  Responsive Title
</TypographyH1>

// ✅ Brand title with responsive sizing
<BrandTitle className="text-2xl md:text-3xl lg:text-4xl">
  The Barber Shop
</BrandTitle>
```

### Accessibility Considerations
```tsx
// ✅ Good contrast ratios
<TypographyMuted>Subtle text with proper contrast</TypographyMuted>

// ✅ Readable line heights
<TypographyP>Proper line height for readability</TypographyP>

// ✅ Scalable text
// All typography components use rem units for scalability
```

## Font Loading Strategy

1. **Critical Path**: Geist Sans (preloaded, display: swap)
2. **Non-Critical**: Geist Mono (lazy loaded, display: swap)
3. **Fallbacks**: System fonts during loading
4. **Progressive Enhancement**: Enhanced typography after font load

## Measuring Font Performance

### Core Web Vitals Impact
- **CLS**: 0 layout shift with proper font metrics
- **FCP**: Faster with font display swap
- **LCP**: Optimized with preloaded critical fonts

### Performance Monitoring
```typescript
// Monitor font loading performance
if ('fonts' in document) {
  document.fonts.ready.then(() => {
    console.log('All fonts loaded');
  });
}
```

This comprehensive font optimization setup ensures optimal performance, accessibility, and user experience for the barber appointment system.