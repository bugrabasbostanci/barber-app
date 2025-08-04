# Component Refactoring Plan - Feature-Based Architecture

## Overview
Transform current monolithic components into maintainable, feature-based architecture using **Domain-Driven Design** principles rather than just splitting by line count.

## Current Problem Analysis

### ❌ **Current Structure Issues**
```
components/
├── calendar-view.tsx          # 946 lines - MONOLITH
├── book-appointment/page.tsx  # 892 lines - MONOLITH  
├── sidebar.tsx               # 726 lines - MONOLITH
└── ...scattered components
```

**Problems:**
- Business logic mixed with UI
- Single Responsibility Principle violated
- Hard to test individual features
- Poor reusability
- Difficult maintenance

## ✅ **Target Architecture: Feature-Based Structure**

### **Core Principle: Organize by WHAT, not HOW**

```
src/
├── features/                    # Business domains
│   ├── appointments/           # Appointment management domain
│   ├── calendar/              # Calendar functionality domain
│   ├── booking/               # Booking flow domain
│   ├── auth/                  # Authentication domain
│   └── staff/                 # Staff management domain
├── shared/                    # Shared across features
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Shared business logic
│   ├── services/              # API & business services
│   └── utils/                 # Pure utility functions
└── app/                       # Next.js routes (thin layer)
```

---

## 🎯 **Refactoring Strategy**

### **1. Domain-First Approach**
Instead of splitting by file size, split by **business domains**:

- **Appointments**: CRUD, validation, status management
- **Calendar**: Views, navigation, time management  
- **Booking**: Flow, steps, validation
- **Authentication**: Login, permissions, guards
- **Staff**: Management, availability, assignments

### **2. Component Hierarchy Rules**

#### **Feature Components (Domain-Specific)**
```typescript
// ✅ Good: Domain-specific, single responsibility
features/appointments/components/AppointmentCard.tsx      // 60 lines
features/appointments/components/AppointmentModal.tsx     // 80 lines
features/appointments/hooks/useAppointmentActions.ts     // 40 lines

// ❌ Bad: Generic, multiple responsibilities
components/AppointmentManager.tsx                        // 400 lines
```

#### **Shared Components (Reusable)**
```typescript
// ✅ Good: Pure UI, no business logic
shared/components/Button.tsx                             // 30 lines
shared/components/Modal.tsx                              // 50 lines
shared/components/DatePicker.tsx                         // 80 lines
```

### **3. Size Guidelines (Secondary to Domain)**

| Component Type | Max Lines | Purpose |
|----------------|-----------|---------|
| **Feature Components** | 150 lines | Business logic + UI |
| **Shared Components** | 100 lines | Pure UI, reusable |
| **Hook Files** | 80 lines | Single concern logic |
| **Service Files** | 200 lines | API + business rules |

---

## 📁 **Detailed Feature Structure**

### **Feature Template Structure**
```
features/[domain]/
├── components/              # UI components for this domain
│   ├── [Domain]Card.tsx    # List item component
│   ├── [Domain]Modal.tsx   # Detail/edit modal
│   ├── [Domain]Form.tsx    # Creation/edit form
│   └── [Domain]List.tsx    # Collection component
├── hooks/                  # Domain-specific logic
│   ├── use[Domain]Data.ts  # Data fetching
│   ├── use[Domain]Actions.ts # CRUD operations
│   └── use[Domain]State.ts # Local state management
├── services/               # API & business logic
│   ├── [domain]Service.ts  # API calls
│   ├── [domain]Repository.ts # Data access
│   └── [domain]Validation.ts # Business rules
├── types/                  # Domain types
│   └── [domain].types.ts
└── index.ts               # Public exports
```

---

## 🏗️ **Phase-by-Phase Refactoring Plan**

### **Phase 1: Appointments Domain (Week 1)**

#### **1.1 Extract Appointment Logic (Day 1-2)**
```
features/appointments/
├── components/
│   ├── AppointmentCard.tsx        # 60 lines - Display single appointment
│   ├── AppointmentList.tsx        # 80 lines - List with filtering
│   ├── AppointmentModal.tsx       # 100 lines - View/edit details
│   └── AppointmentStatusBadge.tsx # 20 lines - Status indicator
├── hooks/
│   ├── useAppointments.ts         # 60 lines - Data fetching & caching
│   ├── useAppointmentActions.ts   # 80 lines - CRUD operations
│   └── useAppointmentFilters.ts   # 40 lines - Search & filter logic
├── services/
│   ├── appointmentService.ts      # 120 lines - API calls
│   ├── appointmentRepository.ts   # 80 lines - Data access patterns
│   └── appointmentValidation.ts   # 60 lines - Business rules
└── types/
    └── appointment.types.ts       # 40 lines - TypeScript definitions
```

#### **1.2 Business Logic Separation**
```typescript
// ❌ Before: Mixed in component
function AppointmentComponent() {
  // 200 lines of mixed UI + business logic
}

// ✅ After: Separated concerns
function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { updateStatus, isUpdating } = useAppointmentActions();
  // 60 lines of pure UI logic
}

function useAppointmentActions() {
  // 80 lines of pure business logic
}
```

