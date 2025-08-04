"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/providers/auth-provider';
import { AppHeader } from '@/components/layouts/app-header';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Determine page configuration based on pathname
  const getPageConfig = () => {
    switch (pathname) {
      case '/':
        return {
          title: undefined,
          showBackButton: false,
          currentPage: 'home'
        };
      case '/profile':
        return {
          title: 'Profil',
          showBackButton: true,
          currentPage: 'profile'
        };
      case '/my-appointments':
        return {
          title: 'Randevularım',
          showBackButton: true,
          currentPage: 'appointments'
        };
      case '/book-appointment':
        return {
          title: 'Randevu Al',
          showBackButton: true,
          currentPage: 'book-appointment'
        };
      default:
        return {
          title: undefined,
          showBackButton: false,
          currentPage: 'other'
        };
    }
  };

  const pageConfig = getPageConfig();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <AppHeader
          title={pageConfig.title}
          showBackButton={pageConfig.showBackButton}
          currentPage={pageConfig.currentPage}
        />
        <div>{children}</div>
      </div>
    </AuthProvider>
  );
}