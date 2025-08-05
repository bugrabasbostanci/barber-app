"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, Home } from "lucide-react";
import { ThemeToggleIcon } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

interface BarberPageHeaderProps {
  children: ReactNode;
}

export function BarberPageHeader({ children }: BarberPageHeaderProps) {
  const {
    user,
    loading,
    signOut,
    hydrated,
    getDisplayName,
    getUserInitials,
  } = useAuth();
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-background border-b border-border px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and title */}
        <div className="flex items-center flex-1">
          {children}
        </div>

        {/* Right side - Theme toggle and avatar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggleIcon />
          
          {/* Avatar Menu */}
          {!hydrated || loading ? (
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                    {getUserInitials() || "B"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-sm text-foreground">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary font-medium">Berber</p>
                </DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-3 text-muted-foreground" />
                    <span className="text-sm font-medium">Ana Sayfa</span>
                  </Link>
                </DropdownMenuItem>

                <div className="border-t border-border my-1"></div>

                <DropdownMenuItem
                  className="flex items-center cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm font-medium">Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}