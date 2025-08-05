"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { ForgotPasswordFormProps, ResetPasswordData } from '../types/auth.types';
import { AuthService } from '../services/authService';

export function PasswordResetForm({ 
  onSubmit, 
  loading = false, 
  error, 
  showLoginLink = true 
}: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordData>({
    email: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
      setIsSubmitted(true);
    }
  };

  const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">E-posta Gönderildi</h3>
          
          <p className="text-gray-600 mb-6">
            Şifre sıfırlama bağlantısı <strong>{formData.email}</strong> adresine gönderildi.
            E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
          </p>

          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              E-postayı göremiyorsanız spam klasörünüzü kontrol edin.
            </div>
            
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Tekrar Gönder
            </Button>

            {showLoginLink && (
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Giriş sayfasına dön
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Şifre Sıfırla</CardTitle>
        <p className="text-center text-gray-600">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              E-posta Adresi
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ornek@email.com"
              disabled={loading}
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Gönderiliyor...</span>
              </div>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </Button>

          {showLoginLink && (
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">
                Şifrenizi hatırladınız mı?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:underline"
                >
                  Giriş yap
                </Link>
              </div>
              
              <div className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-blue-600 hover:underline"
                >
                  Kayıt ol
                </Link>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}