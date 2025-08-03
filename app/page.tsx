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
import { signOut } from "@/lib/auth";
import {
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  User,
  LogOut,
  Settings,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload(); // Simple reload to update auth state
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
    return user?.email?.split("@")[0] || "User";
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
            {loading ? (
              // Loading placeholder
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
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
                    <p className="font-semibold text-sm text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
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
          {user?.role === "CUSTOMER" ? (
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
          ) : null}
        </div>

        {/* What's Included */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Hizmetlerimiz
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">
                  Profesyonel saç kesimi ve şekillendirme
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Sakal kesimi ve düzenleme</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Sıcak havlu uygulaması</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
        {user?.role === "CUSTOMER" ? (
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
        ) : null}
      </div>
    </div>
  );
}
