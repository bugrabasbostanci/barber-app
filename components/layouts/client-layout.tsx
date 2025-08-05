"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppContextsProvider } from '@/contexts/app-contexts';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppHeader } from '@/components/layouts/app-header';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Check if current page is an auth page or barber page
  const isAuthPage = pathname.startsWith('/auth');
  const isBarberPage = pathname.startsWith('/barber');

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

  // If it's a barber page, don't wrap with providers (handled by BarberLayout)
  if (isBarberPage) {
    return <div>{children}</div>;
  }

  return (
    <QueryProvider>
      <AppContextsProvider>
        <div className="min-h-screen bg-background text-foreground">
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
    </QueryProvider>
  );
}