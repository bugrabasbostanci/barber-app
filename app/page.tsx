"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  User,
  LogOut,
  Settings,
  Scissors,
  Zap,
  Sparkles,
  Crown,
  Star,
  Award,
} from "lucide-react";

// Berber hizmetleri
const services = [
  {
    id: 1,
    name: "Saç Tıraşı",
    description: "Profesyonel saç kesimi ve şekillendirme",
    icon: Scissors,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Sakal Tıraşı",
    description: "Profesyonel sakal kesimi ve düzenleme",
    icon: Award,
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Çocuk Tıraşı",
    description: "Çocuklar için özel tıraş hizmeti",
    icon: Star,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Ağda",
    description: "Profesyonel ağda uygulaması",
    icon: Zap,
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Maske",
    description: "Cilt bakım maskesi uygulaması",
    icon: Sparkles,
    color: "bg-pink-500",
  },
  {
    id: 6,
    name: "Yıkama/Fön",
    description: "Saç yıkama ve fön çekme",
    icon: Crown,
    color: "bg-cyan-500",
  },
  {
    id: 7,
    name: "Saç Maskesi",
    description: "Besleyici saç maskesi uygulaması",
    icon: Sparkles,
    color: "bg-indigo-500",
  },
  {
    id: 8,
    name: "Kaş Düzenleme",
    description: "İp/Ağda/Cımbız ile kaş düzenleme",
    icon: Star,
    color: "bg-teal-500",
  },
  {
    id: 9,
    name: "Tek Renk Saç Boyası",
    description: "Profesyonel saç boyama hizmeti",
    icon: Crown,
    color: "bg-red-500",
  },
  {
    id: 10,
    name: "Damat Tıraşı",
    description: "Özel gün için premium tıraş paketi",
    icon: Award,
    color: "bg-yellow-500",
  },
];

const ServicesList = () => {
  return (
    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
      {services.map((service) => (
        <div
          key={service.id}
          className="px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {service.name}
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const hydrated = useAuthStore((state) => state.hydrated);

  const handleSignOut = async () => {
    try {
      await signOut();
      // No reload needed - Zustand handles state update smoothly
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Generate user initials from first and last name or email
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return user.firstName.charAt(0) + user.lastName.charAt(0);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split("@")[0] || "Kullanıcı";
  };

  const isUserDataComplete = () => {
    return user?.firstName && user?.lastName && user?.role;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Avatar Dropdown */}
      <header className="bg-white border-b px-4 py-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <h1 className="text-2xl font-bold">The Barber Shop</h1>
            </Link>
            <p className="text-gray-500 text-sm">Men&apos;s Club</p>
          </div>

          <div className="flex items-center gap-2">
            {!hydrated || loading ? (
              // Minimal loading - faster UX
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse opacity-60"></div>
            ) : user ? (
              /* Avatar Dropdown Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-10 h-10 cursor-pointer">
                    {user.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={user.user_metadata.avatar_url}
                        alt="Avatar"
                      />
                    ) : (
                      <AvatarFallback className="bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                        {getUserInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="px-4 py-3 border-b border-gray-100">
                    {isUserDataComplete() ? (
                      <>
                        <p className="font-semibold text-sm text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                        <div className="text-xs text-blue-500 mt-1">
                          Bilgiler yükleniyor...
                        </div>
                      </>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Profil</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Customer specific menu items */}
                  {user.role === "CUSTOMER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-appointments">
                        <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm font-medium">
                          Randevularım
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Barber specific menu items */}
                  {user.role === "BARBER" && (
                    <DropdownMenuItem asChild>
                      <Link href="/barber/dashboard">
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm font-medium">
                          Berber Paneli
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Loading state for role-specific items */}
                  {!isUserDataComplete() && (
                    <DropdownMenuItem disabled>
                      <div className="flex items-center w-full">
                        <div className="w-4 h-4 mr-3 bg-gray-200 rounded animate-pulse"></div>
                        <span className="text-sm text-gray-400 animate-pulse">
                          Menü yükleniyor...
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <DropdownMenuItem>
                    <button
                      className="flex items-center w-full text-left"
                      onClick={() => {
                        handleSignOut();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Çıkış Yap</span>
                    </button>
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
          </div>
        </div>
      </header>

      <div className="px-4 py-8 pb-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Randevunuzu Alın</h2>
          <p className="text-gray-500 mb-8">
            Deneyimli berberlerimizden profesyonel hizmet alın
          </p>

          {/* CTA Button */}
          {!hydrated || loading ? (
            // Loading state - prevents role check issues
            <Button
              size="lg"
              disabled
              className="w-full h-16 text-xl font-semibold rounded-2xl opacity-60"
            >
              <div className="animate-pulse">Yükleniyor...</div>
            </Button>
          ) : user?.role === "CUSTOMER" ? (
            // Customer: Active appointment button
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/book-appointment">
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          ) : !user ? (
            // Guest: Login redirect
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/auth/login?redirect=/book-appointment">
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          ) : user?.role === "BARBER" || user?.role === "ADMIN" ? (
            // Barber: Disabled with explanation
            <div className="space-y-2">
              <Button
                size="lg"
                disabled
                variant="secondary"
                className="w-full h-16 text-xl font-semibold rounded-2xl"
              >
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-sm text-gray-500">
                Berber paneline menüden erişebilirsiniz
              </p>
            </div>
          ) : (
            // Fallback: Unknown role, allow login attempt
            <Button
              size="lg"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
              asChild
            >
              <Link href="/auth/login?redirect=/book-appointment">
                Randevu Al
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        {/* Services Marquee */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-6 text-center flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Hizmetlerimiz
          </h3>
          <ServicesList />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">45 Dakika</p>
            <p className="text-sm text-gray-500">Tam hizmet</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-2xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">Önceden Rezervasyon</p>
            <p className="text-sm text-gray-500">7 gün öncesine kadar</p>
          </div>
        </div>

        {/* Hours */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Çalışma Saatleri</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Pazartesi - Cumartesi</span>
                <span className="font-medium">09:30 - 21:30</span>
              </div>
              <div className="flex justify-between">
                <span>Pazar</span>
                <span className="text-red-500 font-medium">Kapalı</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        {!hydrated || loading ? (
          // Loading state - consistent with hero CTA
          <Button
            size="lg"
            disabled
            className="w-full h-16 text-xl font-semibold rounded-2xl opacity-60"
          >
            <div className="animate-pulse">Yükleniyor...</div>
          </Button>
        ) : user?.role === "CUSTOMER" ? (
          // Customer: Active appointment button
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/book-appointment">
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        ) : !user ? (
          // Guest: Login redirect
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/auth/login?redirect=/book-appointment">
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        ) : user?.role === "BARBER" || user?.role === "ADMIN" ? (
          // Barber: Disabled with explanation
          <div className="space-y-2">
            <Button
              size="lg"
              disabled
              variant="secondary"
              className="w-full h-16 text-xl font-semibold rounded-2xl"
            >
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Berber paneline menüden erişebilirsiniz
            </p>
          </div>
        ) : (
          // Fallback: Unknown role, allow login attempt
          <Button
            size="lg"
            className="w-full h-16 text-xl font-semibold rounded-2xl"
            asChild
          >
            <Link href="/auth/login?redirect=/book-appointment">
              Randevunuzu Alın
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