### **Phase 2: Calendar Domain (Week 1)**

#### **2.1 Extract Calendar Views**
```
features/calendar/
├── components/
│   ├── CalendarContainer.tsx      # 80 lines - Main coordinator
│   ├── CalendarHeader.tsx         # 60 lines - Navigation & controls
│   ├── views/
│   │   ├── DayView.tsx           # 120 lines - Daily schedule
│   │   ├── WeekView.tsx          # 150 lines - Weekly grid  
│   │   └── MonthView.tsx         # 100 lines - Monthly overview
│   └── cells/
│       ├── TimeSlot.tsx          # 40 lines - Individual time slot
│       ├── AppointmentCell.tsx   # 50 lines - Appointment in calendar
│       └── EmptySlot.tsx         # 20 lines - Available slot
├── hooks/
│   ├── useCalendarData.ts        # 80 lines - Data management
│   ├── useCalendarNavigation.ts  # 50 lines - View switching
│   └── useCalendarSelection.ts   # 40 lines - Date/time selection
└── services/
    ├── calendarService.ts        # 100 lines - Calendar business logic
    └── timeSlotService.ts        # 80 lines - Time management
```

### **Phase 3: Booking Domain (Week 2)**

#### **3.1 Booking Flow Refactoring**
```
features/booking/
├── components/
│   ├── BookingWizard.tsx         # 100 lines - Flow coordinator
│   ├── steps/
│   │   ├── DateSelection.tsx     # 120 lines - Date picker step
│   │   ├── StaffSelection.tsx    # 100 lines - Staff selection step
│   │   ├── TimeSelection.tsx     # 120 lines - Time slot step
│   │   ├── CustomerInfo.tsx      # 80 lines - Customer details step
│   │   └── BookingConfirmation.tsx # 90 lines - Final confirmation
│   ├── common/
│   │   ├── StepIndicator.tsx     # 40 lines - Progress indicator
│   │   ├── StepNavigation.tsx    # 50 lines - Next/prev buttons
│   │   └── BookingSummary.tsx    # 60 lines - Selection summary
├── hooks/
│   ├── useBookingFlow.ts         # 80 lines - Step navigation logic
│   ├── useBookingValidation.ts   # 60 lines - Form validation
│   ├── useBookingSubmission.ts   # 70 lines - Final submission
│   └── useAvailableSlots.ts      # 90 lines - Availability logic
└── services/
    ├── bookingService.ts         # 150 lines - Booking business logic
    └── availabilityService.ts    # 100 lines - Slot availability
```

### **Phase 4: Authentication Domain (Day 3)**

#### **4.1 Auth Components Extraction**
```
features/auth/
├── components/
│   ├── LoginForm.tsx            # 80 lines - Login UI
│   ├── RegisterForm.tsx         # 100 lines - Registration UI
│   ├── PasswordResetForm.tsx    # 60 lines - Password reset
│   └── AuthGuard.tsx           # 40 lines - Route protection
├── hooks/
│   ├── useAuth.ts              # 60 lines - Auth state (Zustand)
│   ├── useAuthActions.ts       # 80 lines - Login/logout actions
│   └── useAuthValidation.ts    # 50 lines - Form validation
└── services/
    ├── authService.ts          # 100 lines - Auth API calls
    └── tokenService.ts         # 60 lines - Token management
```

### **Phase 5: Shared Components Migration (Day 4-5)**

#### **5.1 Shared UI Components**
```
shared/
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── Button.tsx         # Keep as-is
│   │   ├── Modal.tsx          # Keep as-is
│   │   └── ...
│   ├── forms/                 # Form-related components
│   │   ├── FormField.tsx      # 40 lines - Reusable form field
│   │   ├── ValidationMessage.tsx # 20 lines - Error display
│   │   └── FormSection.tsx    # 30 lines - Form grouping
│   ├── layout/                # Layout components
│   │   ├── Header.tsx         # 80 lines - App header
│   │   ├── Sidebar.tsx        # 120 lines - Navigation sidebar
│   │   └── Footer.tsx         # 40 lines - App footer
│   └── feedback/              # User feedback
│       ├── LoadingSpinner.tsx # 20 lines - Loading states
│       ├── ErrorMessage.tsx   # 30 lines - Error display
│       └── SuccessMessage.tsx # 25 lines - Success feedback
├── hooks/                     # Shared business logic
│   ├── useLocalStorage.ts     # 40 lines - Local storage
│   ├── useDebounce.ts         # 30 lines - Debouncing
│   └── useEventListener.ts    # 35 lines - Event handling
├── services/                  # Shared services
│   ├── apiClient.ts           # 80 lines - HTTP client
│   ├── errorHandler.ts        # 60 lines - Error management
│   └── formatters.ts          # 50 lines - Data formatting
└── utils/                     # Pure utilities
    ├── dateUtils.ts           # 100 lines - Date operations
    ├── validationUtils.ts     # 80 lines - Validation helpers
    └── stringUtils.ts         # 40 lines - String operations
```

