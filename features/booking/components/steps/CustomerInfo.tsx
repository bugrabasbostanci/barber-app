"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Phone, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import { CustomerInfoProps } from '../../types/booking.types';
import { BookingService } from '../../services/bookingService';
import { ValidationUtils } from '@/shared';

export function CustomerInfo({ 
  customerInfo, 
  onUpdate, 
  phoneError, 
  onPhoneChange 
}: CustomerInfoProps) {
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'Ad gereklidir';
        } else if (!ValidationUtils.isAlphaWithSpaces(value)) {
          errors.firstName = 'Sadece harf ve boşluk kullanabilirsiniz';
        } else {
          delete errors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Soyad gereklidir';
        } else if (!ValidationUtils.isAlphaWithSpaces(value)) {
          errors.lastName = 'Sadece harf ve boşluk kullanabilirsiniz';
        } else {
          delete errors.lastName;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Telefon numarası gereklidir';
        } else if (!BookingService.validatePhoneNumber(value)) {
          errors.phone = 'Geçerli bir telefon numarası girin (örn: 05xx xxx xx xx)';
        } else {
          delete errors.phone;
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof customerInfo, value: string) => {
    onUpdate({ [field]: value });
    
    // Real-time validation
    validateField(field, value);
    
    // Special handling for phone
    if (field === 'phone') {
      const isValid = BookingService.validatePhoneNumber(value);
      onPhoneChange?.(value, isValid ? undefined : 'Geçerli telefon numarası girin');
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    // Notes should be handled separately as part of BookingData, not CustomerInfo
  };

  const getFieldStatus = (field: string, value?: string) => {
    if (!value) return 'default';
    if (validationErrors[field]) return 'error';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">İletişim Bilgileri</h3>
        <p className="text-gray-600">
          Randevu onayı için bilgilerinizi girin
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Ad *
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  value={customerInfo.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Adınız"
                  className={validationErrors.firstName ? 'border-red-500' : ''}
                />
                {customerInfo.firstName && !validationErrors.firstName && (
                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                )}
              </div>
              {validationErrors.firstName && (
                <p className="text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Soyad *
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={customerInfo.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Soyadınız"
                  className={validationErrors.lastName ? 'border-red-500' : ''}
                />
                {customerInfo.lastName && !validationErrors.lastName && (
                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                )}
              </div>
              {validationErrors.lastName && (
                <p className="text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Telefon Numarası *
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="05xx xxx xx xx"
                className={phoneError || validationErrors.phone ? 'border-red-500' : ''}
              />
              {customerInfo.phone && !phoneError && !validationErrors.phone && (
                <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
            </div>
            {(phoneError || validationErrors.phone) && (
              <p className="text-sm text-red-600">{phoneError || validationErrors.phone}</p>
            )}
            <p className="text-xs text-gray-500">
              Randevu onayı ve hatırlatması için kullanılacak
            </p>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notlar (Opsiyonel)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Özel istek veya notlarınızı yazabilirsiniz..."
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Berberinize özel isteklerinizi iletebilirsiniz</span>
              <span>{notes.length}/200</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Gizlilik:</strong> Bilgileriniz sadece randevu yönetimi için kullanılır ve 
          üçüncü şahıslarla paylaşılmaz.
        </AlertDescription>
      </Alert>

      {/* Form Status */}
      {customerInfo.firstName && customerInfo.lastName && customerInfo.phone && 
       !phoneError && Object.keys(validationErrors).length === 0 && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Bilgiler tamamlandı</span>
          </div>
        </div>
      )}
    </div>
  );
}