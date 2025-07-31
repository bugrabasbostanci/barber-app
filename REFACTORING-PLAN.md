# Refactoring ve Kalite İyileştirme Planı

Bu doküman, Turkish Barber Appointment Management System projesinin kod kalitesini ve verimliliğini artırmak için hazırlanmış kapsamlı bir refactoring planıdır.

## 📊 Mevcut Durum Analizi

### Kritik Sorunlar
- **calendar-view.tsx**: 946 satır (En büyük bileşen)
- **book-appointment/page.tsx**: 892 satır (Booking flow)
- **sidebar.tsx**: 726 satır (UI bileşeni)
- **profile/page.tsx**: 568 satır
- **my-appointments/page.tsx**: 534 satır

### Teknik Borçlar
1. **Single Responsibility Principle İhlalleri**: Büyük bileşenler çok fazla sorumluluk alıyor
2. **Kod Tekrarları**: API çağrıları, form validasyonları, error handling
3. **Mixed Concerns**: UI, business logic ve data fetching karışık
4. **Props Drilling**: State'ler çok katmanlı geçiliyor
5. **Performance Sorunları**: Büyük bundle size, gereksiz re-render'lar

## 🎯 İyileştirme Planı

## Faz 1: Acil Müdahale (1-2 hafta)

### 1.1 Büyük Bileşenleri Parçalama

#### Calendar View Refactoring
```
components/calendar/
├── CalendarView.tsx          (Ana koordinatör bileşen)
├── CalendarHeader.tsx        (Navigasyon ve view seçimi)
├── DayView.tsx              (Günlük görünüm)
├── WeekView.tsx             (Haftalık görünüm)
├── MonthView.tsx            (Aylık görünüm)
├── AppointmentModal.tsx     (Randevu detay modal)
└── AppointmentCard.tsx      (Randevu kartı)
```

**Hedef**: 946 satırlık dosyayı 7 dosyaya böl (~135 satır/dosya)

#### Booking Flow Refactoring
```
components/booking/
├── BookingWizard.tsx        (Ana flow coordinator)
├── DateSelection.tsx        (Tarih seçimi - ~150 satır)
├── StaffSelection.tsx       (Personel seçimi - ~100 satır)
├── TimeSelection.tsx        (Saat seçimi - ~200 satır)
├── BookingConfirmation.tsx  (Onay ekranı - ~90 satır)
├── CustomerInfo.tsx         (Müşteri bilgileri)
└── BookingSummary.tsx       (Özet bileşeni)
```

**Hedef**: 892 satırlık dosyayı 7 dosyaya böl (~127 satır/dosya)

### 1.2 Ortak Kodları Ayırma

#### Custom Hooks Oluşturma
```
hooks/
├── useAppointments.ts       (Randevu CRUD operasyonları)
├── useApiCall.ts           (Generic API call hook)
├── useFormValidation.ts    (Form validation logic)
├── useAuth.ts              (Mevcut auth hook'u iyileştir)
├── useCalendar.ts          (Takvim state management)
└── useBookingFlow.ts       (Booking state management)
```

#### Service Layer Oluşturma
```
services/
├── appointmentService.ts    (Randevu business logic)
├── userService.ts          (Kullanıcı işlemleri)
├── calendarService.ts      (Takvim hesaplamaları)
├── validationService.ts    (Tüm validasyonlar)
├── notificationService.ts  (Email/SMS bildirimleri)
└── dateService.ts          (Tarih işlemleri)
```

## Faz 2: Yapısal İyileştirmeler (2-3 hafta)

### 2.1 State Management Ekleme

#### React Query/TanStack Query Integration
```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// hooks/queries/
├── useAppointmentQueries.ts
├── useUserQueries.ts
├── useStaffQueries.ts
└── useCalendarQueries.ts
```

**Faydalar**:
- API response caching
- Background data fetching
- Optimistic updates
- Error/loading state management

#### Global State Management (Zustand)
```typescript
// stores/
├── authStore.ts            (Kullanıcı authentication)
├── appointmentStore.ts     (Aktif randevu bilgileri)
├── uiStore.ts             (Modal, sidebar state)
└── calendarStore.ts       (Takvim görünüm state)
```

### 2.2 Type Safety Artırma

#### Centralized Type Definitions
```
types/
├── api.ts                  (API request/response types)
├── entities.ts            (Database entity types)
├── components.ts          (Component prop types)
├── forms.ts               (Form validation types)
└── index.ts               (Type exports)
```

