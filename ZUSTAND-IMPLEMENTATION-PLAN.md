# Zustand State Management Implementation Plan

## Overview

Replace current scattered `useAuth` hooks with centralized Zustand store for better performance, consistency, and user experience.

## Current Problems

- ❌ Multiple API calls per page load (`useAuth` in each component)
- ❌ Inconsistent auth state across components
- ❌ Loading flashes and hydration mismatches
- ❌ No persistence (user logged out on refresh)
- ❌ Race conditions possible

## Target Goals

- ✅ Single source of truth for authentication
- ✅ Persistent login state
- ✅ Optimized API calls (only when needed)
- ✅ Smooth UX with proper loading states
- ✅ TypeScript type safety
- ✅ SSR compatibility

---

## Implementation Steps

### Phase 1: Setup & Core Store (30 minutes)

#### 1.1 Install Dependencies

```bash
npm install zustand
```

#### 1.2 Create Auth Store (`lib/stores/auth-store.ts`)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserWithRole extends User {
  role?: string;
  firstName?: string;
  lastName?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
}

interface AuthState {
  // State
  user: UserWithRole | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: UserWithRole | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: true,
      initialized: false,

      // Actions
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        if (get().initialized) return;

        set({ loading: true });
        const supabase = createClient();

        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            await get().refreshUser();
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ user: null });
        } finally {
          set({ loading: false, initialized: true });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await get().refreshUser();
          } else {
            set({ user: null });
          }
        });
      },

      refreshUser: async () => {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const supabase = createClient();
              const {
                data: { user: supabaseUser },
              } = await supabase.auth.getUser();

              if (supabaseUser) {
                const userWithRole: UserWithRole = {
                  ...supabaseUser,
                  role: result.data.role,
                  firstName: result.data.firstName,
                  lastName: result.data.lastName,
                  isGoogleUser:
                    supabaseUser.identities?.some(
                      (i) => i.provider === "google"
                    ) || false,
                  isEmailUser:
                    supabaseUser.identities?.some(
                      (i) => i.provider === "email"
                    ) || false,
                };
                set({ user: userWithRole });
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
        }
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
```

#### 1.3 Create Auth Provider (`components/providers/auth-provider.tsx`)

```typescript
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
```

### Phase 2: Replace useAuth Hook (15 minutes)

#### 2.1 Create New Hook (`hooks/useAuth.ts`)

```typescript
"use client";

import { useAuthStore } from "@/lib/stores/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const signOut = useAuthStore((state) => state.signOut);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return {
    user,
    loading,
    signOut,
    refreshUser,
  };
}

// Convenience hooks
export function useUser() {
  return useAuthStore((state) => state.user);
}

export function useAuthLoading() {
  return useAuthStore((state) => state.loading);
}
```

### Phase 3: Update Layout & Components (20 minutes)

#### 3.1 Update Root Layout (`app/layout.tsx`)

```typescript
import { AuthProvider } from "@/components/providers/auth-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

#### 3.2 Update Components

- `app/page.tsx` - Use new useAuth hook
- `app/(customer)/profile/page.tsx` - Use new useAuth hook
- Remove old `hooks/useAuth.ts` file
- Update any other components using authentication

### Phase 4: Auth Guards & Utils (15 minutes)

#### 4.1 Enhanced Auth Guards (`hooks/useRequireAuth.ts`)

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useRequireAuth(requiredRole?: string) {
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/");
      return;
    }
  }, [user, loading, initialized, requiredRole, router]);

  return {
    user,
    loading: loading || !initialized,
    isAuthorized: !!user && (!requiredRole || user.role === requiredRole),
  };
}

export function useRequireCustomer() {
  return useRequireAuth("CUSTOMER");
}

