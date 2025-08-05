"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Phone } from 'lucide-react';
import { RegisterFormProps, RegisterData } from '../types/auth.types';
import { AuthService } from '../services/authService';
import { cn } from "@/lib/utils";

export function RegisterForm({ 
  onSubmit, 
  loading = false, 
  error, 
  showLoginLink = true 
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // First Name
    if (!formData.firstName.trim()) {
      errors.firstName = 'Ad gereklidir';
    } else if (!AuthService.isAlphaWithSpaces(formData.firstName)) {
      errors.firstName = 'Sadece harf ve boşluk kullanabilirsiniz';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      errors.lastName = 'Soyad gereklidir';
    } else if (!AuthService.isAlphaWithSpaces(formData.lastName)) {
      errors.lastName = 'Sadece harf ve boşluk kullanabilirsiniz';
    }

    // Email
    if (!formData.email) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password
    if (!formData.password) {
      errors.password = 'Şifre gereklidir';
    } else {
      const passwordValidation = AuthService.validatePassword(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Phone (optional but if provided, should be valid)
    if (formData.phone && !AuthService.validatePhone(formData.phone)) {
      errors.phone = 'Geçerli bir telefon numarası girin';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
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

  const getFieldStatus = (field: keyof RegisterData) => {
    const value = formData[field];
    if (!value) return 'default';
    if (validationErrors[field]) return 'error';
    return 'success';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Kayıt Ol</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                Ad
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Adınız"
                  disabled={loading}
                  className={cn(
                    validationErrors.firstName && 'border-red-500',
                    getFieldStatus('firstName') === 'success' && 'border-green-500'
                  )}
                />
                {getFieldStatus('firstName') === 'success' && (
                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                )}
              </div>
              {validationErrors.firstName && (
                <p className="text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Soyadınız"
                  disabled={loading}
                  className={cn(
                    validationErrors.lastName && 'border-red-500',
                    getFieldStatus('lastName') === 'success' && 'border-green-500'
                  )}
                />
                {getFieldStatus('lastName') === 'success' && (
                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                )}
              </div>
              {validationErrors.lastName && (
                <p className="text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ornek@email.com"
                disabled={loading}
                className={cn(
                  validationErrors.email && 'border-red-500',
                  getFieldStatus('email') === 'success' && 'border-green-500'
                )}
              />
              {getFieldStatus('email') === 'success' && (
                <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
            </div>
            {validationErrors.email && (
              <p className="text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Telefon (Opsiyonel)
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="05xx xxx xx xx"
                disabled={loading}
                className={cn(
                  validationErrors.phone && 'border-red-500',
                  getFieldStatus('phone') === 'success' && 'border-green-500'
                )}
              />
              {getFieldStatus('phone') === 'success' && (
                <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
            </div>
            {validationErrors.phone && (
              <p className="text-sm text-red-600">{validationErrors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Şifrenizi girin"
                disabled={loading}
                className={cn(
                  validationErrors.password && 'border-red-500',
                  getFieldStatus('password') === 'success' && 'border-green-500'
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
            <div className="text-xs text-gray-500">
              En az 6 karakter, büyük/küçük harf ve rakam içermeli
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Kayıt oluşturuluyor...</span>
              </div>
            ) : (
              'Kayıt Ol'
            )}
          </Button>

          {showLoginLink && (
            <div className="text-center text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link 
                href="/auth/login" 
                className="text-blue-600 hover:underline"
              >
                Giriş yap
              </Link>
            </div>
          )}

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center">
            Kayıt olarak{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}