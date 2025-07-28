"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile-First Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">BerberApp</h1>
              </Link>
            </div>
            
            {!loading && (
              <nav className="flex items-center gap-2">
                {user ? (
                  // Authenticated user menu
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                          {user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-appointments" className="flex items-center cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Randevularım</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/barber/dashboard" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Berber Paneli</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Ayarlar</span>
                        </Link>
                      </DropdownMenuItem>
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
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
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
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            <span className="block">Berber Randevunuz</span>
            <span className="block text-blue-600 mt-2">Artık Çok Kolay</span>
          </h1>
          <p className="mt-4 text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Online randevu alın, randevularınızı yönetin. Berber salonları için modern randevu yönetim sistemi.
          </p>
          
          {/* Mobile-First CTA Buttons */}
          <div className="mt-8 space-y-3 md:space-y-0 md:flex md:gap-4 md:justify-center">
            <Link href="/book-appointment" className="block md:inline-block">
              <Button size="lg" className="w-full md:w-auto text-base md:text-lg px-8 py-3 md:py-4">
                📅 Randevu Al
              </Button>
            </Link>
            <Link href="/admin" className="block md:inline-block">
              <Button variant="outline" size="lg" className="w-full md:w-auto text-base md:text-lg px-8 py-3 md:py-4">
                ⚙️ Yönetici Paneli
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile-First Features Grid */}
        <div className="mt-16 md:mt-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-blue-500 text-white text-2xl mb-4">
                  📅
                </div>
                <CardTitle className="text-lg md:text-xl">Kolay Randevu</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Birkaç dokunuşla randevunuzu oluşturun
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white text-2xl mb-4">
                  ⏰
                </div>
                <CardTitle className="text-lg md:text-xl">Zaman Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Müsait saatleri görün ve seçin
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-purple-500 text-white text-2xl mb-4">
                  📱
                </div>
                <CardTitle className="text-lg md:text-xl">Mobil Odaklı</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base">
                  Telefonunuzdan kolay erişim
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Start Section for Mobile */}
        <div className="mt-16 md:mt-20">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl">Hemen Başlayın</CardTitle>
              <CardDescription>3 adımda randevu alın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm md:text-base">Giriş yapın veya kayıt olun</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm md:text-base">Tarih ve saat seçin</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm md:text-base">Randevunuzu onaylayın</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile-First Footer */}
      <footer className="bg-gray-50 mt-16 md:mt-24 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">&copy; 2024 BerberApp. Tüm hakları saklıdır.</p>
          <p className="text-xs text-gray-400 mt-2">Mobil cihazlar için optimize edilmiştir</p>
        </div>
      </footer>
    </div>
  );
}
