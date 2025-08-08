# Berber Randevu Sistemi 💈

Türk berberleri için tasarlanmış modern randevu yönetim sistemi. Müşteriler online randevu alabilir, berberler tüm randevularını kolayca yönetebilir.

## 🚀 Özellikler

### Müşteri Paneli
- **Online Randevu Alma**: Uygun saatleri görüntüle ve randevu al
- **Randevu Yönetimi**: Randevularını görüntüle ve iptal et
- **Profil Yönetimi**: Kişisel bilgileri güncelle

### Berber Paneli
- **Randevu Takvimi**: Tüm randevuları tek ekranda görüntüle
- **Manuel Randevu**: Telefonla gelen randevuları sisteme ekle
- **Zaman Blokları**: Müsait olmadığın saatleri blokla
- **Müşteri Yönetimi**: Müşteri bilgilerini görüntüle

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 15.4.4 (App Router)
- **Dil**: TypeScript
- **Veritabanı**: PostgreSQL + Prisma ORM
- **Kimlik Doğrulama**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Doğrulama**: Zod

## 📋 İş Kuralları

- **Çalışma Saatleri**: 09:30 - 21:30 (Pazartesi-Cumartesi)
- **Randevu Süresi**: 45 dakika
- **Kapalı Günler**: Pazar günleri
- **Rezervasyon**: 7 gün önceden randevu alınabilir
- **İptal**: Randevudan 2 saat öncesine kadar iptal edilebilir

## 🚦 Kurulum

1. **Proje klonlama**:
```bash
git clone [repository-url]
cd barber-app
```

2. **Bağımlılıkları yükleme**:
```bash
npm install
```

3. **Ortam değişkenlerini ayarlama**:
```bash
cp .env.example .env
# .env dosyasını düzenle
```

4. **Veritabanını başlatma**:
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Development server'ı çalıştırma**:
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## 📁 Proje Yapısı

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── barber/            # Barber dashboard
│   └── (customer)/        # Customer pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── barber/           # Barber specific components
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase clients
│   └── middleware/       # API middleware
├── prisma/               # Database schema
└── docs/                 # Documentation (gitignored)
```

## 🧪 Development

```bash
# Development server
npm run dev

# Lint kontrol
npm run lint

# TypeScript kontrol
npx tsc --noEmit

# Production build
npm run build

# Production server
npm start
```

## 🔐 Güvenlik

- Supabase Auth ile güvenli kimlik doğrulama
- Row Level Security (RLS) politikaları
- API route'ları için middleware koruması
- CSRF koruma altyapısı (isteğe bağlı aktive edilebilir)

## 📈 Durum

**Durum**: MVP Geliştirme Aşaması
**Dal**: `barber-ux-improvement`

## 🤝 Katkıda Bulunma

Bu proje aktif geliştirme aşamasındadır. Katkıda bulunmak için:

1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📄 Lisans

Bu proje özel lisans altındadır.
