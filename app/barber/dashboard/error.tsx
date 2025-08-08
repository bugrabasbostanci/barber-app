'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function BarberDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log barber dashboard errors
    console.error('Barber Dashboard Error:', error)
    
    // Track barber dashboard errors for analytics
    // This helps identify common issues barbers face
  }, [error])

  // Common barber dashboard error scenarios
  const getErrorMessage = () => {
    if (error.message.includes('appointment')) {
      return {
        title: 'Randevu Verilerinde Sorun',
        description: 'Randevu bilgileri yüklenirken bir hata oluştu. Panel verileriniz güncel olmayabilir.',
        suggestions: [
          'Randevu verilerinin senkronize olmasını bekleyin',
          'İnternet bağlantınızı kontrol edin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else if (error.message.includes('statistics') || error.message.includes('dashboard')) {
      return {
        title: 'Dashboard İstatistiklerinde Sorun',
        description: 'İstatistik ve özet bilgiler yüklenirken bir hata oluştu.',
        suggestions: [
          'Veri senkronizasyonunun tamamlanmasını bekleyin',
          'Tarayıcı önbelleğini temizlemeyi deneyin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else if (error.message.includes('calendar')) {
      return {
        title: 'Takvim Verilerinde Sorun',
        description: 'Takvim ve program bilgileri yüklenirken bir hata oluştu.',
        suggestions: [
          'Takvim senkronizasyonunu kontrol edin',
          'Program ayarlarınızı gözden geçirin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else {
      return {
        title: 'Dashboard Yükleme Sorunu',
        description: 'Berber paneli yüklenirken beklenmeyen bir hata oluştu.',
        suggestions: [
          'Sayfayı yenilemeyi deneyin',
          'İnternet bağlantınızı kontrol edin',
          'Tarayıcınızı yeniden başlatmayı deneyin'
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
              Paneli Yenile
            </Button>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => window.location.href = '/barber/dashboard'} 
                variant="outline"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Panel
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/barber/appointments'} 
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Randevular
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-1" />
                Ana Sayfa
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Sorun devam ederse teknik destek ile iletişime geçebilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}