# Barber Appointment System 💈

Modern appointment management system designed for barbers. Customers can book appointments online, and barbers can easily manage all their appointments.

## 🚀 Features

### Customer Panel

- **Online Booking**: View available time slots and book appointments
- **Appointment Management**: View and cancel appointments
- **Profile Management**: Update personal information

### Barber Panel

- **Appointment Calendar**: View all appointments on a single screen
- **Manual Appointments**: Add phone bookings to the system
- **Time Blocks**: Block unavailable time slots
- **Customer Management**: View customer information

## 🛠️ Technology Stack

- **Framework**: Next.js 15.4.4 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod

## 📋 Business Rules

- **Working Hours**: 09:30 - 21:30 (Monday-Saturday)
- **Appointment Duration**: 45 minutes
- **Closed Days**: Sundays
- **Booking Window**: Appointments can be booked 7 days in advance
- **Cancellation**: Appointments can be canceled up to 2 hours before

## 🚦 Installation

1. **Clone the project**:

```bash
git clone [repository-url]
cd barber-app
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

```bash
cp .env.example .env
# Edit the .env file
```

4. **Initialize the database**:

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

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

# Lint check
npm run lint

# TypeScript check
npx tsc --noEmit

# Production build
npm run build

# Production server
npm start
```

## 🔐 Security

- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- Middleware protection for API routes
- CSRF protection infrastructure (can be activated optionally)
- Rate limiting (Redis required in production)
- CORS protection

## 🚨 Production Deployment Checklist

**⚠️ Essential tasks before production deployment:**

### Critical (Must Do)

- [ ] **Update CORS Origins**: Add production domains in `lib/middleware/cors.ts`
  ```typescript
  // Replace these lines with your actual domains:
  // 'https://barber-appointments.com',
  // 'https://www.barber-appointments.com'
  ```
- [ ] **Rate Limiting**: Add Redis implementation (currently in-memory)
- [ ] **RLS Policies**: Verify RLS policies are active in Supabase dashboard
- [ ] **Environment Variables**: Set up production environment variables
  ```bash
  NEXT_PUBLIC_APP_URL=https://your-domain.com
  ```

### Important

- [ ] **CSP Headers**: Tighten Content Security Policy in `next.config.ts` for production
- [ ] **Database Backup**: Create production database backup strategy

## 📈 Status

**Status**: MVP Development Phase
**Branch**: `barber-ux-improvement`

## 🤝 Contributing

This project is in active development. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📄 License

This project is under private license.