#### Zod Schema Validation
```
lib/validations/
├── appointmentSchemas.ts
├── userSchemas.ts
├── bookingSchemas.ts
└── index.ts
```

### 2.3 Error Handling Standardizasyonu

```
lib/
├── errorHandler.ts         (Centralized error handling)
├── logger.ts              (Structured logging)
├── apiClient.ts           (Axios instance with interceptors)
└── notifications.ts       (Toast/alert system)
```

## Faz 3: Performance Optimizasyonu (1-2 hafta)

### 3.1 Code Splitting ve Lazy Loading

```typescript
// Lazy load büyük bileşenler
const CalendarView = lazy(() => import('@/components/calendar/CalendarView'))
const BookingWizard = lazy(() => import('@/components/booking/BookingWizard'))

// Route-based splitting
const AdminDashboard = lazy(() => import('@/app/barber/dashboard/page'))
```

### 3.2 Bundle Optimization

```javascript
// next.config.js optimizasyonları
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*']
  },
  webpack: (config) => {
    // Bundle analyzer
    // Tree shaking optimizations
  }
}
```

### 3.3 Caching Strategy

```
lib/cache/
├── queryKeys.ts           (React Query key factory)
├── cacheConfig.ts         (Cache TTL configurations)
└── invalidation.ts        (Cache invalidation patterns)
```

## Faz 4: Developer Experience (1 hafta)

### 4.1 Code Quality Tools

#### Husky + Lint-staged Setup
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

#### ESLint Strict Rules
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'max-lines': ['error', 200],
    'max-lines-per-function': ['error', 50],
    'complexity': ['error', 10]
  }
}
```

### 4.2 Documentation

```
docs/
├── COMPONENT-GUIDELINES.md
├── API-DOCUMENTATION.md
├── DEPLOYMENT.md
└── CONTRIBUTING.md
```

### 4.3 Testing Setup

```
tests/
├── __mocks__/
├── components/
├── hooks/
├── services/
└── utils/
```

## 📅 Uygulama Takvimi

### Sprint 1 (Hafta 1-2): Critical Refactoring
- [ ] Calendar view bileşenini parçala
- [ ] Booking flow'u yeniden yapılandır
- [ ] Temel service layer oluştur
- [ ] Custom hooks yaz

### Sprint 2 (Hafta 3-4): Architecture
- [ ] React Query entegrasyonu
- [ ] Global state management
- [ ] Type definitions centralize et
- [ ] Error handling standardize et

### Sprint 3 (Hafta 5-6): Performance
- [ ] Code splitting uygula
- [ ] Bundle optimization
- [ ] Caching strategy
- [ ] Performance monitoring

### Sprint 4 (Hafta 7): Developer Experience
- [ ] Linting ve formatting setup
- [ ] Documentation
- [ ] Testing framework
- [ ] CI/CD pipeline

## 🎯 Başarı Metrikleri

### Kod Kalitesi
- [ ] En büyük dosya <300 satır
- [ ] Ortalama fonksiyon uzunluğu <50 satır
- [ ] Code duplication %5'in altında
- [ ] TypeScript strict mode compliance %100

### Performance
- [ ] Bundle size %30 azalma
- [ ] First Contentful Paint <2s
- [ ] Largest Contentful Paint <4s
- [ ] Time to Interactive <5s

### Developer Experience
- [ ] Build time %50 azalma
- [ ] Hot reload <1s
- [ ] ESLint/TypeScript error sayısı 0
- [ ] Test coverage >80%

## 🚀 Hızlı Başlangıç

### Faz 1'i Başlatmak İçin:

1. **Calendar bileşenini parçala:**
   ```bash
   mkdir -p components/calendar
   # calendar-view.tsx'i böl
   ```

2. **Booking flow'u ayır:**
   ```bash
   mkdir -p components/booking
   # book-appointment/page.tsx'i böl
   ```

3. **Service layer oluştur:**
   ```bash
   mkdir -p services hooks
   # Ortak kodları ayır
   ```

## 🔄 Sürekli İyileştirme

Bu plan tamamlandıktan sonra:
- Aylık kod review
- Performance monitoring
- Bundle size tracking
- Developer satisfaction survey
- Yeni özellik ekleme best practices

---

**Not**: Bu plan aşamalı olarak uygulanmalı. Her faz tamamlandıktan sonra testler çalıştırılmalı ve production deploy edilmeli.