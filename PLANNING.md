# PLANNING.md

Bu dosya berber randevu yönetim sistemi projesinin geliştirme planını içerir.

## 📋 Proje Özeti

Berber salonları için dijital randevu yönetim platformu. Müşteriler online randevu alabilir, berberler randevularını yönetebilir.

## 🎯 MVP Hedefleri

### Temel İş Kuralları

- **Çalışma saatleri**: 09:30 - 21:30
- **Randevu süresi**: Sabit 45 dakika
- **Kapalı gün**: Pazar
- **Rezervasyon süresi**: 7 gün öncesinden
- **İptal sınırı**: Randevudan 2 saat önce

## 🗄️ Database Şeması

### Ana Tablolar (Güncel Schema)

```prisma
// User - Tüm kullanıcı türleri (müşteri, çalışan, berber, admin)
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  phone     String?
  role      Role
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // İlişkiler
  customerAppointments Appointment[]             @relation("CustomerAppointments")
  staffAppointments    Appointment[]             @relation("StaffAppointments")
  createdAppointments  Appointment[]             @relation("CreatedAppointments")
  unavailableTimes     EmployeeUnavailableTime[] @relation("StaffUnavailableTimes")

  @@map("users")
}

// Appointment - Randevular
model Appointment {
  id          String            @id @default(uuid()) @db.Uuid
  shopId      String            @db.Uuid
  customerId  String?           @db.Uuid  // Optional for manual appointments
  staffId     String            @db.Uuid
  date        DateTime          @db.Date
  startTime   DateTime          @db.Time
  endTime     DateTime          @db.Time
  status      AppointmentStatus @default(SCHEDULED)
  notes       String?
  createdById String?           @db.Uuid
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Manuel randevular için (sistemde kayıtlı olmayan müşteriler)
  manualCustomerName  String?
  manualCustomerPhone String?

  // İlişkiler
  shop      Shop  @relation(fields: [shopId], references: [id])
  customer  User? @relation("CustomerAppointments", fields: [customerId], references: [id])
  staff     User  @relation("StaffAppointments", fields: [staffId], references: [id])
  createdBy User? @relation("CreatedAppointments", fields: [createdById], references: [id])

  @@unique([staffId, date, startTime])
  @@map("appointments")
}

// EmployeeUnavailableTime - Çalışan müsaitlik durumu
model EmployeeUnavailableTime {
  id        String    @id @default(uuid()) @db.Uuid
  staffId   String    @db.Uuid
  date      DateTime  @db.Date
  startTime DateTime? @db.Time  // null = tüm gün kapalı
  endTime   DateTime? @db.Time  // null = tüm gün kapalı
  reason    String?
  createdAt DateTime  @default(now())

  // İlişki
  staff User @relation("StaffUnavailableTimes", fields: [staffId], references: [id])

  @@map("employee_unavailable_times")
}

// Shop - Salon bilgileri (gelecek için hazır)
model Shop {
  id          String        @id @default(uuid()) @db.Uuid
  name        String
  slug        String        @unique
  description String
  address     String
  isActive    Boolean       @default(true) @map("is_active")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  appointments Appointment[]

  @@map("shops")
}

// Enums
enum Role {
  CUSTOMER  // Müşteri
  EMPLOYEE  // Çalışan
  BARBER    // Berber (salon sahibi)
  ADMIN     // Sistem yöneticisi
}

enum AppointmentStatus {
  SCHEDULED  // Yeni oluşturulan
  CONFIRMED  // Onaylanmış
  COMPLETED  // Tamamlanmış
  CANCELLED  // İptal edilmiş
  NO_SHOW    // Gelmedi
}
```

### Schema Özellikleri

**✅ MVP için Hazır:**

- **Manuel randevu desteği**: `manualCustomerName/Phone` alanları
- **Esnek kullanıcı sistemi**: Tek `User` tablosu, rol bazlı yetkilendirme
- **Zaman bloklama**: `EmployeeUnavailableTime` ile
- **Çakışma önleme**: `@@unique([staffId, date, startTime])`
- **Audit trail**: `createdBy` ile kim oluşturdu takibi

**🔮 Gelecek için Hazır:**

- **Multi-shop desteği**: `Shop` tablosu entegre
- **Gelişmiş durumlar**: 5 farklı appointment status
- **UUID kullanımı**: Güvenlik ve performans için

