"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, User, LogOut, Settings, Calendar } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  extraActions?: React.ReactNode;
  currentPage?: "home" | "profile" | "appointments" | string;
}

export function AppHeader({
  title,
  showBackButton = false,
  backButtonText = "Geri",
  backButtonHref = "/",
  extraActions,
  currentPage = "home",
}: AppHeaderProps) {
  const {
    user,
    loading,
    signOut,
    hydrated,
    getDisplayName,
    getUserInitials,
    isCustomer,
    canAccessBarberPanel,
  } = useAuth();
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await signOut();
      // Use Next.js router for smooth navigation without page reload
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // User utilities are now provided by AuthContext

  return (
    <header className="bg-white border-b px-4 py-6 sticky top-0 z-50">
      <div className="flex items-center">
        {/* Left side - Back button or Logo */}
        <div className="flex-shrink-0">
          {showBackButton ? (
            <Link href={backButtonHref}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {backButtonText}
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <h1 className="text-2xl font-bold">The Barber Shop</h1>
            </Link>
          )}
        </div>

        {/* Center - Title */}
        {title && showBackButton && (
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-lg">{title}</h1>
          </div>
        )}

        {/* Spacer for home page to push avatar to right */}
        {!showBackButton && !title && <div className="flex-1"></div>}

        {/* Right side - Extra actions + Auth section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {extraActions}

          {/* Separator between extraActions and auth */}
          {extraActions && <div className="w-px h-6 bg-gray-200 mx-1"></div>}
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
                  <p className="font-semibold text-sm text-gray-900">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </DropdownMenuLabel>

                {/* Show Profile link only if not on profile page */}
                {currentPage !== "profile" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Profil</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Customer specific menu items */}
                {isCustomer() && currentPage !== "appointments" && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-appointments">
                      <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Randevularım</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Show Home link for customer pages */}
                {(currentPage === "profile" ||
                  currentPage === "appointments") && (
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Ana Sayfa</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Barber specific menu items */}
                {canAccessBarberPanel() && (
                  <DropdownMenuItem asChild>
                    <Link href="/barber/dashboard">
                      <Settings className="w-4 h-4 mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Berber Paneli</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Role-specific items are now immediately available through AuthContext */}

                <div className="border-t border-gray-100 my-1"></div>

                <DropdownMenuItem
                  className="flex items-center cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">Çıkış Yap</span>
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

      {/* Subtitle for home page */}
      {!showBackButton && (
        <p className="text-gray-500 text-sm mt-1">Men&apos;s Club</p>
      )}
    </header>
  );
}
