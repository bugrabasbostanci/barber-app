"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/auth-context';

export function useRequireAuth(requiredRole?: string) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading && !user) {
      router.push("/auth/login?error=You need to log in to view this page");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/?error=You do not have permission to access this page");
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
  const { user, loading, initialized, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading) {
      if (!user) {
        router.push("/auth/login?error=You need to log in to view this page");
      } else if (user.role !== "CUSTOMER") {
        router.push("/?error=You do not have permission to access this page");
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
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!loading) {
      if (!user) {
        router.push("/auth/login?error=You need to log in to view this page");
      } else if (user.role !== "BARBER" && user.role !== "ADMIN") {
        router.push("/?error=You do not have permission to access this page");
      }
    }
  }, [user, loading, initialized, router]);

  return { 
    user, 
    loading: loading || !initialized, 
    isAuthorized: user?.role === "BARBER" || user?.role === "ADMIN" 
  };
}