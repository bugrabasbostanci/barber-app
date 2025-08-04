# Barber App - Production Ready Roadmap 🚀

**Güvenlik Öncelikli Comprehensive Improvement Plan**

Bu plan mevcut UNIFIED-IMPROVEMENT-PLAN.md ile güvenlik analizi sonuçlarını birleştirerek **production-ready** bir roadmap sunar.

## 🚨 KRİTİK DURUM ANALİZİ

### Acil Güvenlik Zafiyetleri

- **Authorization Bypass**: Authenticated user herhangi bir API'yi çağırabilir
- **Debug Endpoints**: Production'da aktif (/api/debug-\*)
- **Data Leakage**: 75+ console.log kullanımı
- **Input Validation**: XSS ve injection koruması eksik
- **Rate Limiting**: DDoS koruması yok

### Kod Kalitesi Sorunları

- **calendar-view.tsx**: 946 satır (refactor gerekli)
- **book-appointment/page.tsx**: 892 satır
- **sidebar.tsx**: 726 satır
- **Business logic**: API route'larda karışık

## 🎯 PRODUCTION-READY ROADMAP

### 🚨 FAZ 0: ACİL GÜVENLİK (1-2 GÜN) - KRİTİK ÖNCELİK

#### 0.1 Authorization Middleware (4 saat)

```ts
// lib/middleware/auth.ts
export function requireRole(allowedRoles: Role[]) {
  return async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return user;
  };
}

// Kullanım:
export const GET = withAuth(requireRole(["BARBER", "ADMIN"]))(handler);
```

#### 0.2 Debug Endpoints Güvenliği (2 saat)

```ts
// app/api/debug-*/route.ts - Tüm debug endpoint'lerde
export async function GET(request: NextRequest) {
  // Production'da sadece admin erişimi
  if (process.env.NODE_ENV === "production") {
    const user = await requireRole(["ADMIN"])(request);
    if (!user)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Existing debug logic...
}
```

#### 0.3 Console.log Temizliği (2 saat)

```bash
# Automated cleanup
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\./d'

# Structured logging replacement
// lib/logger.ts
export const logger = {
  info: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify({ level: 'info', msg, meta, timestamp: Date.now() }));
    }
  },
  error: (msg: string, error?: any) => {
    console.error(JSON.stringify({ level: 'error', msg, error: error?.stack, timestamp: Date.now() }));
  }
};
```

#### 0.4 Input Validation & Sanitization (6 saat)

```ts
// lib/validations/security.ts
import { z } from "zod";

export const sanitizeInput = (input: string) => {
  return input
    .replace(/[<>]/g, "") // XSS protection
    .trim()
    .slice(0, 1000); // Length limit
};

export const AppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  staffId: z.string().uuid(),
  notes: z.string().max(500).optional().transform(sanitizeInput),
});

// Middleware wrapper
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest): Promise<T> => {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }

    return result.data;
  };
}
```

#### 0.5 Rate Limiting (4 saat)

```ts
// lib/middleware/rate-limit.ts
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    const current = rateLimits.get(ip) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }

    rateLimits.set(ip, current);

    if (current.count > maxRequests) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((current.resetTime - now) / 1000)),
          },
        }
      );
    }
  };
}

// Usage: 10 requests per minute
export const POST = withMiddleware([
  rateLimit(10, 60000),
  requireRole(["CUSTOMER"]),
])(appointmentHandler);
```

### 📊 FAZ 1: STABİLİZASYON (3-5 GÜN)

#### 1.1 Database Connection Optimization (1 gün)

```ts
// lib/prisma.ts - Singleton pattern
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Connection health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date() };
  } catch (error) {
    return { status: "unhealthy", error: error.message, timestamp: new Date() };
  }
}
```

#### 1.2 Standardized Error Handling (2 gün)

```ts
// lib/errors/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(public issues: any[]) {
    super("Validation failed", 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

// lib/middleware/error-handler.ts
export function withErrorHandler(handler: Function) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error("API Error", error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            ...(process.env.NODE_ENV === "development" && {
              stack: error.stack,
            }),
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
```

#### 1.3 API Response Standardization (1 gün)

```ts
// lib/api/response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: any): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      meta,
    });
  }

  static error(message: string, statusCode = 500, code?: string): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code,
      },
      { status: statusCode }
    );
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
```

#### 1.4 Health Check & Monitoring (1 gün)

```ts
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    checks: {
      database: await checkDatabaseHealth(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    },
  };

  const isHealthy = health.checks.database.status === "healthy";

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
```

### 🔧 FAZ 2: COMPONENT REFACTORING (1-2 HAFTA)