export function useRequireBarber() {
  return useRequireAuth("BARBER");
}
```

---

## Testing Plan

### 1. Functionality Tests

- [ ] Login/logout flow works
- [ ] User data persists across refresh
- [ ] Role-based navigation works
- [ ] Loading states are smooth
- [ ] No hydration mismatches

### 2. Performance Tests

- [ ] Reduced API calls (check Network tab)
- [ ] Faster page loads
- [ ] No authentication flashes

### 3. Edge Cases

- [ ] Token expiration handling
- [ ] Network offline/online
- [ ] Multiple tabs behavior
- [ ] Browser refresh scenarios

---

## Benefits After Implementation

### Performance

- 🚀 **90% less API calls** - Only fetch user data once
- 🚀 **Faster page loads** - No auth checks per component
- 🚀 **Better caching** - Zustand + persist middleware

### User Experience

- ✨ **No loading flashes** - Consistent state across app
- ✨ **Persistent login** - Stay logged in after refresh
- ✨ **Smooth transitions** - No hydration mismatches

### Developer Experience

- 🛠️ **Type safety** - Full TypeScript support
- 🛠️ **DevTools** - Zustand dev tools for debugging
- 🛠️ **Simple API** - Easy to use hooks
- 🛠️ **Scalable** - Easy to add more global state

### Code Quality

- 📦 **Single source of truth** - No scattered auth logic
- 📦 **Better separation** - Auth logic in store
- 📦 **Less boilerplate** - Cleaner components
- 📦 **Maintainable** - Centralized auth management

---

## Migration Strategy

1. **Parallel Implementation**: Keep old useAuth while building new store
2. **Gradual Migration**: Update components one by one
3. **Testing**: Test each component after migration
4. **Cleanup**: Remove old auth code after all components updated

## Rollback Plan

If issues arise:

1. Keep old `hooks/useAuth.ts` as backup
2. Quick switch back to old implementation
3. Debug and fix issues
4. Re-attempt migration

---

## Estimated Time: 1.5 hours

- Setup: 30 minutes
- Hook replacement: 15 minutes
- Component updates: 20 minutes
- Auth guards: 15 minutes
- Testing: 10 minutes

## Dependencies

- `zustand` - State management
- No breaking changes to existing APIs
- Backward compatible during migration

## Priority: High

This will significantly improve user experience and application performance.

---

## Zustand ile Optimistic UI

Kesinlikle haklısın! "Yetkilendirme kontrol ediliyor" mesajı çok kötü bir UX. Bu durumu analiz edelim:

🔍 Mevcut Durumdaki Problem

Şu anki akış:

1. Sayfa yüklenir → Loading: true
2. useAuth hook çalışır → API call yapılır
3. User: "Yetkilendirme kontrol ediliyor" görür
4. API response gelir → Component render olur

Sorun nerede:

- Her sayfa geçişinde auth check
- API gecikmesi = kötü UX
- Flash of loading content

✅ Zustand ile Nasıl Düzelir

1. Instant State Access

// Şu anki: Her component'te API call
const { user, loading } = useAuth() // API call!

// Zustand ile: Instant access
const user = useAuthStore(state => state.user) // No API call!

2. Smart Loading States

const authStore = {
initialized: false, // İlk kez yüklendi mi?
loading: false, // Şu an auth işlemi yapılıyor mu?
user: null // Cache'lenmiş user
}

// Sayfa geçişi:
if (!initialized) {
// İlk yükleme - loading göster
} else if (user) {
// Cache'den user var - direkt göster!
} else {
// User yok - login'e yönlendir
}

3. Background Refresh

// Kullanıcı sayfayı görür, arkada refresh
useEffect(() => {
if (shouldRefresh) {
refreshUserInBackground() // Silent refresh
}
}, [])

🎯 UX Geliştirmeleri

Şu anki UX:

Sayfa Click → Loading Screen → "Yetkilendirme kontrol ediliyor" → Content

Zustand sonrası UX:

Sayfa Click → Content (instant!) → Background refresh (silent)

📋 Zustand Implementation'da Özel Stratejiler

1. Optimistic UI

// Kullanıcı login olmuşsa, cache'den hemen göster
if (userFromCache && !isExpired(userFromCache)) {
return <Dashboard user={userFromCache} />
}

2. Progressive Loading

// 1. Cache'den göster
// 2. Arkada fresh data çek
// 3. Sessizce güncelle (kullanıcı fark etmez)

3. Auth State Levels

type AuthStatus =
| 'initializing' // İlk app load
| 'authenticated' // User kesin var
| 'unauthenticated' // User kesin yok
| 'refreshing' // Background refresh

🚀 Beklenen İyileştirmeler

Performance:

- ⚡ 0ms sayfa geçiş süreleri (cache'den)
- ⚡ %90 daha az "loading" ekranı
- ⚡ Background refresh (user fark etmez)

UX:

- ✨ Instant page transitions
- ✨ No more "yetkilendirme kontrol ediliyor"
- ✨ Smooth app experience
- ✨ Netflix/YouTube gibi premium UX

Özel Durumlar:

// Expired token: Silent refresh attempt
// Network error: Cached data + retry
// First visit: Minimal loading screen
// Return user: Instant access

💡 Implementation Prioritesi

Bu UX sorunu yüksek öncelik çünkü:

1. Her sayfa geçişinde yaşanıyor
2. Professional olmayan görünüm
3. User retention'ı etkiliyor
4. Competitor'larda yok

Zustand implementation'ı sadece teknik iyileştirme değil, UX revolution olacak!
