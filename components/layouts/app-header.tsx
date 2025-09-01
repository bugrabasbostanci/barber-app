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
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  backButtonText = "Back",
  backButtonHref = "/",
  extraActions,
  currentPage = "home",
}: AppHeaderProps) {
  const {
    user,
    signOut,
    hydrated,
    initialized,
    loading,
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
      console.log("Starting sign out process...");

      // Call server-side logout with redirect
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.redirected) {
        // Server returned a redirect, follow it
        window.location.href = response.url;
        return;
      }

      // Fallback: client-side signout and navigation
      await signOut();
      console.log("Sign out completed, navigating to home...");
      router.replace("/"); // Use replace instead of push to clear history
    } catch (error) {
      console.error("Sign out error:", error);
      // Force logout by clearing storage and redirecting
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  // User utilities are now provided by AuthContext

  return (
    <header className="bg-background border-b px-4 py-6 sticky top-0 z-50">
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

          <ThemeToggle />

          {/* Separator between extraActions and auth */}
          {(extraActions || true) && (
            <div className="w-px h-6 bg-border mx-1"></div>
          )}
          {!hydrated || loading || !initialized ? (
            // Loading state with proper dimensions to prevent layout shift
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            </div>
          ) : user ? (
            /* Avatar Dropdown Menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 cursor-pointer">
                  {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                      alt="Avatar"
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-600 dark:bg-blue-700 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-sm text-foreground">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>

                {/* Show Profile link only for CUSTOMER role and not on profile page */}
                {isCustomer() && currentPage !== "profile" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Customer specific menu items - only show for CUSTOMER role */}
                {isCustomer() && currentPage !== "appointments" && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-appointments">
                      <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm font-medium">My Appointments</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Show Home link for customer pages */}
                {(currentPage === "profile" ||
                  currentPage === "appointments") && (
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm font-medium">Home</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Barber specific menu items */}
                {(() => {
                  const canAccess = canAccessBarberPanel();
                  console.log('DEBUG - User info:', {
                    user: user,
                    role: user?.role,
                    canAccessBarberPanel: canAccess,
                    isStaff: user?.role && ['EMPLOYEE', 'BARBER', 'ADMIN'].includes(user.role)
                  });
                  return canAccess;
                })() && (
                  <DropdownMenuItem asChild>
                    <Link href="/barber/dashboard">
                      <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm font-medium">Barber Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Role-specific items are now immediately available through AuthContext */}

                <div className="border-t border-border my-1"></div>

                <DropdownMenuItem
                  className="flex items-center cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Non-authenticated user buttons - maintain consistent spacing
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs md:text-sm h-10"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-xs md:text-sm h-10">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle for home page */}
      {!showBackButton && (
        <p className="text-muted-foreground text-sm mt-1">Men&apos;s Club</p>
      )}
    </header>
  );
}
