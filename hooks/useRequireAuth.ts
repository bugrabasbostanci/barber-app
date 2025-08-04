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
      router.push("/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/?error=Bu sayfaya erişim yetkiniz bulunmuyor");
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
  const { user, loading, initialized, signOut } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading) {
      if (!user) {
        router.push("/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor");
      } else if (user.role !== "CUSTOMER") {
        router.push("/?error=Bu sayfaya erişim yetkiniz bulunmuyor");
      }
    }
  }, [user, loading, initialized, router]);

  return { 
    user, 
    loading: loading || !initialized, 
    isAuthorized: user?.role === "CUSTOMER", 
    signOut 
  };
}

export function useRequireBarber() {
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading) {
      if (!user) {
        router.push("/auth/login?error=Bu sayfayı görüntülemek için giriş yapmanız gerekiyor");
      } else if (user.role !== "BARBER" && user.role !== "ADMIN") {
        router.push("/?error=Bu sayfaya erişim yetkiniz bulunmuyor");
      }
    }
  }, [user, loading, initialized, router]);

  return { 
    user, 
    loading: loading || !initialized, 
    isAuthorized: user?.role === "BARBER" || user?.role === "ADMIN" 
  };
}