#### 2.1 Calendar View Breakdown (4 gün)

```
components/calendar/
├── CalendarView.tsx          # Main coordinator (100 lines)
├── CalendarHeader.tsx        # Navigation & view toggle (80 lines)
├── views/
│   ├── DayView.tsx          # Daily schedule (150 lines)
│   ├── WeekView.tsx         # Weekly grid (180 lines)
│   └── MonthView.tsx        # Monthly overview (120 lines)
├── AppointmentModal.tsx      # Appointment details (100 lines)
├── AppointmentCard.tsx       # Individual appointment (60 lines)
└── hooks/
    ├── useCalendarData.ts   # Data fetching
    ├── useCalendarState.ts  # View state management
    └── useAppointmentActions.ts # CRUD operations
```

#### 2.2 Booking Flow Refactoring (4 gün)

```
components/booking/
├── BookingWizard.tsx        # Step coordinator (120 lines)
├── steps/
│   ├── DateSelection.tsx    # Date picker (120 lines)
│   ├── StaffSelection.tsx   # Staff list (100 lines)
│   ├── TimeSelection.tsx    # Available slots (150 lines)
│   ├── CustomerInfo.tsx     # Customer form (100 lines)
│   └── BookingConfirmation.tsx # Final review (90 lines)
├── BookingProgress.tsx      # Progress indicator (40 lines)
└── hooks/
    ├── useBookingFlow.ts    # Step navigation
    ├── useAvailableSlots.ts # Time slot logic
    └── useBookingSubmit.ts  # Form submission
```

#### 2.3 Service Layer Architecture (4 gün)

```ts
// services/appointmentService.ts
export class AppointmentService {
  static async createAppointment(data: CreateAppointmentDTO) {
    // Business logic validation
    await this.validateAppointmentSlot(data);

    // Create appointment
    const appointment = await AppointmentRepository.create(data);

    // Send notifications
    await NotificationService.sendBookingConfirmation(appointment);

    return appointment;
  }

  static async validateAppointmentSlot(data: CreateAppointmentDTO) {
    const existing = await AppointmentRepository.findByStaffAndTime(
      data.staffId,
      data.date,
      data.startTime
    );

    if (existing) {
      throw new ConflictError("Time slot already booked");
    }

    const isWorkingHours = await this.isWithinWorkingHours(
      data.date,
      data.startTime
    );
    if (!isWorkingHours) {
      throw new ValidationError("Outside working hours");
    }
  }
}

// repositories/appointmentRepository.ts
export class AppointmentRepository {
  static async findByStaffAndTime(
    staffId: string,
    date: string,
    startTime: string
  ) {
    return prisma.appointment.findFirst({
      where: {
        staffId,
        date: localDateToUTC(date),
        startTime: createUTCTime(startTime),
        status: { notIn: ["CANCELLED"] },
      },
    });
  }

  static async create(data: CreateAppointmentDTO) {
    return prisma.appointment.create({
      data: {
        ...data,
        date: localDateToUTC(data.date),
        startTime: createUTCTime(data.startTime),
        endTime: createUTCTime(data.endTime),
      },
      include: {
        customer: true,
        staff: true,
        shop: true,
      },
    });
  }
}
```

### ⚡ FAZ 3: PERFORMANCE & STATE MANAGEMENT (1-2 HAFTA)

#### 3.1 React Query Integration (3 gün)

```ts
// hooks/queries/useAppointments.ts
export function useAppointments(params: AppointmentQueryParams) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => AppointmentService.getAppointments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AppointmentService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}

// providers/QueryProvider.tsx
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 3.2 State Management (Zustand) (2 gün)

```ts
// stores/authStore.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await AuthService.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null });
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");

    const updatedUser = await UserService.updateProfile(user.id, data);
    set({ user: updatedUser });
  },
}));

// stores/bookingStore.ts
interface BookingState {
  currentStep: number;
  selectedDate: string | null;
  selectedStaff: string | null;
  selectedTime: string | null;
  customerInfo: CustomerInfo | null;
  goToStep: (step: number) => void;
  setSelectedDate: (date: string) => void;
  setSelectedStaff: (staffId: string) => void;
  setSelectedTime: (time: string) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 0,
  selectedDate: null,
  selectedStaff: null,
  selectedTime: null,
  customerInfo: null,

  goToStep: (step) => set({ currentStep: step }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedStaff: (staffId) => set({ selectedStaff: staffId }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  reset: () =>
    set({
      currentStep: 0,
      selectedDate: null,
      selectedStaff: null,
      selectedTime: null,
      customerInfo: null,
    }),
}));
```

#### 3.3 Code Splitting & Performance (3 gün)

```ts
// app/layout.tsx
const CalendarView = lazy(() => import("@/components/calendar/CalendarView"));
const BookingWizard = lazy(() => import("@/components/booking/BookingWizard"));
const AdminDashboard = lazy(() => import("@/app/barber/dashboard/page"));

