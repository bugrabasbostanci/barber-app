"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppContextsProvider } from '@/contexts/app-contexts';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppHeader } from '@/components/layouts/app-header';
import { ThemeProvider } from '@/components/theme-provider';

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

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <AppContextsProvider>
          <div className="min-h-screen bg-background text-foreground">
            {/* Only show AppHeader for non-auth and non-barber pages */}
            {!isAuthPage && !isBarberPage && (
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
    </ThemeProvider>
  );
}