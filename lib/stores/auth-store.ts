import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { AuthUser, AuthState } from "@/lib/types/auth";

interface ExtendedAuthState extends AuthState {
  // State - user already defined in AuthState
  user: AuthUser | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Role-based utilities
  isCustomer: () => boolean;
  isBarber: () => boolean;
  isStaff: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  
  // User info utilities
  getDisplayName: () => string;
  getUserInitials: () => string;
  canBookAppointments: () => boolean;
  canAccessBarberPanel: () => boolean;
}

export const useAuthStore = create<ExtendedAuthState>()(
  devtools(
    persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: true,
      initialized: false,
      hydrated: false,

      // Actions
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setHydrated: (hydrated) => set({ hydrated }),

      initialize: async () => {
        if (get().initialized) return;

        const supabase = createClient();

        try {
          set({ loading: true });

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Check if we have cached user data from persistence
            const cachedUser = get().user;
            
            // If we have cached user data for the same user, use it immediately
            if (cachedUser && cachedUser.id === session.user.id && cachedUser.role) {
              set({ 
                user: cachedUser, 
                loading: false, 
                initialized: true 
              });
              
              // Background refresh for latest data
              setTimeout(() => get().refreshUser(), 100);
              return;
            }
            
            // No cached data or different user - fetch from API immediately
            await get().refreshUser();
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ user: null, loading: false, initialized: true });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
            set({ user: null });
          } else if (session?.user && event === 'SIGNED_IN') {
            // Immediately refresh user data on sign in
            await get().refreshUser();
          }
        });
      },

      refreshUser: async () => {
        try {
          const response = await fetch("/api/profile", {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const supabase = createClient();
              const {
                data: { user: supabaseUser },
              } = await supabase.auth.getUser();

              if (supabaseUser) {
                const userWithRole: AuthUser = {
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
                set({ user: userWithRole, loading: false, initialized: true });
              }
            }
          } else if (response.status === 401) {
            // Unauthorized - clear user data
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
          set({ loading: false, initialized: true });
        }
      },

      signOut: async () => {
        try {
          console.log('Auth store: Starting signOut process...');
          
          // Clear user state immediately for smooth UI transition
          set({ user: null });
          
          // Clear appointments cache on sign out
          try {
            const { useAppointmentsStore } = await import('./appointments-store');
            useAppointmentsStore.getState().clearCache();
          } catch {
            // Ignore if appointments store not available
            console.log('Appointments store not available during sign out');
          }
          
          // Clear browser storage immediately for responsive UI
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
          
          // Client-side logout as fallback
          const supabase = createClient();
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            console.error('Client logout error:', error);
            // Even if Supabase fails, we've already cleared local state
          }
          
          console.log('Auth store: SignOut completed successfully');
          
        } catch (error) {
          console.error('Sign out error:', error);
          // Clear state even if there's an error
          set({ user: null });
          
          // Fallback: clear browser storage
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
        }
      },

      // Role-based utilities
      isCustomer: () => {
        const { user } = get();
        return user?.role === 'CUSTOMER';
      },

      isBarber: () => {
        const { user } = get();
        return user?.role === 'BARBER';
      },

      isStaff: () => {
        const { user } = get();
        return ['EMPLOYEE', 'BARBER', 'ADMIN'].includes(user?.role || '');
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles: string[]) => {
        const { user } = get();
        return roles.includes(user?.role || '');
      },

      // User info utilities
      getDisplayName: () => {
        const { user } = get();
        if (user?.firstName && user?.lastName) {
          return `${user.firstName} ${user.lastName}`;
        }
        if (user?.email) {
          return user.email.split('@')[0];
        }
        return 'Kullanıcı';
      },

      getUserInitials: () => {
        const { user } = get();
        if (user?.firstName && user?.lastName) {
          return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        }
        if (user?.email) {
          return user.email.charAt(0).toUpperCase();
        }
        return 'K';
      },

      canBookAppointments: () => {
        const { user } = get();
        return user?.role === 'CUSTOMER' && user?.isActive !== false;
      },

      canAccessBarberPanel: () => {
        const { user } = get();
        return ['BARBER', 'ADMIN', 'EMPLOYEE'].includes(user?.role || '');
      },
    }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);