// components/ui/LazyWrapper.tsx
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={fallback || <div className="animate-pulse">Loading...</div>}
    >
      {children}
    </Suspense>
  );
}

// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "react-hook-form",
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};
```

### 🛡️ FAZ 4: ADVANCED SECURITY & MONITORING (1 HAFTA)

#### 4.1 Security Headers & CORS (1 gün)

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

#### 4.2 Advanced Rate Limiting (2 gün)

```ts
// lib/middleware/advanced-rate-limit.ts
interface RateLimitConfig {
  requests: number;
  window: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

class AdvancedRateLimiter {
  private store = new Map<
    string,
    { count: number; resetTime: number; blocked: boolean }
  >();

  createLimiter(config: RateLimitConfig) {
    return async (req: NextRequest) => {
      const key = config.keyGenerator
        ? config.keyGenerator(req)
        : this.defaultKeyGenerator(req);
      const now = Date.now();
      const windowStart = now - config.window;

      let record = this.store.get(key);

      if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + config.window, blocked: false };
      }

      record.count++;
      this.store.set(key, record);

      if (record.count > config.requests) {
        record.blocked = true;
        return NextResponse.json(
          {
            error: "Too many requests",
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          },
          { status: 429 }
        );
      }

      return null; // Continue to next middleware
    };
  }

  private defaultKeyGenerator(req: NextRequest): string {
    return req.ip || req.headers.get("x-forwarded-for") || "unknown";
  }
}

export const rateLimiter = new AdvancedRateLimiter();

// Usage for different endpoints
export const bookingRateLimit = rateLimiter.createLimiter({
  requests: 5,
  window: 60000, // 1 minute
  keyGenerator: (req) => `booking:${req.ip || "unknown"}`,
});

export const authRateLimit = rateLimiter.createLimiter({
  requests: 10,
  window: 900000, // 15 minutes
  keyGenerator: (req) => `auth:${req.ip || "unknown"}`,
});
```

#### 4.3 Audit Logging (2 gün)

```ts
// lib/audit/logger.ts
interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  static async log(event: AuditEvent) {
    const auditRecord = {
      ...event,
      timestamp: new Date(),
      id: crypto.randomUUID(),
    };

    // Log to database
    await prisma.auditLog.create({
      data: auditRecord,
    });

    // Log to external service (optional)
    if (process.env.AUDIT_WEBHOOK_URL) {
      try {
        await fetch(process.env.AUDIT_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(auditRecord),
        });
      } catch (error) {
        logger.error("Failed to send audit log to webhook", error);
      }
    }
  }

  static createMiddleware() {
    return async (req: NextRequest, event: Partial<AuditEvent>) => {
      const startTime = Date.now();

      try {
        const result = await event;

        await this.log({
          action: event.action || req.method,
          resource: event.resource || req.nextUrl.pathname,
          ip: req.ip || req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          success: true,
          metadata: {
            responseTime: Date.now() - startTime,
            ...event.metadata,
          },
          ...event,
        });

        return result;
      } catch (error) {
        await this.log({
          action: event.action || req.method,
          resource: event.resource || req.nextUrl.pathname,
          ip: req.ip || req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
          success: false,
          error: error.message,
          metadata: {
            responseTime: Date.now() - startTime,
            ...event.metadata,
          },
          ...event,
        });

        throw error;
      }
    };
  }
}
```

#### 4.4 Database Security (2 gün)

```sql
-- Add audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  ip VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own appointments
CREATE POLICY appointment_customer_policy ON appointments
  FOR ALL USING (
    auth.uid()::text = customer_id::text OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('BARBER', 'ADMIN')
    )
  );

-- Staff can see appointments assigned to them
CREATE POLICY appointment_staff_policy ON appointments
  FOR ALL USING (
    auth.uid()::text = staff_id::text OR
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'ADMIN'
    )
  );
```

### 🧪 FAZ 5: TESTING & QUALITY ASSURANCE (1 HAFTA)

#### 5.1 Testing Infrastructure (3 gün)

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
npm install -D @testing-library/user-event msw
```

