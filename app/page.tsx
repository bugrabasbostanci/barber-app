"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { User, LogOut, Calendar, Settings } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Simple reload to update auth state
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl md:text-2xl font-bold">BerberApp</h1>
              </Link>
            </div>

            {!loading && (
              <nav className="flex items-center gap-2">
                {user ? (
                  // Authenticated user menu
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-2"
                      >
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://j508qhyzqd.ufs.sh/f/zFL6Zu9sI4C0PrTlIlRo6ZMBjNEkK8DbuR1VxXhmvcYqS7iU";
                            }}
                          />
                        ) : user.firstName && user.lastName ? (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-medium uppercase border">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </div>
                        ) : (
                          <img
                            src="https://j508qhyzqd.ufs.sh/f/zFL6Zu9sI4C0PrTlIlRo6ZMBjNEkK8DbuR1VxXhmvcYqS7iU"
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                          {user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="flex items-center cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Customer specific menu items */}
                      {user.role === "CUSTOMER" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/my-appointments"
                            className="flex items-center cursor-pointer"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Randevularım</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* Barber specific menu items */}
                      {user.role === "BARBER" && (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/barber/dashboard"
                            className="flex items-center cursor-pointer"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Berber Paneli</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  // Non-authenticated user buttons
                  <>
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs md:text-sm"
                      >
                        Giriş
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" className="text-xs md:text-sm">
                        Kayıt Ol
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Hero Section */}
      <main className="px-4 py-8 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Berber Randevunuz{" "}
            <span className="text-muted-foreground">Artık Çok Kolay</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Online randevu alın, randevularınızı yönetin.
          </p>

          {/* CTA Button */}
          <div className="mt-10">
            {user?.role === "CUSTOMER" ? (
              <Button size="lg" asChild>
                <Link href="/book-appointment">Randevu Al</Link>
              </Button>
            ) : !user ? (
              <Button size="lg" asChild>
                <Link href="/auth/login?redirect=/book-appointment">
                  Randevu Al
                </Link>
              </Button>
            ) : user?.role === "BARBER" || user?.role === "ADMIN" ? (
              <div className="space-y-2">
                <Button size="lg" disabled variant="secondary">
                  Randevu Al
                </Button>
                <p className="text-sm text-muted-foreground">
                  Berber paneline menüden erişebilirsiniz
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Kolay Randevu</h3>
              <p className="text-sm text-muted-foreground">
                Birkaç tıkla randevunuzu oluşturun
              </p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Zaman Yönetimi</h3>
              <p className="text-sm text-muted-foreground">
                Müsait saatleri görün ve seçin
              </p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Mobil Uyumlu</h3>
              <p className="text-sm text-muted-foreground">
                Her cihazdan erişim
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-8">Nasıl Çalışır</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <p className="text-left">Giriş yapın veya kayıt olun</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <p className="text-left">Tarih ve saat seçin</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <p className="text-left">Randevunuzu onaylayın</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 BerberApp. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
