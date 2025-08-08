'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, BarChart3, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BarberError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log barber-specific errors
    console.error('Barber Route Error:', error)
    
    // Track barber management errors for analytics
    // Important for business operations tracking
  }, [error])

  // Common barber system error scenarios
  const getErrorMessage = () => {
    if (error.message.includes('auth') || error.message.includes('permission')) {
      return {
        title: 'Yetkilendirme Sorunu',
        description: 'Berber paneline erişim yetkiniz doğrulanırken bir hata oluştu.',
        suggestions: [
          'Oturum bilgilerinizi kontrol edin',
          'Yeniden giriş yapmayı deneyin',
          'Berber hesabı yetkilerinizi kontrol edin'
        ]
      }
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Bağlantı Sorunu',
        description: 'Berber paneli verilerine erişirken bağlantı sorunu yaşandı.',
        suggestions: [
          'İnternet bağlantınızı kontrol edin',
          'VPN kullanıyorsanız kapatmayı deneyin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else if (error.message.includes('data') || error.message.includes('load')) {
      return {
        title: 'Veri Yükleme Sorunu',
        description: 'Berber paneli verileri yüklenirken bir hata oluştu.',
        suggestions: [
          'Veri senkronizasyonunu bekleyip tekrar deneyin',
          'Tarayıcı önbelleğini temizleyin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else if (error.message.includes('session') || error.message.includes('expire')) {
      return {
        title: 'Oturum Süresi Sorunu',
        description: 'Oturum süreniz dolmuş veya geçersiz hale gelmiş olabilir.',
        suggestions: [
          'Yeniden giriş yapın',
          'Oturum bilgilerini yenileyin',
          'Tarayıcıyı yeniden başlatın'
        ]
      }
    } else {
      return {
        title: 'Berber Paneli Sorunu',
        description: 'Berber yönetim paneli yüklenirken beklenmeyen bir hata oluştu.',
        suggestions: [
          'Sayfayı yenilemeyi deneyin',
          'Tarayıcıyı yeniden başlatın',
          'Farklı tarayıcı ile deneyin'
        ]
      }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {errorInfo.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error suggestions */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Çözüm önerileri:</p>
                <ul className="text-xs space-y-1 ml-2">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-800 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-1">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={reset} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Berber Panelini Yenile
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Ana Sayfa
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/auth/login'} 
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Giriş Yap
              </Button>
            </div>
            
            {/* Quick access to main barber sections (if accessible) */}
            <div className="grid grid-cols-3 gap-1 mt-2">
              <Button 
                onClick={() => window.location.href = '/barber/dashboard'} 
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Panel
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/barber/calendar'} 
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Takvim
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/barber/schedule'} 
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Program
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Sorun devam ederse sistem yöneticisi ile iletişime geçin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}