```ts
// __tests__/setup.ts
import "@testing-library/jest-dom";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// __tests__/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/appointments", () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: "1",
          date: "2025-08-07",
          startTime: "17:00",
          endTime: "17:45",
          status: "CONFIRMED",
        },
      ],
    });
  }),

  http.post("/api/appointments", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: "2", ...body },
    });
  }),
];

// __tests__/components/Calendar.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { CalendarView } from "@/components/calendar/CalendarView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

describe("CalendarView", () => {
  it("renders appointments correctly", async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CalendarView />
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("17:00")).toBeInTheDocument();
    });
  });
});
```

#### 5.2 E2E Testing (2 gün)

```bash
npm install -D @playwright/test
```

```ts
// e2e/booking-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("customer can book an appointment", async ({ page }) => {
    await page.goto("/book-appointment");

    // Select date
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-date="2025-08-07"]');

    // Select staff
    await page.click('[data-testid="staff-select"]');
    await page.click('[data-staff-id="staff-1"]');

    // Select time
    await page.click('[data-testid="time-slot-17:00"]');

    // Fill customer info
    await page.fill('[data-testid="customer-name"]', "John Doe");
    await page.fill('[data-testid="customer-phone"]', "+905551234567");

    // Submit booking
    await page.click('[data-testid="submit-booking"]');

    // Verify success
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
  });

  test("prevents double booking", async ({ page }) => {
    // Book first appointment
    await page.goto("/book-appointment");
    // ... booking steps ...

    // Try to book same slot again
    await page.goto("/book-appointment");
    // ... same booking steps ...

    await expect(
      page.locator('[data-testid="slot-unavailable"]')
    ).toBeVisible();
  });
});
```

#### 5.3 Code Quality Tools (2 gün)

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "max-lines": ["error", 200],
    "max-lines-per-function": ["error", 50],
    "complexity": ["error", 10],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}

// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 📅 IMPLEMENTATION TIMELINE

### Sprint 0: Emergency Security (2 gün)

- **Day 1**: Authorization middleware + Debug endpoint security
- **Day 2**: Input validation + Rate limiting + Console.log cleanup

### Sprint 1: Stabilization (1 hafta)

- **Day 1**: Database optimization + Health checks
- **Day 2-3**: Error handling standardization
- **Day 4-5**: API response standardization + Basic monitoring

### Sprint 2: Component Refactoring (2 hafta)

- **Week 1**: Calendar view breakdown
- **Week 2**: Booking flow refactoring + Service layer

### Sprint 3: Performance & State (2 hafta)

- **Week 1**: React Query + Zustand integration
- **Week 2**: Code splitting + Bundle optimization

### Sprint 4: Advanced Security (1 hafta)

- **Day 1-2**: Security headers + Advanced rate limiting
- **Day 3-4**: Audit logging + Database security
- **Day 5**: Security testing

### Sprint 5: Testing & Quality (1 hafta)

- **Day 1-3**: Unit tests + Integration tests
- **Day 4-5**: E2E tests + Code quality tools

## 🎯 SUCCESS METRICS

### Security (Kritik)

- [ ] ✅ Authorization bypass kapatıldı
- [ ] ✅ Debug endpoints güvenlik altında
- [ ] ✅ Input validation %100
- [ ] ✅ Rate limiting aktif
- [ ] ✅ Audit logging çalışıyor

### Performance

- [ ] API response time <200ms (95th %ile)
- [ ] Bundle size 40% azaldı
- [ ] First Contentful Paint <1.5s
- [ ] Database query time <50ms

### Code Quality

- [ ] Largest file <200 lines
- [ ] Function complexity <10
- [ ] TypeScript strict mode %100
- [ ] Test coverage >85%
- [ ] ESLint errors: 0

## 🚀 QUICK START CHECKLIST

### İlk 2 Saat (Acil Güvenlik)

```bash
# 1. Authorization middleware ekle
mkdir -p lib/middleware
touch lib/middleware/auth.ts

# 2. Debug endpoints güvenliği
# Her debug endpoint'e admin check ekle

# 3. Console.log temizliği
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\." | head -10

# 4. Input validation başlat
mkdir -p lib/validations
npm install zod
```

### İlk Gün (Temel Güvenlik)

- Authorization middleware tamamla
- Rate limiting ekle
- Input validation schemas oluştur
- Health check endpoint ekle

### İlk Hafta (Stabilizasyon)

- Database connection optimize et
- Error handling standardize et
- API responses standartlaştır
- Monitoring başlat

---

**🎯 Kritik Başarı Faktörü**: FAZ 0'ı atlama! Güvenlik sorunları production'da büyük risk oluşturuyor.

**📞 Acil Durum**: Herhangi bir güvenlik açığı tespit edilirse, hemen tüm debug endpoint'leri devre dışı bırak ve authorization kontrollerini aktifleştir.
