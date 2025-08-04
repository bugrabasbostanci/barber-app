import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
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
  hydrated: boolean;

  // Actions
  setUser: (user: UserWithRole | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
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
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Optimistic: Set basic user info immediately
            const basicUser: UserWithRole = {
              ...session.user,
              role: get().user?.role, // Use cached role if available
              firstName: get().user?.firstName,
              lastName: get().user?.lastName,
              isGoogleUser:
                session.user.identities?.some((i) => i.provider === "google") ||
                false,
              isEmailUser:
                session.user.identities?.some((i) => i.provider === "email") ||
                false,
            };
            
            set({ user: basicUser, loading: false, initialized: true });
            
            // Background refresh for latest data
            get().refreshUser();
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ user: null, loading: false, initialized: true });
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
    ),
    {
      name: "auth-store",
    }
  )
);