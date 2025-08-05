'use client';

import { ReactNode } from 'react';
import { BarberAuthCheck } from '@/components/auth/barber-auth-check';
import { AppContextsProvider } from '@/contexts/app-contexts';
import { QueryProvider } from '@/providers/QueryProvider';

interface BarberLayoutProps {
  children: ReactNode;
}

export default function BarberLayout({ children }: BarberLayoutProps) {
  // Berber sayfaları için layout - contexts ve auth check dahil
  return (
    <QueryProvider>
      <AppContextsProvider>
        <div className="min-h-screen bg-background text-foreground">
          <BarberAuthCheck />
          {children}
        </div>
      </AppContextsProvider>
    </QueryProvider>
  );
}