'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, User, Settings, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log profile-specific errors
    console.error('Profile Error:', error)
    
    // Track profile management errors
  }, [error])

  // Profile-specific error handling
  const getProfileErrorInfo = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('validation') || message.includes('phone') || message.includes('telefon')) {
      return {
        title: 'Bilgi Doğrulama Hatası',
        description: 'Girdiğiniz bilgilerde bir sorun var.',
        icon: <Settings className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Telefon numaranızı 0532 123 45 67 formatında girin',
          'Ad ve soyad alanlarını boş bırakmayın',
          'Geçerli bir e-posta adresi kullanın'
        ]
      }
    } else if (message.includes('save') || message.includes('update') || message.includes('kaydet')) {
      return {
        title: 'Profil Kaydetme Hatası',
        description: 'Profil bilgileriniz kaydedilirken bir hata oluştu.',
        icon: <User className="w-8 h-8 text-red-600" />,
        suggestions: [
          'İnternet bağlantınızı kontrol edin',
          'Tüm alanları doğru doldurduğunuzdan emin olun',
          'Birkaç dakika bekleyip tekrar deneyin'
        ]
      }
    } else if (message.includes('auth') || message.includes('permission') || message.includes('yetki')) {
      return {
        title: 'Yetkilendirme Hatası',
        description: 'Bu işlem için gerekli yetkiniz bulunmuyor.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Oturumunuzu kapatıp tekrar açın',
          'Sayfayı yenileyin',
          'Hesabınızla giriş yaptığınızdan emin olun'
        ]
      }
    } else {
      return {
        title: 'Profil İşleminde Sorun',
        description: 'Profil sayfasında beklenmeyen bir hata oluştu.',
        icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
        suggestions: [
          'Sayfayı yenileyin',
          'Tarayıcınızın çerezlerini temizleyin',
          'Farklı bir tarayıcı deneyin'
        ]
      }
    }
  }

  const errorInfo = getProfileErrorInfo()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {errorInfo.icon}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {errorInfo.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile form guidance */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">Profil bilgileri:</p>
                <div className="text-xs space-y-1">
                  <div>• <strong>Ad-Soyad:</strong> En az 2 karakter, sadece harf</div>
                  <div>• <strong>Telefon:</strong> 0532 123 45 67 formatında</div>
                  <div>• <strong>E-posta:</strong> Geçerli bir e-posta adresi</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

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
              Profili Yeniden Yükle
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

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Güvenlik:</strong> Kişisel bilgileriniz güvenli şekilde korunmaktadır
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}