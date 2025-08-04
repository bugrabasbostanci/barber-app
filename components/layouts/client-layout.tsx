"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppContextsProvider } from '@/contexts/app-contexts';
import { AppHeader } from '@/components/layouts/app-header';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Check if current page is an auth page
  const isAuthPage = pathname.startsWith('/auth');

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
    <AppContextsProvider>
      <div className="min-h-screen bg-white">
        {/* Only show AppHeader for non-auth pages */}
        {!isAuthPage && (
          <AppHeader
            title={pageConfig.title}
            showBackButton={pageConfig.showBackButton}
            currentPage={pageConfig.currentPage}
          />
        )}
        <div>{children}</div>
      </div>
    </AppContextsProvider>
  );
}