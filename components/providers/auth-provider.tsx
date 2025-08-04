"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    // Mark as hydrated to prevent hydration mismatch
    setHydrated(true);
    initialize();
  }, [initialize, setHydrated]);

  return <>{children}</>;
}