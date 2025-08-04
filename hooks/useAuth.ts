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