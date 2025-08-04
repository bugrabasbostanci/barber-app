'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log customer-specific errors
    console.error('Customer Route Error:', error)
    
    // Track customer journey errors
    // Analytics: Track where customers are experiencing issues
  }, [error])

  // Common customer error scenarios
  const getErrorMessage = () => {
    if (error.message.includes('appointment')) {
      return {
        title: 'Randevu İşleminde Sorun',
        description: 'Randevu işleminiz sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        suggestions: [
          'Randevu saatinin müsait olduğundan emin olun',
          'İnternet bağlantınızı kontrol edin',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else if (error.message.includes('profile')) {
      return {
        title: 'Profil Güncellemesinde Sorun',
        description: 'Profil bilgileriniz güncellenirken bir hata oluştu.',
        suggestions: [
          'Tüm gerekli alanları doldurun',
          'Telefon numaranızın doğru formatta olduğundan emin olun',
          'Sayfayı yenilemeyi deneyin'
        ]
      }
    } else {
      return {
        title: 'Beklenmeyen Bir Hata Oluştu',
        description: 'İşleminizi gerçekleştirirken bir sorun yaşandı.',
        suggestions: [
          'Sayfayı yenilemeyi deneyin',
          'İnternet bağlantınızı kontrol edin',
          'Birkaç dakika sonra tekrar deneyin'
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
              Tekrar Dene
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
                onClick={() => window.location.href = '/book-appointment'} 
                variant="outline"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Randevu Al
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Sorun devam ederse müşteri destek hattımızdan yardım alabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}