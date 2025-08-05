"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BarberAuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking barber auth...");
        const response = await fetch("/api/auth/check-role");
        
        if (!response.ok) {
          console.log("Auth check failed with status:", response.status);
          router.push("/auth/login");
          return;
        }
        
        const data = await response.json();
        console.log("Auth check response:", data);
        
        if (!data.success) {
          console.log("Auth check not successful");
          router.push("/auth/login");
          return;
        }
        
        if (data.role !== "BARBER") {
          console.log("User role is not BARBER, role:", data.role);
          // Instead of redirecting to login, show an error or redirect to appropriate page
          if (data.role === "CUSTOMER") {
            alert("Bu sayfaya erişim yetkiniz yok. Müşteri paneline yönlendiriliyorsunuz.");
            router.push("/");
          } else {
            alert("Bu sayfaya erişim yetkiniz yok.");
            router.push("/auth/login");
          }
          return;
        }
        
        console.log("Auth check successful for BARBER role");
      } catch (error) {
        console.error("Auth check failed:", error);
        alert("Kimlik doğrulama hatası. Lütfen tekrar giriş yapın.");
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // This component doesn't render anything
}