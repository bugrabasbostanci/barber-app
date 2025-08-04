'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Global Error:', error)
    
    // You can integrate with error tracking services here
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Bir şeyler ters gitti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center text-sm">
                Uygulamada beklenmeyen bir hata oluştu. Bu durumu çözmek için çalışıyoruz.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-800 font-mono">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-1">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={reset} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Sorun devam ederse lütfen bizimle iletişime geçin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}