---

## 🔄 **Migration Strategy**

### **1. Parallel Development (No Downtime)**
```bash
# Keep old files while building new structure
components/calendar-view.tsx           # ← Keep working
features/calendar/                     # ← Build new structure
│   ├── components/CalendarContainer.tsx
│   └── ...

# Gradual replacement
app/calendar/page.tsx:
// import { CalendarView } from '@/components/calendar-view'     // Old
import { CalendarContainer } from '@/features/calendar'          // New
```

### **2. Import/Export Management**
```typescript
// features/calendar/index.ts - Single export point
export { CalendarContainer as Calendar } from './components/CalendarContainer';
export { useCalendarData } from './hooks/useCalendarData';
export type { CalendarProps } from './types/calendar.types';

// App usage - Clean imports
import { Calendar, useCalendarData } from '@/features/calendar';
```

### **3. Testing Strategy**
```typescript
// Test each feature independently
__tests__/
├── features/
│   ├── appointments/
│   │   ├── AppointmentCard.test.tsx
│   │   └── useAppointmentActions.test.ts
│   └── calendar/
│       ├── CalendarContainer.test.tsx
│       └── useCalendarData.test.ts
└── shared/
    └── components/
        └── Button.test.tsx
```

---

## 📊 **Success Metrics**

### **Code Quality Metrics**
| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **Largest File** | 946 lines | <150 lines | Line count |
| **Cyclomatic Complexity** | ~25 | <10 | ESLint rule |
| **Import Depth** | 5+ levels | 2-3 levels | Dependency analysis |
| **Test Coverage** | ~40% | >85% | Jest coverage |
| **Build Time** | 45s | <30s | CI metrics |

### **Developer Experience Metrics**
| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **Time to Find Code** | 5-10 min | <2 min | Developer survey |
| **Feature Development** | 2-3 days | 1 day | Sprint velocity |
| **Bug Fix Time** | 1-2 hours | <30 min | Issue tracking |
| **Code Review Time** | 45 min | <15 min | PR analytics |

### **Maintenance Metrics**
| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **Feature Isolation** | 20% | 90% | Dependency graph |
| **Reusability Score** | 30% | 70% | Component usage |
| **Breaking Changes** | High | Low | Semantic versioning |

---

## ⚡ **Performance Benefits**

### **1. Bundle Splitting by Feature**
```typescript
// Automatic code splitting
const CalendarPage = lazy(() => import('@/features/calendar'));
const BookingPage = lazy(() => import('@/features/booking'));

// Result: Smaller initial bundles, faster loading
```

### **2. Tree Shaking Optimization**
```typescript
// ✅ Good: Import only what you need
import { AppointmentCard } from '@/features/appointments';

// ❌ Bad: Import entire feature
import * as Appointments from '@/features/appointments';
```

### **3. Dependency Optimization**
```typescript
// Before: Monolithic dependencies
calendar-view.tsx imports: 15 different modules

// After: Focused dependencies  
CalendarContainer.tsx imports: 5 relevant modules
```

---

## 🛠️ **Implementation Timeline**

### **Week 1: Core Domains**
- **Day 1-2**: Appointments feature extraction
- **Day 3-4**: Calendar feature extraction  
- **Day 5**: Testing & integration

### **Week 2: User Flows**
- **Day 1-3**: Booking flow refactoring
- **Day 4**: Auth domain extraction
- **Day 5**: Shared components migration

### **Week 3: Polish & Optimization**
- **Day 1-2**: Performance optimization
- **Day 3-4**: Testing coverage completion
- **Day 5**: Documentation & cleanup

---

## 🔍 **Quality Gates**

### **Before Merging Each Feature:**
1. **✅ All tests pass** (unit + integration)
2. **✅ ESLint score: 0 errors, <5 warnings**
3. **✅ TypeScript: 0 errors**
4. **✅ Bundle size: No increase >5%**
5. **✅ Performance: No regressions**
6. **✅ Code review: 2+ approvals**

### **Feature Completion Criteria:**
1. **📦 Single Responsibility**: Each component has one clear purpose
2. **🔗 Loose Coupling**: Features don't directly depend on each other
3. **🧪 Testable**: Easy to test in isolation
4. **📚 Documented**: Clear API and usage examples
5. **♻️ Reusable**: Components can be used in multiple contexts

---

## 🎯 **Key Principles**

### **1. Domain-Driven Design**
- **Organize by business capability, not technical layer**
- **Each feature owns its complete business logic**
- **Shared code only when truly reusable**

### **2. Progressive Enhancement**
- **Start with working monolith**
- **Extract one domain at a time**
- **No breaking changes during migration**

### **3. Developer Productivity**
- **Faster feature development**
- **Easier debugging and maintenance**
- **Better code discoverability**

### **4. Performance First**
- **Smaller bundles through code splitting**
- **Better tree shaking**
- **Optimized dependencies**

---

**🎯 Success Definition**: Transform from **monolithic chaos** to **domain-driven clarity** while maintaining 100% functionality and improving developer experience.