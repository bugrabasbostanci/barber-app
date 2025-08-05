"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Lock, User } from 'lucide-react';
import { AuthGuardProps } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requiredRole,
  fallback,
  redirectTo 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const loginUrl = redirectTo || `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      router.push(loginUrl);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && user && !hasRole(requiredRole)) {
      // Don't redirect, just show the unauthorized message
      return;
    }
  }, [loading, isAuthenticated, user, requireAuth, requiredRole, hasRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Giriş Gerekli</h3>
            
            <p className="text-gray-600 mb-6">
              Bu sayfaya erişmek için giriş yapmanız gerekiyor.
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Giriş Yap
              </Button>
              
              <Button 
                onClick={() => router.push('/auth/register')}
                variant="outline"
                className="w-full"
              >
                Kayıt Ol
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user && !hasRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    
    const roleNames = {
      customer: 'Müşteri',
      barber: 'Berber',
      admin: 'Yönetici'
    };

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-amber-600" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Yetkisiz Erişim</h3>
            
            <p className="text-gray-600 mb-2">
              Bu sayfaya erişmek için <strong>{roleNames[requiredRole]}</strong> yetkisine sahip olmanız gerekiyor.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Mevcut yetkiniz: <strong>{roleNames[user.role]}</strong>
            </p>

            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-left">
                Eğer bu bir hata olduğunu düşünüyorsanız, lütfen sistem yöneticisi ile iletişime geçin.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                Ana Sayfaya Dön
              </Button>
              
              {user.role === 'customer' && (
                <Button 
                  onClick={() => router.push('/update-role')}
                  variant="outline"
                  className="w-full"
                >
                  Berber Olmak İçin Başvur
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If everything is ok, render children
  return <>{children}</>;
}