## 🔐 Kimlik Doğrulama Akışı

### Müşteri Kaydı/Girişi

1. **Supabase Auth** ile e-posta/şifre
2. Kullanıcı profili `User` tablosuna kaydedilir
3. Rol otomatik `CUSTOMER` olarak atanır

### Berber Girişi

1. Özel e-posta ile kayıt
2. Rol manuel olarak `BARBER` yapılır
3. Yönetici paneline erişim

## 📱 Sayfa Yapısı

### Müşteri Sayfaları

```
/ (Anasayfa)
├── /auth/login
├── /auth/register
├── /book-appointment
│   ├── 1. Tarih seçimi
│   ├── 2. Personel seçimi
│   ├── 3. Saat seçimi
│   └── 4. Onay
├── /my-appointments
└── /profile
```

### Berber Yönetim Paneli

```
/admin (Dashboard)
├── /admin/calendar
│   ├── Günlük görünüm
│   ├── Haftalık görünüm
│   └── Aylık görünüm
├── /admin/appointments
│   ├── Yeni randevu oluştur
│   ├── Randevu düzenle
│   └── Randevu iptali
├── /admin/schedule
│   ├── Zaman blokla
│   └── Çalışma saatleri
└── /admin/staff (gelecek sürüm)
```

## 🧩 Bileşen Mimarisi

### UI Bileşenleri (shadcn/ui basis)

```
components/
├── ui/ (shadcn/ui bileşenleri)
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── form.tsx
│   ├── input.tsx
│   └── ...
├── appointment/
│   ├── AppointmentCard.tsx
│   ├── BookingFlow.tsx
│   ├── TimeSlotPicker.tsx
│   └── StaffSelector.tsx
├── calendar/
│   ├── AdminCalendar.tsx
│   ├── CalendarView.tsx
│   └── AppointmentModal.tsx
└── auth/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    └── AuthGuard.tsx
```

## 🚀 Geliştirme Aşamaları

### Faz 1: Temel Altyapı (1-2 hafta)

- [x] Database schema oluştur ve migrate et
- [x] Supabase authentication kurulumu
- [x] Temel sayfa routing'i
- [x] shadcn/ui bileşenlerini entegre et

### Faz 2: Müşteri Özellikleri (2-3 hafta)

- [x] Kullanıcı kaydı/girişi
- [x] Randevu oluşturma akışı
- [x] Randevularım sayfası
- [ ] Randevu iptali fonksiyonu

### Faz 3: Berber Paneli (2-3 hafta)

- [ ] Admin dashboard
- [ ] Takvim görünümleri (günlük/haftalık/aylık)
- [ ] Manuel randevu oluşturma
- [ ] Zaman bloklama sistemi

### Faz 4: Test ve Optimizasyon (1 hafta)

- [ ] E2E testler
- [ ] Performance optimizasyonu
- [ ] Responsive tasarım iyileştirmeleri
- [ ] Production deployment

## 🔮 Gelecek Sürüm Özellikleri

### Faz 5: Gelişmiş Özellikler

- [ ] Otomatik SMS/WhatsApp bildirimleri
- [ ] Online ödeme entegrasyonu
- [ ] Çoklu hizmet türleri ve fiyatlandırma
- [ ] Çalışan yönetimi ve kendi panelleri
- [ ] Detaylı raporlama ve analytics
- [ ] Mobil uygulama (React Native)

## 📊 Teknik Gereksinimler

### Performans

- Sayfa yükleme süresi < 2 saniye
- Responsive tasarım (mobile-first)
- SEO optimizasyonu

### Güvenlik

- Input validasyonu (Zod)
- SQL injection koruması (Prisma)
- Rate limiting
- HTTPS zorunluluğu

### Monitoring

- Error tracking
- Performance monitoring
- User analytics

## 🧪 Test Stratejisi

### Unit Tests

- Utility fonksiyonları
- Business logic
- Validation schemas

### Integration Tests

- API endpoints
- Database operations
- Authentication flow

### E2E Tests

- Randevu oluşturma akışı
- Berber panel işlemleri
- Kritik user journeys

## 📝 Notlar

- **Dil**: Türkçe UI, İngilizce kod
- **Timezone**: Turkey (UTC+3)
- **Currency**: TRY (gelecek ödemeler için)
- **Business Hours**: 09:30-21:30 (fixed)
- **Appointment Duration**: 45 min (fixed for MVP)
